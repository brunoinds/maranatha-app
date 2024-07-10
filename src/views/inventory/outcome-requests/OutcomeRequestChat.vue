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
                    <ion-item lines="none">
                        <ion-button fill="clear" slot="end" color="danger" v-if="message.uploadingProgress?.error" @click="message.uploadingProgress?.error?.retry">
                            <ion-icon :icon="alertCircleOutline"></ion-icon>
                        </ion-button> 
                        <article  class="message-item" :is-me="message.isMe">
                            <img type="receiver" :src="ChatTailReceiver">
                            <section class="bubble">
                                <button class="message-image" v-if="message.imageData"  :isLoading="!message.imageData.isCompleted" @click="(message.imageData?.base64) ? openImage(message.imageData.base64, '') : undefined">
                                    <ion-progress-bar v-if="!message.imageData.isCompleted" color="secondary" type="indeterminate"></ion-progress-bar>
                                    <ion-img v-if="message.imageData.isCompleted" :src="'data:image/png;base64,' + message.imageData.base64"></ion-img>
                                </button>

                                <button class="message-document" v-if="message.documentData"  :isLoading="!message.documentData.isCompleted" @click="(message.documentData?.base64) ? openDocument(message, message.documentData.base64) : undefined">
                                    <article>
                                        <ion-icon :icon="documentOutline"></ion-icon>
                                        <section>
                                            <h2>{{ message.document?.name }}</h2>
                                            <h3>{{ message.document?.size }} bytes</h3>
                                            <p>{{ message.document?.type }}</p>
                                        </section>
                                        <ion-spinner v-if="!message.documentData.isCompleted"  color="light"></ion-spinner>
                                    </article>
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

                    <ion-item-options side="end">
                        <ion-item-option color="primary" @click="copyMessage(message)">
                            <ion-icon :icon="copyOutline" slot="start"></ion-icon>
                            <ion-label>Copiar</ion-label>
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>


            <ion-button class="go-bottom-button" v-show="showGoBottomButton" @click="goToBottom">
                <ion-icon :icon="chevronDownCircleOutline"></ion-icon>
                <span v-if="newMessagesNotViewedByScroll > 0">{{ newMessagesNotViewedByScroll }}</span>
            </ion-button>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <section class="footer" :id="'footerOfChatId-' + outcomeRequestId">
                    <button @click="moreOptions.showOptions">
                        <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                    </button>

                    <article class="send-area">
                        <section class="image-area" v-if="dynamicData.image || dynamicData.isLoadingImage">
                            <ion-img v-if="dynamicData.image" :src="'data:image/png;base64,' + dynamicData.image.data"></ion-img>
                            <ion-progress-bar v-if="dynamicData.isLoadingImage" color="secondary" type="indeterminate"></ion-progress-bar>

                            <ion-button v-if="dynamicData.image" color="danger" size="small" fill="outline" @click="dynamicData.image = null">
                                <ion-icon :icon="trashOutline"></ion-icon>
                            </ion-button>
                        </section>
                        <section class="document-area" v-if="dynamicData.document">
                            <article>
                                <ion-icon :icon="documentOutline"></ion-icon>
                                <section>
                                    <h2>{{ dynamicData.document?.name }}</h2>
                                    <h3>{{ dynamicData.document?.size }} bytes</h3>
                                    <p>{{ dynamicData.document?.type }}</p>
                                </section>
                            </article>

                            <ion-button v-if="dynamicData.document" color="danger" size="small" fill="outline" @click="dynamicData.document = null">
                                <ion-icon :icon="trashOutline"></ion-icon>
                            </ion-button>
                        </section>
                        <section class="audio-area" v-if="dynamicData.audioRecording.isRecording">
                            <canvas :id="'audioRecorderOfChatId-' + outcomeRequestId"></canvas>
                            <span>{{dynamicData.audioRecording.durationText}}</span>
                            <ion-button color="danger" size="small" fill="outline" @click="dynamicData.audioRecording.onStopRecording" style="margin-right: 10px;">
                                <ion-icon :icon="trashOutline"></ion-icon>
                            </ion-button>
                        </section>
                        <ion-textarea v-if="!dynamicData.audioRecording.isRecording" ref="textAreaElement" v-model="dynamicData.text" :auto-grow="true" :rows="1" placeholder="Escribe un mensaje"></ion-textarea>
                    </article>
                    <button @click="sendMessage" shape="round" size="small">
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
import { IOutcomeChatMessage } from '@/interfaces/InventoryInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { ImagePicker } from '@/utils/Camera/ImagePicker';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { IonBackButton, IonSpinner, IonButton, IonButtons, IonContent, IonHeader,IonImg, IonIcon, IonItem, IonItemSliding, IonList, IonPage, IonProgressBar, IonTextarea, IonTitle, IonToolbar, actionSheetController, alertController, toastController } from '@ionic/vue';
import { addOutline, chevronDownCircleOutline, documentOutline, trashOutline, copyOutline, alarmOutline, alertCircleOutline, checkmarkDoneOutline, checkmarkOutline, sendOutline, image } from 'ionicons/icons';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRoute } from 'vue-router';
import { Picker } from '@/utils/Picker/Picker';
import { AudioRecorder } from '@/utils/Recorder/AudioRecorder';
import { KVSIndexedDB, kvsIndexedDB } from "@kvs/indexeddb";

