<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button :defaultHref="'/inventory/outcome-requests/' + outcomeRequestId"></ion-back-button>
                </ion-buttons>
                <ion-title>Chat Pedido #00{{ outcomeRequestId }}</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content ref="contentElement" class="content">
            <br>
            <ion-list :class="isLoading ? 'opacity-0' : undefined">
                <ion-item-sliding v-for="message in chatMessagesUI" :id="message.id" >
                    <ion-item lines="none" > 
                        <article  class="message-item" :is-me="message.isMe">
                            <img type="receiver" :src="ChatTailReceiver">
                            <section class="bubble">
                                <button class="message-image" v-if="message.imageData"  :isLoading="message.imageData?.isLoading" @click="(message.imageData) ? openImage(message.imageData.base64, message.image) : undefined">
                                    <ion-progress-bar v-if="message.imageData.isLoading" color="secondary" type="indeterminate"></ion-progress-bar>
                                    <ion-img v-if="!message.imageData.isLoading" :src="'data:image/png;base64,' + message.imageData.base64"></ion-img>
                                </button>
                                <article class="message-body">
                                    <span>{{ message.text }}</span>
                                </article>

                                <article class="message-stats">
                                    <span>{{ message.time }}</span>
                                    <ion-icon :icon="message.statusIcon" :color="message.statusIconColor"></ion-icon>
                                </article>
                            </section>
                            <img type="sender" :src="ChatTailSender">
                        </article>
                    </ion-item>
                </ion-item-sliding>
            </ion-list>


            <ion-button class="go-bottom-button" v-show="showGoBottomButton" @click="goToBottom">
                <ion-icon :icon="chevronDownCircleOutline"></ion-icon>
                <span v-if="newMessagesNotViewedByScroll > 0">{{ newMessagesNotViewedByScroll }}</span>
            </ion-button>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <section ref="footerInnerEl" class="footer">
                    <button @click="moreOptions.showOptions">
                        <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                    </button>


                    <article class="send-area">
                        <section class="image-area" v-if="dynamicData.image || dynamicData.isLoadingImage">
                            <ion-img v-if="dynamicData.image" :src="'data:image/png;base64,' + dynamicData.image"></ion-img>
                            <ion-progress-bar v-if="dynamicData.isLoadingImage" color="secondary" type="indeterminate"></ion-progress-bar>

                            <ion-button v-if="dynamicData.image" color="danger" size="small" fill="outline" @click="dynamicData.image = null">
                                <ion-icon :icon="trashOutline"></ion-icon>
                            </ion-button>
                        </section>
                        <ion-textarea ref="textAreaElement" v-model="dynamicData.text" :auto-grow="true" :rows="1" placeholder="Type a message"></ion-textarea>
                    </article>
                    <button @click="sendTextMessage" shape="round" size="small">
                        <ion-icon slot="icon-only" :icon="sendOutline"></ion-icon>
                    </button>
                </section>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import ChatTailReceiver from '&/assets/icons/chat-tail-receiver.svg';
import ChatTailSender from '&/assets/icons/chat-tail-sender.svg';
import { IChatMessage } from '@/interfaces/ChatInterfaces';
import { IOutcomeChatMessage } from '@/interfaces/InventoryInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { ImagePicker } from '@/utils/Camera/ImagePicker';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader,IonImg, IonIcon, IonItem, IonItemSliding, IonList, IonPage, IonProgressBar, IonTextarea, IonTitle, IonToolbar, actionSheetController } from '@ionic/vue';
import { addOutline, chevronDownCircleOutline, trashOutline, alarmOutline, checkmarkDoneOutline, checkmarkOutline, sendOutline, image } from 'ionicons/icons';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
//button :detail="false" @click="clickMessage(message.id)"
//import { useTextareaAutosize } from '@vueuse/core'

//const { textarea: autoResizeTextArea, input: autoResizeTextAreaInput } = useTextareaAutosize();

TimeAgo.addLocale(es);
const timeAgo = new TimeAgo('es-PE')

const footerInnerEl = ref<HTMLElement|null>(null);
const route = useRoute();
const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);
const contentElement = ref<HTMLElement|null>(null);
const textAreaElement = ref<HTMLElement|null>(null);

const outcomeRequestId = route.params.id as string;

const showGoBottomButton = ref<boolean>(false);
const newMessagesNotViewedByScroll = ref<number>(0);


const dynamicData = ref<{
    text: string,
    image: string|null,
    isLoadingImage: boolean,
    loadedImages: Array<{id: string, base64: string, isLoading: boolean}>,
}>({
    text: '',
    image: null,
    isLoadingImage: false,
    loadedImages: []
});

const chatMessagesData = ref<IOutcomeChatMessage[]>([]);

