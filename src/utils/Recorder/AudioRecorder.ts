

export class AudioRecorder{
    private stream: MediaStream|null = null;
    private mediaRecorder: MediaRecorder|null = null;
    private chunks: Blob[] = [];
    private status: 'Idle'|'Recording'|'Paused'|'Stopped' = 'Idle';
    public osciloscoperCanvas: HTMLCanvasElement|null = null;

    public constructor(){
        this.stream = null;
        this.mediaRecorder = null;
    }

    private async refreshOsciloscoper(stream: MediaStream){
        const $this = this;
        const canvas = this.osciloscoperCanvas;
        const canvasContext = this.osciloscoperCanvas?.getContext('2d')
    
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);


        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
        drawOsciloscoper();
        function drawOsciloscoper(){
            if (!canvasContext || !canvas){
                return;
            }
            const WIDTH = canvas.width
            const HEIGHT = canvas.height;
            

            if ($this.status == 'Recording'){
                requestAnimationFrame(drawOsciloscoper);
            }else{
                canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
                return;
            }

            analyser.getByteTimeDomainData(dataArray);

            canvasContext.fillStyle = '#0d0d0d';
            canvasContext.shadowColor = 'red';
            canvasContext.shadowBlur = 5;


            canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = 'red';

            canvasContext.beginPath();

            let sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0;
                let y = v * HEIGHT/2;

                if (i === 0){
                    canvasContext.moveTo(x, y);
                }else{
                    canvasContext.lineTo(x, y);
                }
                x += sliceWidth;
            }
            canvasContext.lineTo(canvas.width, canvas.height/2);
            canvasContext.stroke();
        }
    }

    public async startRecording(){
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        })
        this.stream = stream;

        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => {
            this.chunks.push(e.data);
        }
        this.mediaRecorder.start();
        this.status = 'Recording';
        this.refreshOsciloscoper(stream);
    }

    public async stopRecording(): Promise<{blob: Blob, base64: string}>{
        return new Promise((resolve, reject) => {
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, {
                    type: 'audio/ogg; codecs=opus'
                });

                const file = new FileReader();
                file.readAsDataURL(blob);
                file.onloadend = () => {
                    const base64 = file.result?.split(',')[1];
                    resolve({
                        blob,
                        base64
                    })
                }
            };
            this.mediaRecorder.stop();
            this.status = 'Stopped';
        })
        
    }


    public static new(){
        return new AudioRecorder();
    }
}