TimeAgo.addLocale(es);
const timeAgo = new TimeAgo('es-PE')

const route = useRoute();
const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);
const contentElement = ref<HTMLElement|null>(null);
const textAreaElement = ref<HTMLElement|null>(null);
const goToBottomButtonBottomHeight = ref<string>('150px');
const outcomeRequestId = route.params.id as string;
const showGoBottomButton = ref<boolean>(false);
const newMessagesNotViewedByScroll = ref<number>(0);


const dynamicData = ref<{
    text: string,
    image?: {
        data: string,
        type: string,
        size: number
    }|null,
    video?: {
        data: string,
        type: string,
        size: number,
        duration: number
    }|null,
    document?: {
        name: string,
        data: string,
        type: string,
        size: number
    }|null,
    audio?: {
        data: string,
        type: string,
        size: number,
        duration: number
    }|null,
    replyTo?: IOutcomeChatMessage|null,
    reactTo?: IOutcomeChatMessage|null,
    isLoadingImage: boolean,
    audioRecording: {
        isRecording: boolean,
        durationText: string,
        onStopRecording: Function
    },
    downloadingProgress: Array<{
        message: IOutcomeChatMessage,
        progress: number|null,
        error: {
            description: string,
            retry: () => void
        } | null,
        response: null|string
    }>,
    uploadingProgress: Array<{
        message: IOutcomeChatMessage,
        progress: number|null,
        error: {
            description: string,
            retry: () => void
        } | null
    }>
}>({
    text: '',
    image: null,
    document: null,
    video: null,
    audio: null,
    replyTo: null,
    reactTo: null,
    isLoadingImage: false,
    downloadingProgress: [],
    uploadingProgress: [],
    audioRecording: {
        isRecording: false,
        durationText: '00:00',
        onStopRecording: () => {}
    }
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
                    //Check if it is uploading or downloading the image:
                    const uploading = dynamicData.value.uploadingProgress.find((progress) => progress.message.id === message.id);
                    const downloading = dynamicData.value.downloadingProgress.find((progress) => progress.message.id === message.id);

                    if (message.image.data.length > 36){
                        return {
                            name: 'Uploading image',
                            base64: message.image.data,
                            progress: null,
                            isCompleted: false
                        }
                    }else if (uploading){
                        return {
                            name: 'Uploading image',
                            base64: uploading.message.image?.data,
                            progress: uploading.progress,
                            isCompleted: false
                        }
                    }else if (downloading){
                        if (downloading.response){
                            return {
                                name: 'Image downloaded',
                                base64: downloading.response,
                                progress: null,
                                isCompleted: true
                            }
                        }else{
                            return {
                                name: 'Downloading image',
                                base64: null,
                                progress: downloading.progress,
                                isCompleted: false
                            }
                        }
                    }


                    (async () => {
                        const downloadingProgress = {
                            message: message,
                            progress: null,
                            error: null,
                            response: null
                        }

                        dynamicData.value.downloadingProgress.push(downloadingProgress);

                        const attachment = await retrieveAttachmentData(message.image?.data as string);
                        dynamicData.value.downloadingProgress = dynamicData.value.downloadingProgress.map((progress) => {
                            if (progress.message.id === message.id){
                                progress.response = attachment;
                            }
                            return progress;
                        });
                    })();

                    return {
                        name: 'Downloading image',
                        base64: null,
                        progress: null,
                        isCompleted: false
                    }
                }
                return null;
            })(),
            documentData: (() => {
                if (message.document) {
                    //Check if it is uploading or downloading the image:
                    const uploading = dynamicData.value.uploadingProgress.find((progress) => progress.message.id === message.id);
                    const downloading = dynamicData.value.downloadingProgress.find((progress) => progress.message.id === message.id);

                    if (message.document.data.length > 36){
                        return {
                            name: 'Uploading document',
                            base64: message.document.data,
                            progress: null,
                            isCompleted: false
                        }
                    }else if (uploading){
                        return {
                            name: 'Uploading document',
                            base64: uploading.message.document?.data,
                            progress: uploading.progress,
                            isCompleted: false
                        }
                    }else if (downloading){
                        if (downloading.response){
                            return {
                                name: 'Document downloaded',
                                base64: downloading.response,
                                progress: null,
                                isCompleted: true
                            }
                        }else{
                            return {
                                name: 'Downloading document',
                                base64: null,
                                progress: downloading.progress,
                                isCompleted: false
                            }
                        }
                    }


                    (async () => {
                        const downloadingProgress = {
                            message: message,
                            progress: null,
                            error: null,
                            response: null
                        }

                        dynamicData.value.downloadingProgress.push(downloadingProgress);

                        const attachment = await retrieveAttachmentData(message.document?.data as string);
                        dynamicData.value.downloadingProgress = dynamicData.value.downloadingProgress.map((progress) => {
                            if (progress.message.id === message.id){
                                progress.response = attachment;
                            }
                            return progress;
                        });
                    })();

                    return {
                        name: 'Downloading document',
                        base64: null,
                        progress: null,
                        isCompleted: false
                    }
                }
                return null;
            })(),
            uploadingProgress: (() => {
                const uploading = dynamicData.value.uploadingProgress.find((progress) => progress.message.id === message.id);
                if (uploading){
                    return uploading;
                }

                return null
            })()
        }
    });
});

