import { RequestAPI } from '@/utils/Requests/RequestAPI';

// O PDF do reporte junta as páginas de cada boleta no servidor, e alguns PDFs não se deixam importar.
// Confere ao escolher o arquivo, porque o upload da boleta acontece depois, em segundo plano.
export class PDFCompatibility {
    public static async check(base64Pdf: string): Promise<'Compatible' | 'Incompatible' | 'Unknown'> {
        try {
            const response = await RequestAPI.post('/invoices/pdf/check', { pdf: base64Pdf });
            return response.compatible ? 'Compatible' : 'Incompatible';
        } catch (error) {
            // Sem internet ou API antiga: o servidor ainda repara o PDF no upload
            return 'Unknown';
        }
    }
}
