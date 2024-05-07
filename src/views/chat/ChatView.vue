<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Chat</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item-sliding v-for="message in chatMessages" :id="message.id">
                    <ion-item-options side="start">
                        <ion-item-option color="success" expandable>Archive</ion-item-option>
                    </ion-item-options>

                    <ion-item lines="none">
                        <article class="message-item" :is-me="message.isMe">
                            <img type="receiver" :src="ChatTailReceiver">
                            <section class="bubble">


                                <article class="message-body">
                                    <ion-img v-if="message.type == 'Image'" :src="'http://localhost:8000/storage/messages-attachments/' + message.attachment.id"></ion-img>
                                    <span>{{ message.body }}</span>
                                </article>

                                <article class="message-stats">
                                    <span>{{ message.time }}</span>
                                    <ion-icon :icon="message.statusIcon"></ion-icon>
                                </article>
                            </section>
                            <img type="sender" :src="ChatTailSender">
                        </article>
                    </ion-item>

                    <ion-item-options side="end">
                        <ion-item-option>Favorite</ion-item-option>
                        <ion-item-option color="danger" expandable>Delete</ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>

            </ion-list>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <section class="footer">
                    <ion-button @click="sendImageMessage" shape="round" size="small">
                        <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
                    </ion-button>

                    <ion-textarea v-model="dynamicData.text" :auto-grow="true" placeholder="Type a message">

                    </ion-textarea>
                    <ion-button @click="sendTextMessage" shape="round" size="small">
                        <ion-icon slot="icon-only" :icon="sendOutline"></ion-icon>
                    </ion-button>
                </section>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { IonAvatar, IonContent, IonFooter, IonHeader, IonItemSliding, IonItemOptions, IonItemOption, IonInput, IonTextarea, IonIcon,IonButton, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, actionSheetController, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { Environment } from '@/utils/Environment/Environment';
import { Viewport } from '@/utils/Viewport/Viewport';
import { close, notificationsCircle, syncOutline, cloudDoneOutline, alarmOutline, shieldCheckmarkOutline, addCircleOutline, sendOutline, alarmSharp, checkmarkOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { useRoute } from 'vue-router';
import { Session } from '@/utils/Session/Session';
import { IChatMessage, MessageStatus } from '@/interfaces/ChatInterfaces';
import ChatTailSender from '&/assets/icons/chat-tail-sender.svg';
import ChatTailReceiver from '&/assets/icons/chat-tail-receiver.svg';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import imageCompression from 'browser-image-compression';

const route = useRoute();

const dynamicData = ref<any>({
    text: ''
});

let fromUserId = 0;
const targetUserId = parseInt(route.params.userId as unknown as string);
const chatMessagesData = ref<Array<IChatMessage>>([]);

const chatMessages = computed(() => {
    return chatMessagesData.value.sort((a, b) => {
        return a.id - b.id;
    }).map((message) => {
        return {
            ...message,
            isMe: message.from_user_id === fromUserId,
            time: new Date(message.sent_at).toLocaleTimeString(),
            statusIcon: (() => {
                if (message.status === MessageStatus.Sending) {
                    return alarmOutline
                } else if (message.status === MessageStatus.Sent) {
                    return checkmarkOutline
                } else if (message.status === MessageStatus.Received) {
                    return checkmarkDoneOutline
                } else if (message.status === MessageStatus.Read) {
                    return checkmarkDoneOutline
                } else {
                    return alarmOutline
                }
            })(),
            image: message.attachment?.base64
        }
    })
})

const retrieveChatData = async () => {
    const session = await Session.getCurrentSession();
    fromUserId = session?.id() as number;
    const response = await RequestAPI.get(`/chats/users/${targetUserId}/messages`, {
        from_user_id: session?.id(),
        to_user_id: targetUserId
    });

    chatMessagesData.value = response.messages;

}


const sendTextMessage = () => {
    const lastMessageId = chatMessagesData.value.length > 0 ? chatMessagesData.value[chatMessagesData.value.length - 1].id : 0;
    const message: IChatMessage = {
        id: lastMessageId + 1,
        from_user_id: fromUserId,
        to_user_id: targetUserId,
        body: dynamicData.value.text,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        replies_to: null,
        received_at: null,
        read_at: null,
        played_at: null,
        type: 'Text',
        status: MessageStatus.Sending,
        attachment: null,
        metadata: {}
    }

    sendMessage(message);
}

const sendImageMessage = async () => {
    const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        saveToGallery: true,
        correctOrientation: true
    });

    const imageBase64 = await (async () => {
        const response = await fetch(image.webPath as unknown as string);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", {type: blob.type});

        const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024
        })

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(";base64,")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
        })
    })();


    const lastMessageId = chatMessagesData.value.length > 0 ? chatMessagesData.value[chatMessagesData.value.length - 1].id : 0;
    const message: IChatMessage = {
        id: lastMessageId + 1,
        from_user_id: fromUserId,
        to_user_id: targetUserId,
        body: dynamicData.value.text,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        replies_to: null,
        received_at: null,
        read_at: null,
        played_at: null,
        type: 'Image',
        status: MessageStatus.Sending,
        attachment: {
            type: 'png',
            base64: imageBase64
        },
        metadata: {}
    }

    sendMessage(message);
}


const sendMessage = (message: IChatMessage) => {
    chatMessagesData.value.push(message);

    RequestAPI.post(`/chats/users/${targetUserId}/messages`, {
        ...message,
    }).then((response) => {
        console.log(response);
        message.status = MessageStatus.Sent;
        dynamicData.value.text = '';
    }).catch((error) => {
        console.log(error);
    })
}



onMounted(() => {
    //Initialize chat data

    retrieveChatData()
})

</script>


<style scoped lang="scss">


.footer{
    display: flex;
    align-items: center;
    justify-content: space-between;
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