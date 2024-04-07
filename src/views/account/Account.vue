<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Mi cuenta</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
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

                    <ion-item @click="allowNotifications" button v-if="isNotificationsNotAllowed">
                        <ion-icon slot="start" color="primary" :icon="notificationsCircle"></ion-icon>
                        <ion-label color="primary">
                            <h2>Autorizar notificaciones</h2>
                        </ion-label>
                    </ion-item>

                    <ion-item @click="doLogout" button>
                        <ion-icon color="danger" :icon="close" slot="start"></ion-icon>
                        <ion-label color="danger">Terminar sesión</ion-label>
                    </ion-item>
                </ion-list>
            </section>
        </ion-content>
        <ion-footer>
            <ion-toolbar class="version-toolbar">
                <section class="ion-padding">
                    <pre style="font-size: 12px; color: darkgray; margin: 0">{{ aboutAppText }}</pre>
                </section>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { IonAvatar, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, actionSheetController, alertController, toastController } from '@ionic/vue';
import { onUnmounted, ref } from 'vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { Environment } from '@/utils/Environment/Environment';
import { Notifications } from '@/utils/Notifications/Notifications';
import { Session } from '@/utils/Session/Session';
import { Viewport } from '@/utils/Viewport/Viewport';
import { close, notificationsCircle } from 'ionicons/icons';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const aboutAppText = ref<string>(`Version: ${Environment.version()} \nBuild: ${Environment.build()}`);
const accountData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const isAdmin = ref<boolean>(false);
const isNotificationsNotAllowed = ref<boolean>(false);

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
    --background: white;
    --border-color: white;
    --border-style: none;
}

</style>