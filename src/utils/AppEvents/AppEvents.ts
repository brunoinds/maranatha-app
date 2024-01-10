import { EventEmitter } from "@billjs/event-emitter";
import { v4 as uuidv4 } from 'uuid';


class AppEvents{
    private static emitter:any = new EventEmitter();
    private static callbacksRegistry: any = {};
    public static on(event:string, callback:Function): string{
        const callbackId = uuidv4();
        this.callbacksRegistry[callbackId] = () => {
            callback();
        };
        this.emitter.on(event, this.callbacksRegistry[callbackId]);
        return callbackId;
    }
    public static off(event:string, callbackId:string){
        const callback = this.callbacksRegistry[callbackId];
        if (callback === undefined){
            console.warn(`The callback with id "${callbackId}" for "${event}" is not found in the callbacks registry`);
            return;
        }
        this.emitter.off(event, this.callbacksRegistry[callbackId]);
    }
    public static emit(event:string, data:any = {}){
        this.emitter.fire(event, data);
    }
}


export { AppEvents };