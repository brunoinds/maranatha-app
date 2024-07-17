<template>
    <ion-page ref="page">
        <IonContextMenu trigger="account-info-btn">
            <ion-context-menu-item :icon="close" label="Terminar sesión" color="danger" @click="doLogout"/>
        </IonContextMenu>
        <ion-header>
            <ion-toolbar>
                <ion-title>Mi cuenta</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
                <ion-buttons slot="end">
                    <ion-button id="account-info-btn">
                        <ion-icon :icon="informationCircleOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <section class="content">
                <ion-list v-if="!isLoading" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <ion-item button @click="accountOptions">
                        <ion-avatar slot="start">
                            <img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                        </ion-avatar>
                        <ion-label>
                            <h2>{{ accountData.name }}</h2>
                            <p>{{ accountData.email }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item @click="doLogout" button>
                        <ion-icon color="danger" :icon="close" slot="start"></ion-icon>
                        <ion-label color="danger">Terminar sesión</ion-label>
                    </ion-item>
                </ion-list>

                <ion-list v-if="!isLoading" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <ion-item @click="allowNotifications" button v-if="isNotificationsNotAllowed">
                        <ion-icon slot="start" color="primary" :icon="notificationsCircle"></ion-icon>
                        <ion-label color="primary">
                            <h2>Autorizar notificaciones</h2>
                        </ion-label>
                    </ion-item>
                    <ion-item @click="() => {liveUpdates.state == 'NoUpdateAvailable' ? lookForUpdates() : undefined}" :button="liveUpdates.state == 'NoUpdateAvailable'">
                        <ion-icon class="rotate" v-if="liveUpdates.state != 'ReadyToInstall' && liveUpdates.state != 'NoUpdateAvailable'" slot="start" color="medium" :icon="syncOutline"></ion-icon>
                        <ion-icon v-if="liveUpdates.state == 'ReadyToInstall'" slot="start" color="medium" :icon="cloudDoneOutline"></ion-icon>
                        <ion-icon v-if="liveUpdates.state == 'NoUpdateAvailable'" slot="start" color="medium" :icon="shieldCheckmarkOutline"></ion-icon>

                        <ion-label color="medium" v-if="liveUpdates.state == 'Searching'">
                            <h2>Actualización de seguridad</h2>
                            <p>Buscando actualizaciones...</p>
                        </ion-label>

                        <ion-label color="medium" v-if="liveUpdates.state == 'NoUpdateAvailable'">
                            <h2>Actualización de seguridad</h2>
                            <p>Su aplicación está actualizada (v{{ Environment.version() }})</p>
                            <p>Clic para buscar nuevas actualizaciones</p>
                        </ion-label>

                        <ion-label color="medium"  v-if="liveUpdates.state == 'Downloading'">
                            <h2>Nueva actualización disponible</h2>
                            <p>v{{ liveUpdates.availableUpdate?.version }} ({{ liveUpdates.availableUpdate.size }})</p>
                            <p>Descargando actualización...</p>
                        </ion-label>

                        <ion-label color="medium"  v-if="liveUpdates.state == 'Installing'">
                            <h2>Nueva actualización disponible</h2>
                            <p>v{{ liveUpdates.availableUpdate?.version }} ({{ liveUpdates.availableUpdate.size }})</p>
                            <p>Instalando actualización...</p>
                        </ion-label>

                        <ion-label color="medium"  v-if="liveUpdates.state == 'ReadyToInstall'">
                            <h2>Nueva actualización disponible</h2>
                            <p>v{{ liveUpdates.availableUpdate?.version }} ({{ liveUpdates.availableUpdate.size }})</p>
                            <p>Listo para instalar actualización</p>
                        </ion-label>


                        <ion-button v-if="liveUpdates.state == 'ReadyToInstall'" @click="updateNow">Instalar ahora</ion-button>
                    </ion-item>

                    
                </ion-list>

                <ion-list v-if="true">
                    <br>

                    <IonPeekPop v-if="!isLoading">
                        <template v-slot:item>
                            <ion-item button>
                                <ion-avatar slot="start">
                                    <img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                                </ion-avatar>
                                <ion-label>
                                    <h2>{{ accountData.name }}</h2>
                                    <p>{{ accountData.email }}</p>
                                </ion-label>
                            </ion-item>
                        </template>
                        <template v-slot:popover>
                            <ion-img :src="'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*'"></ion-img>
                        </template>
                    </IonPeekPop>

                    <IonPeekPop v-if="!isLoading">
                        <template v-slot:item>
                            <img width="100" :src="'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*'">
                        </template>
                        <template v-slot:popover>
                            <ion-img  :src="'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*'"></ion-img>
                        </template>
                    </IonPeekPop>

                    <IonPeekPop v-if="!isLoading">
                        <template v-slot:item>
                            <ion-item button>
                                <ion-avatar slot="start">
                                    <img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                                </ion-avatar>
                                <ion-label>
                                    <h2>{{ accountData.name }}</h2>
                                    <p>{{ accountData.email }}</p>
                                </ion-label>
                            </ion-item>
                        </template>
                        <template v-slot:popover>
                            <ion-img :src="'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*'"></ion-img>
                        </template>
                    </IonPeekPop>


                    <IonPeekPop>
                        <template v-slot:item>
                            <ion-item>
                                <ion-label>Peek Pop</ion-label>
                            </ion-item>
                        </template>
                        <template v-slot:popover>
                            <ion-img :src="'https://i.natgeofe.com/n/4f5aaece-3300-41a4-b2a8-ed2708a0a27c/domestic-dog_thumb_square.jpg'"></ion-img>
                        </template>
                        <template v-slot:contextmenu>
                            <ion-context-menu-item :icon="close" label="Terminar sesión" color="danger" @click="() => {console.log('Click')}"/>
                            <ion-context-menu-item :icon="close" label="Terminar sesión" color="danger" @click="() => {console.log('Click')}"/>
                            <ion-context-menu-item :icon="close" label="Terminar sesión" color="danger" @click="() => {console.log('Click')}"/>
                            <ion-context-menu-item :icon="close" label="Terminar sesión" color="danger" @click="() => {console.log('Click')}"/>
                        </template>
                    </IonPeekPop>

                </ion-list>
            </section>
        </ion-content>
        <ion-footer>
            <ion-list>
                
            </ion-list>
            
            <ion-toolbar class="version-toolbar">
                <section class="ion-padding">
                    <pre style="font-size: 12px; color: darkgray; margin: 0">{{ aboutAppText }}</pre>
                </section>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { IonAvatar, IonContent, IonFooter, IonHeader, IonToggle, IonImg, IonIcon,IonButton, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, actionSheetController, alertController, toastController } from '@ionic/vue';
import { computed, onUnmounted, ref } from 'vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { Environment } from '@/utils/Environment/Environment';
import { Notifications } from '@/utils/Notifications/Notifications';
import { Session } from '@/utils/Session/Session';
import { Viewport } from '@/utils/Viewport/Viewport';
import { close, notificationsCircle, syncOutline, cloudDoneOutline, shieldCheckmarkOutline, moonOutline, informationCircleOutline } from 'ionicons/icons';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LiveUpdates } from '@/utils/LiveUpdates/LiveUpdates';
import { Theme } from '@/utils/Theme/Theme';
import IonContextMenu from '@/components/IonContextMenu/IonContextMenu.vue';
import IonContextMenuItem from '@/components/IonContextMenu/IonContextMenuItem.vue';
import IonPeekPop from '@/components/IonPeekPop/IonPeekPop.vue';