const chatMessagesUI = computed(() => {
    return chatMessagesData.value.map((message) => {
        return {
            ...message,
            isMe: message.user_id === Session.getCurrentSessionSync()?.id(),
            time: timeAgo.format(new Date(message.written_at)),
            statusIcon: (() => {
                if (message.sent_at === null) {
                    return alarmOutline
                } else if (message.received_at === null) {
                    return checkmarkOutline
                } else if (message.read_at === null) {
                    return checkmarkDoneOutline
                } else{
                    return checkmarkDoneOutline
                }
            })(),
            statusIconColor: (() => {
                if (message.read_at != null) {
                    return 'secondary'
                } else{
                    return 'medium'
                }
            })(),
            imageData: (() => {
                if (message.image) {
                    if (message.image.endsWith('==')){
                        return {
                            id: message.image,
                            base64: message.image,
                            isLoading: false
                        }
                    }else{
                        if (dynamicData.value.loadedImages.find((image) => image.id === message.image)){
                            return dynamicData.value.loadedImages.find((image) => image.id === message.image);
                        }else{
                            dynamicData.value.loadedImages.push({
                                id: message.image,
                                base64: '',
                                isLoading: true
                            });
                            (async () => {
                                const response = await RequestAPI.get('/inventory/chat-images/' + message.image);
                                dynamicData.value.loadedImages.find((image) => image.id === message.image)!.base64 = response.image;
                                dynamicData.value.loadedImages.find((image) => image.id === message.image)!.isLoading = false;
                            })();
                            return dynamicData.value.loadedImages.find((image) => image.id === message.image);
                        }
                    }
                }
                return null;
            })()
        }
    });
});

const goToBottom = () => {
    setTimeout(() => {
        contentElement.value?.$el.scrollToBottom(400);
    }, 100);
    newMessagesNotViewedByScroll.value = 0;
}