const goToBottom = () => {
    setTimeout(() => {
        contentElement.value?.$el.scrollToBottom(400);
        setTimeout(() => {
            Haptics.impact({
                style: ImpactStyle.Light
            });
        }, 350);
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

    //Before replace chatMessagesData with the new messages, we should include the messages that was not sent yet. To do that, we need to filter those messages and include them in the newChatMessages array:

    const newChatMessages = response;

    const notSentYetMessages = chatMessagesData.value.filter((message) => {
        return message.sent_at === null;
    }).filter((message) => {
        return !newChatMessages.find((newMessage:any) => {
            return (newMessage.written_at == message.written_at &&
            newMessage.text == message.text &&
            newMessage.user_id == message.user_id);
        });
    });

    newChatMessages.push(...notSentYetMessages);

    //Check if has differences between the new messages and the current messages:
    if (JSON.stringify(newChatMessages) !== JSON.stringify(chatMessagesData.value)){
        //Now apply the changes. This is to avoid call the computed() function more than necessary:
        chatMessagesData.value = newChatMessages.sort((a:any, b:any) => {
            return new Date(a.written_at).getTime() - new Date(b.written_at).getTime();
        });
    }

    
}
const sendMessage = async () => {
    if (dynamicData.value.audioRecording.isRecording){
        const response = await dynamicData.value.audioRecording.onStopRecording();
        dynamicData.value.audio = {
            data: response.base64,
            type: '.ogg',
            size: response.base64.length,
            duration: response.duration
        }
    }


    if (dynamicData.value.text.trim().length == 0 && dynamicData.value.image == null && dynamicData.value.document == null && dynamicData.value.audio == null && dynamicData.value.video == null) {
        return;
    }

    const message = {
        id: Math.random().toString(36).substring(7),
        text: (() => {
            if (dynamicData.value.text.trim().length == 0) {
                return null;
            }
            return dynamicData.value.text.trim();
        })(),
        image: dynamicData.value.image ?? undefined,
        video: dynamicData.value.video ?? undefined,
        document: dynamicData.value.document ?? undefined,
        audio: dynamicData.value.audio ?? undefined,
        written_at: new Date().toISOString(),
        sent_at: null,
        received_at: null,
        read_at: null,
        user_id: Session.getCurrentSessionSync()?.id() as number
    } as IOutcomeChatMessage;
    
    pauseTimer = true;

    chatMessagesData.value.push(message);

    dynamicData.value.text = '';
    dynamicData.value.image = null;
    dynamicData.value.document = null;
    dynamicData.value.audio = null;
    dynamicData.value.video = null;


    goToBottom();

    textAreaElement.value?.$el.querySelector('textarea')?.focus();

    Haptics.impact({
        style: ImpactStyle.Medium
    });

    pauseTimer = false;

    const sendMessageToServer = async () => {
        try {
            dynamicData.value.uploadingProgress.push({
                message: message,
                progress: null,
                error: null
            });

            const response = await RequestAPI.post('/inventory/warehouse-outcome-requests/' + outcomeRequestId + '/chat', {
                ...message,
                id: undefined
            });

            dynamicData.value.uploadingProgress = dynamicData.value.uploadingProgress.filter((progress) => {
                return progress.message.id !== message.id;
            });
        } catch (error) {
            onMessageErrorOnUpload((error as any).toString());
        }
    }

    const onMessageErrorOnUpload = (errorDescription: string|null) => {
        dynamicData.value.uploadingProgress = dynamicData.value.uploadingProgress.map((progress) => {
            if (progress.message.id == message.id){
                progress.error = {
                    description: errorDescription || '',
                    retry: () => {
                        alertController.create({
                            header: 'Error al enviar',
                            message: errorDescription + ' ¿Deseas reintentar el envío del mensaje?',
                            buttons: [
                                {
                                    text: 'Cancelar',
                                    role: 'cancel'
                                },
                                {
                                    text: 'Reintentar',
                                    role: 'destructive',
                                    handler: () => {
                                        dynamicData.value.uploadingProgress = dynamicData.value.uploadingProgress.map((progress) => {
                                            if (progress.message.id === message.id) {
                                                progress.error = null;
                                            }
                                            return progress;
                                        });
                                        sendMessageToServer();
                                    }
                                }
                            ]
                        }).then((alert) => {
                            alert.present();
                        });
                    }
                }
                return progress;
            }
            return progress;
        });
    }

    await sendMessageToServer();
}
const openImage = async (base64: string, name: string) => {
    Toolbox.share('document.png', base64 as unknown as string)
}
const openDocument = async (message: IOutcomeChatMessage, base64: string) => {
    Toolbox.share(message.document?.name as unknown as string, base64 as unknown as string)
}
const moreOptions = {
    openCamera: async () => {
        const response = await Picker.pickPhoto({
            isProcessingFile: () => {
                dynamicData.value.isLoadingImage = true;
            }
        });
        dynamicData.value.image = {
            data: response.base64,
            type: '.png',
            size: response.details.size
        };
        dynamicData.value.isLoadingImage = false;
    },
    openDocument: async () => {
        const response = await Picker.pickPdfDocument({
            isProcessingFile: () => {
                dynamicData.value.isLoadingImage = true;
            }
        });
        
        dynamicData.value.document = {
            name: response.details.name,
            data: response.base64,
            type: '.pdf',
            size: response.details.size,
        }
        console.log(response)

        dynamicData.value.isLoadingImage = false;
    },
    recordAudio: async () => {
        const audioRecorder = AudioRecorder.new();
        dynamicData.value.audioRecording.isRecording = true;
        await Toolbox.sleep(100);
        audioRecorder.osciloscoperCanvas = document.querySelector('#audioRecorderOfChatId-' + outcomeRequestId) as HTMLCanvasElement;
        await audioRecorder.startRecording();
        let seconds = 0;
        dynamicData.value.audioRecording.durationText = '00:00';
        const timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const secondsString = (seconds % 60).toString().padStart(2, '0');
            const minutesString = minutes.toString().padStart(2, '0');
            const time = minutesString + ':' + secondsString;
            dynamicData.value.audioRecording.durationText = time;
        }, 1000);

        dynamicData.value.audioRecording.onStopRecording = async () => {
            clearInterval(timer);
            dynamicData.value.audioRecording.isRecording = false;
            const response = await audioRecorder.stopRecording();
            return {
                ...response,
                duration: seconds
            };
        }
    },
    showOptions: async () => {
        actionSheetController.create({
            buttons: [
                {
                    text: 'Tomar foto',
                    handler: () => {
                        moreOptions.openCamera();
                    }
                },
                {
                    text: 'Subir documento',
                    handler: () => {
                        moreOptions.openDocument();
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


const retrieveAttachmentData = async (attachmentId: string) => {
    const storage = await kvsIndexedDB({
        name: "outcome-requests-chat-attachments",
        version: 1,
    });

    const attachment = await storage.get(attachmentId);
    if (attachment){
        return attachment;
    }

    const response = await RequestAPI.get('/inventory/chat-attachments/' + attachmentId);
    await storage.set(attachmentId, response.attachment);
    return response.attachment;
}
const copyMessage = (message: IOutcomeChatMessage) => {
    navigator.clipboard.writeText(message.text as string);
    Haptics.impact({
        style: ImpactStyle.Medium
    });
    toastController.create({
        message: '📋 Mensaje copiado!',
        duration: 2000
    }).then((toast) => {
        toast.present();
    });
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
    if (maximumScrollPosition - currentScrollPosition as number > 80) {
        showGoBottomButton.value = true;
    } else{
        showGoBottomButton.value = false;
        newMessagesNotViewedByScroll.value = 0;
    }
}, 100);

const getFooterInnerElement = () => {
    const footerElement = document.getElementById('footerOfChatId-' + outcomeRequestId);
    if (footerElement){
        return footerElement;
    }
    return null;
}

if (Capacitor.isNativePlatform()){
    Keyboard.addListener('keyboardWillShow', info => {
        getFooterInnerElement().style.paddingBottom = (info.keyboardHeight + 5) + 'px';
    });

    Keyboard.addListener('keyboardDidShow', info => {
        getFooterInnerElement().style.paddingBottom = (info.keyboardHeight + 5) + 'px';
        goToBottomButtonBottomHeight.value = (info.keyboardHeight + 100) + 'px';
    });

    Keyboard.addListener('keyboardWillHide', () => {
        getFooterInnerElement().style.paddingBottom = '5px';
    });

    Keyboard.addListener('keyboardDidHide', () => {
        getFooterInnerElement().style.paddingBottom = '5px';
        goToBottomButtonBottomHeight.value = '150px';
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
    bottom: v-bind(goToBottomButtonBottomHeight);
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
    transition: padding 0.3s cubic-bezier(0.1, 0.76, 0.55, 0.9);;
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
        > .document-area{
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            border: 1px solid var(--ion-color-medium);
            border-radius: 20px;
            padding: 5px 10px;
            column-gap: 10px;
            position: relative;

            > article{
                display: flex;
                align-items: center;
                column-gap: 10px;
                padding: 12px 10px;
                width: 100%;
                border-radius: 8px;
                > section{
                    display: flex;
                    flex-direction: column;
                    margin: 0;
                    font-weight: 500;
                    text-align: left;

                    > h2{
                        font-size: 12px;
                        font-weight: 600;
                        margin: 0;

                    }
                    > h3{
                        font-size: 11px;
                        font-weight: 400;
                        margin: 0;

                    }
                    > p{
                        font-size: 10px;
                        font-weight: 400;
                        margin: 0;
                        margin-top: 5px;
                    }
                }
            }
            > ion-button{
                position: absolute;
                top: 5px;
                right: 5px;
            }
        }
        > .audio-area{
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            border: 1px solid var(--ion-color-medium);
            border-radius: 20px;
            column-gap: 10px;
            overflow: hidden;
            position: relative;
            height: 48px;
            > canvas{
                width: 100%;
                height: 100%;
                border-radius: 20px;
            }
            > span{
                position: absolute;
                top: 50%;
                left: 10px;
                transform: translateY(-110%);
                font-size: 12px;
                color: gray;

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
        .message-document{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            width: 100%;
            margin-bottom: 10px;

            > article{
                display: flex;
                align-items: center;
                column-gap: 10px;
                background-color: #c5e5b3;
                padding: 12px 10px;
                width: 100%;
                color: #000000ac;
                border-radius: 8px;
                > section{
                    display: flex;
                    flex-direction: column;
                    margin: 0;
                    font-weight: 500;
                    text-align: left;

                    > h2{
                        font-size: 12px;
                        font-weight: 600;
                        margin: 0;

                    }
                    > h3{
                        font-size: 11px;
                        font-weight: 400;
                        margin: 0;

                    }
                    > p{
                        font-size: 10px;
                        font-weight: 400;
                        margin: 0;
                        margin-top: 5px;
                    }
                }
                
                > ion-icon{
                    font-size: 20px;
                }
                > ion-spinner{
                    width: 18px;
                    height: 18px;
                }
            }
            &[isLoading="true"]{
                &:active{
                    opacity: 0.4;
                }
            }
            &[isLoading="false"]{
                &:active{
                    opacity: 0.4;
                }
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
            > ion-img{
                user-select: none;
                pointer-events: none;
            }
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


</style>