const aboutAppText = ref<string>(`  Code version: ${Environment.version()} \nNative version: ${Environment.storeVersioning().version} (${Environment.storeVersioning().build})`);
const accountData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const isAdmin = ref<boolean>(false);
const isNotificationsNotAllowed = ref<boolean>(false);

const isDarkModeActive = ref<boolean>(Theme.getTheme() == 'dark');



const changeTheme = () => {
    Theme.setTheme(isDarkModeActive.value ? 'dark' : 'light');
}

const liveUpdates = computed(() => {
    return {
        ...LiveUpdates.externalLabels.value,
        availableUpdate: {
            ...LiveUpdates.externalLabels.value.availableUpdate,
            size: (LiveUpdates.externalLabels.value.availableUpdate?.size / (1024 * 1024)).toFixed(2) + ' MB'
        }
    }
});
const updateNow = () => {LiveUpdates.installUpdateIfAvailableAndReady()}

const lookForUpdates = () => {
    LiveUpdates.fetchUpdates(true);
}

const goToLogin = () => {
    router.replace('/login');
}
const checkForNotificationAllow = async () => {
    const result = await Notifications.checkForPermission();
    if (result == "NotAsked"){
        isNotificationsNotAllowed.value = true;
    }else{
        isNotificationsNotAllowed.value = false;
    }

    return result;
}
const allowNotifications = async () => {
    await Notifications.softAskForPermission();
    checkForNotificationAllow();
}
const loadAccount = async () => {
    accountData.value = await RequestAPI.get('/account/me');
    isLoading.value = false;

    const currentSession = await Session.getCurrentSession();
    if (!currentSession){
        return;
    };

    isAdmin.value = currentSession.roles().includes("admin");
}

