export class Theme{
    public static getTheme(): 'dark' | 'light'{
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        return prefersDark.matches ? 'dark' : 'light';
    }
    public static setTheme(theme: 'dark' | 'light'){
        document.documentElement.setAttribute('data-theme', theme);
        const toggleDarkPalette = (shouldAdd:boolean) => {
            document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
        };

        if(theme === 'dark'){
            toggleDarkPalette(true);
        }else{
            toggleDarkPalette(false);
        }
    }
}