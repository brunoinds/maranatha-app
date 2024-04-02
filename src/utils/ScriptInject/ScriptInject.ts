export class ScriptInject{
    public static async inject(src: string, isAsync: boolean): Promise<void>{
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = isAsync;
            script.onload = () => {
                resolve();
            }
            script.onerror = () => {
                reject();
            }
            document.head.appendChild(script);
        });
    }
}