const doLogout = async () => {
    Session.getCurrentSession().then(async (session: Session) => {
        if (!session){
            goToLogin();
        }
        session.logout().then(() => {
            goToLogin();
        }).catch((error) => {
            console.error(error)
        })
    });
}
loadAccount();
checkForNotificationAllow();

const doDeleteMyAccount = async () => {
    const alert = await alertController.create({
        header: 'Eliminar mi cuenta',
        message: '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                }
            },
            {
                text: 'Eliminar',
                role: 'destructive',
                handler: async () => {
                    if (isAdmin.value){
                        const toast =  await toastController.create({
                            message: '❌ No puedes eliminar tu cuenta porque eres administrador',
                            duration: 2000
                        })
                        toast.present();
                        return;
                    }


                    try {
                        const response = await RequestAPI.delete('/me/account');
                        if (response.status == 200){
                            const session = await Session.getCurrentSession() as unknown as Session;
                            if (!session){
                                goToLogin();
                            }
                            await session.logout({
                                force: true
                            });
                            const toast =  await toastController.create({
                                message: '✅ Cuenta eliminada con éxito',
                                duration: 2000
                            })
                            toast.present();
                            goToLogin();
                        }
                    } catch (error:any) {
                        alertController.create({
                            header: 'Error',
                            message: 'No se pudo eliminar tu cuenta por el siguiente error: ' + error.message,
                            buttons: ['Ok']
                        }).then((alert) => {
                            alert.present();
                        })
                    }
                    
                }
            }
        ]
    });

    alert.present();
}

const accountOptions = async () => {
    await actionSheetController.create({
        header: 'Configuración de cuenta',
        buttons: [
            {
                text: 'Eliminar mi cuenta',
                role: 'destructive',
                handler: () => {
                    doDeleteMyAccount()
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                }
            }
        ]
    }).then((actionSheet) => {
        actionSheet.present();
    })
}

let notificationAllowanceChecker:any = null;
onMounted(() => {
    notificationAllowanceChecker = setInterval(async () => {
        const response = await checkForNotificationAllow();
        if (response != "NotAsked"){
            clearInterval(notificationAllowanceChecker);
        }
    }, 600);

    onUnmounted(() => {
        clearInterval(notificationAllowanceChecker);
    })
})
</script>


<style scoped lang="scss">

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

.version-toolbar{
    --background: var(--ion-color-light);
    --border-color: var(--ion-color-light);
    --border-style: none;
}

.rotate {
    animation: rotation 2s infinite linear;
}

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(359deg);
    }
}
</style>