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

    public static getColorsForCharts(){
        return Object.values({
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgb(54, 162, 235)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)',
            greentwo: 'rgb(139 195 74)',
            magenta: 'rgb(171 71 188)',
            beige: 'rgb(231 187 121)',
            brown: 'rgb(141 110 99)',
            lime: 'rgb(205 220 57)'
        })
    }
}