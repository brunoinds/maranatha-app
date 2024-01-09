import { EventEmitter } from "@billjs/event-emitter";
import { ref } from "vue";

interface IViewportData{
    isMobile: boolean,
    isDesktop: boolean,
    isLandscape: boolean,
    isPortrait: boolean,
    isScreenNarrow: boolean,
    isScreenWide: boolean,
    deviceSetting: 'DesktopLandscape' | 'DesktopPortrait' | 'MobileLandscape' | 'MobilePortrait'   
}

class Viewport{
    private static emitter:any = new EventEmitter();

    public static data = ref<IViewportData>({
        isMobile: this.isMobile(),
        isDesktop: this.isDesktop(),
        isLandscape: this.isLandscape(),
        isPortrait: this.isPortrait(),
        isScreenNarrow: this.isScreenNarrow(),
        isScreenWide: this.isScreenWide(),
        deviceSetting: this.deviceSetting()
    })

    public static isMobile(): boolean{
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const isDesktop = !isMobile;
        return isMobile;
    }
    public static isDesktop(): boolean{
        return !this.isMobile();
    }

    public static isLandscape(): boolean{
        if (screen && screen.orientation){
            return screen.orientation.type.includes('landscape');
        }else{
            return window.innerWidth > window.innerHeight;
        }
    }
    public static isPortrait(): boolean{
        return !this.isLandscape();
    }

    public static deviceSetting(): 'DesktopLandscape' | 'DesktopPortrait' | 'MobileLandscape' | 'MobilePortrait' {
        if(this.isDesktop() && this.isLandscape() && this.isScreenWide()){
            return 'DesktopLandscape';
        }else if((this.isDesktop() && this.isPortrait()) || this.isDesktop() && this.isLandscape() &&  this.isScreenNarrow()){
            return 'DesktopPortrait';
        }else if(this.isMobile() && this.isLandscape()){
            return 'MobileLandscape';
        }else if(this.isMobile() && this.isPortrait()){
            return 'MobilePortrait';
        }

        return 'DesktopLandscape';
    }
    public static isScreenWide(): boolean{
        return window.innerWidth >= 450
    }
    public static isScreenNarrow(): boolean{
        return window.innerWidth < 450
    }

    private static updateInfo(): void{
        this.data.value = {
            isMobile: this.isMobile(),
            isDesktop: this.isDesktop(),
            isLandscape: this.isLandscape(),
            isPortrait: this.isPortrait(),
            isScreenNarrow: this.isScreenNarrow(),
            isScreenWide: this.isScreenWide(),
            deviceSetting: this.deviceSetting()
        }
    }


    public static onChange(callback: (content:IViewportData) => {}): void{
        this.emitter.on("change", (content:any) => {
            callback(content.data);
        });
    }

    public static initListeners(): void{
        window.addEventListener("resize", () => {
            this.updateInfo();
            this.emitter.fire("change", Viewport.data.value);
        });
        window.addEventListener("orientationchange", () => {
            this.updateInfo();
            this.emitter.fire("change", Viewport.data.value);
        })
    }
}

Viewport.initListeners();

export { Viewport };