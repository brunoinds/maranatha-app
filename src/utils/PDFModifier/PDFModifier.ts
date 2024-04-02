import { VuePdf, createLoadingTask } from 'vue3-pdfjs/esm';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';



export class PDFModifier{
    private pdf: PDFDocumentProxy;


    public constructor(PDFDocumentProxy: PDFDocumentProxy){      
        this.pdf = PDFDocumentProxy;
    }


    private async extractPagesAsImagesAsBase64(){
        let listImagesBase64: string[] = [];
        const canvas = document.createElement('canvas');
        for (let i = 0; i < this.pdf.numPages; i++) {
            const page = await this.pdf.getPage(i+1);
            const viewport = page.getViewport({scale: 2});
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const context = canvas.getContext('2d');
            await page.render({canvasContext: context, viewport}).promise;
            
            const imageData = canvas.toDataURL('image/png');
            listImagesBase64.push(imageData);
        }
        return listImagesBase64;
    }
    private async mergeImagesVerticallyAsBase64(imagesInBase64: string[]){
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const images = await Promise.all(imagesInBase64.map(async (imageBase64) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.onload = () => {
                    resolve(image);
                }
                image.src = imageBase64;
            })
        }))
        canvas.width = images[0].width;
        canvas.height = images[0].height * images.length;
        images.forEach((image, index) => {
            context.drawImage(image, 0, index * image.height);
        })
        return canvas.toDataURL('image/png');
    }

    private async mergeImagesHorizontallyAsBase64(imagesInBase64: string[]){
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const images = await Promise.all(imagesInBase64.map(async (imageBase64) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.onload = () => {
                    resolve(image);
                }
                image.src = imageBase64;
            })
        }))
        canvas.width = images[0].width * images.length;
        canvas.height = images[0].height;
        images.forEach((image, index) => {
            context.drawImage(image, index * image.width, 0);
        })
        return canvas.toDataURL('image/png');
    }

    public pagesCount(): number{
        return this.pdf.numPages;
    }

    public async extractPagesIntoSingleImageAsBase64(): Promise<string>{
        const imagesInBase64 = await this.extractPagesAsImagesAsBase64();
        return this.mergeImagesVerticallyAsBase64(imagesInBase64);
    }

    public static async loadPDF(source: any): Promise<PDFModifier>{
        return new Promise((resolve, reject) => {
            const loadingTask = createLoadingTask(source);
            loadingTask.promise.then((pdf: PDFDocumentProxy) => {
                resolve(new PDFModifier(pdf))
            }).catch((error: any) => {
                reject(error)
            })
        })
    }
}