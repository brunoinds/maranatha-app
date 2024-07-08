<template>
    <article class="timeline">
        <section class="step" v-for="item in listItemsUI" :status="item.status">
            <aside>
                <div :bg-color="item.ui.iconBackgroundColor" :stick-color="item.ui.stickBackgroundColor" :glow-color="item.ui.iconBackgroundColor" :to-glow="item.ui.toGlow">
                    <ion-icon v-if="item.ui.iconImage" :color="item.ui.iconColor" :icon="item.ui.iconImage"></ion-icon>
                </div>
            </aside>
            <main>
                <header>
                    <ion-label :color="item.ui.textColor">
                        <h1 style="font-size: 16px; font-weight: bold;">{{ item.title }}</h1>
                        <p>{{ item.description }}</p>
                    </ion-label>
                </header>
                
                <section>
                    <ion-button v-for="button in item.actions" size="small" :color="button.color || 'primary'" :fill="button.fill" @click="button.handler">
                        <ion-icon v-if="button.icon" :icon="button.icon" slot="end"></ion-icon>
                        {{ button.text }}
                    </ion-button>
                </section>
            </main>
        </section>
    </article>
</template>

<script setup lang="ts">
import { airplaneOutline, alertOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { IonIcon, IonButton, IonLabel } from '@ionic/vue';
import { PropType, computed, ref } from 'vue';

const props = defineProps({
    items: {
        type: Array as PropType<Array<Item>>,
        required: true
    }
});


const listItemsUI = computed(() => {
    return props.items.map((item) => {
        return {
            ...item,
            ui: {
                textColor: (() => {
                    if (item.status === 'completed') return 'success';
                    if (item.status === 'in-progress') return 'primary';
                    if (item.status === 'pending') return 'medium';
                    if (item.status === 'canceled') return 'danger';
                    if (item.status === 'warning') return 'warning';
                })(),
                iconColor: (() => {
                    if (item.status === 'completed') return 'light';
                    if (item.status === 'in-progress') return 'light';
                    if (item.status === 'pending') return 'dark';
                    if (item.status === 'canceled') return 'light';
                    if (item.status === 'warning') return 'light';
                })(),
                iconBackgroundColor: (() => {
                    if (item.status === 'completed') return 'success';
                    if (item.status === 'in-progress') return 'primary';
                    if (item.status === 'pending') return 'light';
                    if (item.status === 'canceled') return 'danger';
                    if (item.status === 'warning') return 'warning';
                })(),
                iconImage: (() => {
                    if (item.status === 'completed') return checkmarkOutline;
                    if (item.status === 'canceled') return closeOutline;
                    if (item.status === 'warning') return alertOutline;

                    if (item.icon){
                        return item.icon;
                    }
                    return null;
                })(),
                stickBackgroundColor: (() => {
                    //Get next item status:
                    const nextItemIndex = props.items.indexOf(item);

                    if (nextItemIndex === props.items.length - 1) return 'light';

                    
                    const nextItem = props.items[props.items.indexOf(item) + 1];
                    if (nextItem.status === 'completed') return 'success';
                    if (nextItem.status === 'in-progress') return 'primary';
                    if (nextItem.status === 'pending') return 'light';
                    if (nextItem.status === 'canceled') return 'danger';
                    if (nextItem.status === 'warning') return 'warning';
                })(),
                toGlow: (() => {
                    if (item.status === 'in-progress') return true;
                    if (item.status === 'canceled') return true;
                    if (item.status === 'warning') return true;
                    return false;
                })()
            }
        }
    })
})

interface Item{
    title: string;
    description: string;
    actions: Array<{
        text: string;
        fill: 'clear'|'outline'|'solid'|'default';
        color: 'primary'|'secondary'|'tertiary'|'success'|'warning'|'danger'|'light'|'medium'|'dark'|undefined;
        handler: () => void;
        icon: any|null;
    }>;
    icon: any|null;
    status: 'pending'|'completed'|'in-progress'|'canceled'|'warning';
}




</script>



<style scoped lang="scss">

$colors: (
    "success": var(--ion-color-success),
    "warning": var(--ion-color-warning),
    "danger": var(--ion-color-danger),
    "dark": var(--ion-color-dark),
    "medium": var(--ion-color-medium),
    "light": var(--ion-color-light),
    "primary": var(--ion-color-primary),
    "secondary": var(--ion-color-secondary),
    "tertiary": var(--ion-color-tertiary),
);

@each $name, $value in $colors {
    [bg-color="#{$name}"] {
        background-color: $value;

    }
    [txt-color="#{$name}"] {
        color: $value;
    }
    [stick-color="#{$name}"] {
        &::after{
            background-color: $value;
        }
    }
    [glow-color="#{$name}"][to-glow="true"]{
        @keyframes glow#{$name} {
            0% {
                box-shadow: 0 0 0px $value;
            }
            50% {
                box-shadow: 0 0 20px $value;
            }
            100% {
                box-shadow: 0 0 0px $value;
            }
        }

        animation: glow#{$name} 3s infinite;
    }
}

.timeline{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 10px;


    > .step:last-child{
        > aside{
            > div{
                &::after{
                    display: none;
                }
            }
        }
    }
}

.step{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    column-gap: 15px;
    width: 100%;
    position: relative;

    > aside{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 0;
        border-radius: 10px 0 0 10px;
        align-self: flex-start;
        padding-top: 0px;

        > div{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 5px;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            > ion-icon{
                font-size: 30px;
                color: #000;
            }

            

            &::after{
                content: "";
                display: block;
                width: 2px;
                height: 100%;
                position: absolute;
                top: 2px;
                left: 13px;
                transform: translateX(-50%);
                z-index: -1;
            }
        }
    }

    > main{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        margin: 0;
        padding: 0;
        width: calc(100% - 100px);
        height: 100%;
        flex: 1 auto;
        row-gap: 8px;
        padding-bottom: 15px;
        > header{

            
            > h1{
                margin: 0;
                padding: 0;
                font-size: 16px;
                font-weight: bold;
                color: var(--ion-text-color);
            }
        }
        
        
    }


    &[status="pending"]{
        > main{
            opacity: 0.3;
        }
    }
}

</style>