const getMessages = async () => {
    if (pauseTimer){
        return;
    }
    const response = await RequestAPI.get('/inventory/warehouse-outcome-requests/'+outcomeRequestId+'/chat');
    if (pauseTimer){
        return;
    }

    if (chatMessagesData.value.length != 0 && response.length > chatMessagesData.value.length) {
        const previousChatMessagesCount = chatMessagesData.value.length;
        const currentResponseMessagesCount = response.length;

        setTimeout(() => {
            if (showGoBottomButton.value){
                newMessagesNotViewedByScroll.value += currentResponseMessagesCount - previousChatMessagesCount;
            }
        }, 100)
        
    }
    chatMessagesData.value = response.sort((a:any, b:any) => {
        return new Date(a.written_at).getTime() - new Date(b.written_at).getTime();
    });
}
const sendTextMessage = async () => {
    if (dynamicData.value.text.trim().length == 0 && dynamicData.value.image == null) {
        return;
    }

    const message = {
        text: dynamicData.value.text,
        image: dynamicData.value.image,
        written_at: new Date().toISOString(),
        sent_at: null,
        received_at: null,
        read_at: null,
    }
    
    pauseTimer = true;

    chatMessagesData.value.push({
        id: Math.random().toString(36).substring(7),
        text: message.text,
        image: message.image,
        written_at: message.written_at,
        sent_at: message.sent_at,
        received_at: message.received_at,
        read_at: message.read_at,
        user_id: Session.getCurrentSessionSync()?.id() as number,
    });
    dynamicData.value.text = '';
    dynamicData.value.image = null;

    goToBottom();

    textAreaElement.value?.$el.querySelector('textarea')?.focus();

    pauseTimer = false;

    const response = await RequestAPI.post('/inventory/warehouse-outcome-requests/'+outcomeRequestId+'/chat', {
        ...message
    });
}
const openImage = async (base64: string, imageId: string) => {
    Toolbox.share(imageId + '.png', base64 as unknown as string)
}
const moreOptions = {
    openCamera: async () => {
        dynamicData.value.isLoadingImage = true;
        const response = await ImagePicker.loadImagesAndDocuments();

        console.log('Response image:' , response)

        dynamicData.value.image = response.image;
        dynamicData.value.isLoadingImage = false;
    },
    showOptions: async () => {
        //Open the action sheet to select the image from the gallery or take a photo:
        moreOptions.openCamera();
        return;
        actionSheetController.create({
            buttons: [
                {
                    text: 'Tomar foto',
                    handler: () => {
                        moreOptions.openCamera(false);
                    }
                },
                {
                    text: 'Subir documento',
                    handler: () => {
                        moreOptions.openCamera(true);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                }
            ]
        }).then((actionSheet) => {
            actionSheet.present();
        });
    }
}

//Create a timer that recursively fetches the messages every 5 seconds to keep the chat updated:
let currentTimer:any;
let stopCreateTimer = false;
let pauseTimer = false;
const createTimer = () => {
    currentTimer = setInterval(async () => {
        clearTimeout(currentTimer);
        try {
            await getMessages();
        } catch (error) {
            
        }
        if (stopCreateTimer) {
            clearTimeout(currentTimer);
            currentTimer = null;
            return;
        }
        createTimer();
    }, 500);
}

const timerShowGoBottomButton = setInterval(async () => {
    const element = (await contentElement.value?.$el.getScrollElement());
    const currentScrollPosition = element.scrollTop as number;
    const maximumScrollPosition = element.scrollHeight - element.clientHeight;
    if (maximumScrollPosition - currentScrollPosition as number > 50) {
        showGoBottomButton.value = true;
    } else{
        showGoBottomButton.value = false;
        newMessagesNotViewedByScroll.value = 0;
    }
}, 100);

/*
Keyboard transition idea:
- onKeyboardWillOpen: get keyboard height, add this height as padding-bottom to the content element.
- onKeyboardWillClose: remove the padding-bottom from the content element.
- onKeyboardDidOpen: remove the padding-bottom from content.


*/
if (Capacitor.isNativePlatform()){
    Keyboard.addListener('keyboardWillShow', info => {
        footerInnerEl.value.$el.style.paddingBottom = info.keyboardHeight + 'px';
    });

    Keyboard.addListener('keyboardDidShow', info => {
        footerInnerEl.value.$el.style.paddingBottom = '5px';
    });

    Keyboard.addListener('keyboardWillHide', () => {

    });

    Keyboard.addListener('keyboardDidHide', () => {
        
    });
}




onMounted(async () => {
    isLoading.value = true;
    await getMessages();


    setTimeout(() => {
        contentElement.value?.$el.scrollToBottom(0);
        isLoading.value = false;
    }, 100);
    createTimer();

    AppEvents.emit('inventory:reload');
});

onUnmounted(() => {
    stopCreateTimer = true;
    clearTimeout(timerShowGoBottomButton);
});


</script>

<style scoped lang="scss">

.content{
    position: relative;
}

.go-bottom-button{
    position: fixed;
    bottom: 100px;
    right: 20px;
    z-index: 1000;
}

.opacity-0{
    opacity: 1%;
}

.footer{
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
    > .send-area{
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 8px;
        flex: 1;
        > .image-area{
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            border: 1px solid var(--ion-color-medium);
            border-radius: 20px;
            position: relative;
            min-height: 100px;
            > ion-button{
                position: absolute;
                top: 5px;
                right: 5px;
            }
            > ion-img{
                border-radius: 8px;
                height: 130px;
            }
        }
        
        > ion-textarea{
            border: 1px solid var(--ion-color-medium);
            border-radius: 20px;
            padding: 2px 10px 0px 10px;
        }
    }

    > button{
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--ion-color-primary);
        font-size: 26px;
        padding: 8px;
        height: 38px;
        width: 38px;
        border-radius: 50%;
        align-self: flex-end;
        margin-bottom: 5px;
        &:active{
            background-color: var(--ion-color-primary-tint);
        }
        ion-icon{
            color: white;
        }
    }
}


.message-item{
    width: 100%;
    display: flex;
    padding: 5px 0px;
    &[is-me="true"]{
        justify-content: flex-end;
        .bubble{
            background-color: #E2FFD4;
        }
        & > img[type="receiver"]{
            display: none;
        }
    }
    &[is-me="false"]{
        & > img[type="sender"]{
            display: none;
        }

        .bubble{
            .message-stats{
                ion-icon{
                    display: none;
                }
            }
        }
    }
    .bubble{
        background-color: #f4f4f4;
        border-radius: 8px;
        padding: 8px 10px;
        max-width: 68%;
        width: fit-content;
        box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 23%);
        .message-body{
            color: black;
            user-select: text;
            > span{
                white-space: pre-line;
            }
        }
        .message-image{
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            height: 280px;
            width: 224px;
            position: relative;
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 10px;
            user-select: none;
            &[isLoading="true"]{
                background-color: #00000029;
                &:active{
                    opacity: 0.4;
                }
            }
            &[isLoading="false"]{
                &:active{
                    opacity: 0.4;
                }
            }
            ion-progress-bar{
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 8px;
            }
            ion-img{
                border-radius: 8px;
                max-width: 100%;
                max-height: 100%;
                object-fit: cover;
                user-select: none;
            }
        }

        .message-stats{
            display: flex;
            justify-content: flex-end;
            align-items: center;
            font-size: 12px;
            color: gray;
            row-gap: 4px;
            column-gap: 4px;
            margin-top: 4px;

            ion-icon{
                font-size: 16px;
            }
        }
    }
}


</style>alarmOutline, checkmarkDoneOutline, checkmarkOutline, import { MessageStatus } from '@/interfaces/ChatInterfaces';
