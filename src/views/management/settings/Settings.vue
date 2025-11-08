<template>
    <article class="content">
        <ion-list :inset="true">
            <ion-item @click="goToJobs" button>
                <ion-label color="primary">
                    <h2>Modificar Jobs</h2>
                </ion-label>
            </ion-item>
            <ion-item @click="goToExpenses" button>
                <ion-label color="primary">
                    <h2>Modificar Expenses</h2>
                </ion-label>
            </ion-item>
        </ion-list>
    </article>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonList } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToJobs = () => {
    router.push('/jobs');
}
const goToExpenses = () => {
    router.push('/expenses');
}

</script>

<style scoped lang="scss">

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

</style>