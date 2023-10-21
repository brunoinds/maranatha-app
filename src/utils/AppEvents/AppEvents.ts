import { EventEmitter } from "@billjs/event-emitter";


class AppEvents{
    private static emitter:any = new EventEmitter();
    public static on(event:string, callback:Function){
        this.emitter.on(event, callback);
    }
    public static emit(event:string, data:any = {}){
        this.emitter.fire(event, data);
    }
}


export { AppEvents };