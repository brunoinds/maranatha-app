<template>
    <ion-accordion-group>
      <ion-accordion v-for="(value, key) in data" :key="key">
        <ion-item slot="header" color="light">
          <ion-input 
            :value="key" 
            @ionInput="onKeyChange($event, key)" 
            placeholder="Key"
          ></ion-input>
  
          <ion-select 
            :value="getType(value)" 
            @ionChange="onTypeChange(key, $event.detail.value)"
          >
            <ion-select-option value="text">Text</ion-select-option>
            <ion-select-option value="array">Array</ion-select-option>
            <ion-select-option value="object">Object</ion-select-option>
            <ion-select-option value="numeric">Numeric</ion-select-option>
            <ion-select-option value="boolean">Boolean</ion-select-option>
          </ion-select>
        </ion-item>
  
        <section slot="content">
          <!-- String Handling -->
          <section v-if="typeof value === 'string'">
            <ion-item>
              <ion-input v-model="data[key]" placeholder="New value"></ion-input>
            </ion-item>
          </section>
  
          <!-- Array Handling -->
          <section v-if="Array.isArray(value)">
            <RecursiveJsonEditor v-model="data[key]" />
            <ion-button @click="addItemToArray(key)">New Item</ion-button>
          </section>
  
          <!-- Object Handling -->
          <section v-if="isObject(value)">
            <RecursiveJsonEditor v-model="data[key]" />
            <ion-button @click="addKeyToObject(key)">New Key</ion-button>
          </section>
  
          <!-- Numeric Handling -->
          <section v-if="typeof value === 'number'">
            <ion-item>
              <ion-input type="number" v-model.number="data[key]" placeholder="01"></ion-input>
            </ion-item>
          </section>
  
          <!-- Boolean Handling -->
          <section v-if="typeof value === 'boolean'">
            <ion-item>
              <ion-select v-model="data[key]">
                <ion-select-option :value="true">True</ion-select-option>
                <ion-select-option :value="false">False</ion-select-option>
              </ion-select>
            </ion-item>
          </section>
        </section>
      </ion-accordion>
    </ion-accordion-group>
</template>
  
  <script lang="ts" setup>
  import { reactive, watch, defineProps, defineEmits, isRef } from 'vue';
  import { IonAccordionGroup, IonAccordion, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController, actionSheetController } from '@ionic/vue';

  interface Metadata {
    [key: string]: any;
  }
  
  const props = defineProps<{ modelValue: Metadata }>();
  const emit = defineEmits(['update:modelValue']);
  
  const data = reactive({ ...props.modelValue });
  
  watch(
    () => data,
    (newVal) => emit('update:modelValue', newVal),
    { deep: true }
  );
  
  const getType = (value: any) => {
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return typeof value;
  };
  
  const onTypeChange = (key: string, type: string) => {
    switch (type) {
      case 'string':
        data[key] = '';
        break;
      case 'array':
        data[key] = [];
        break;
      case 'object':
        data[key] = {};
        break;
      case 'numeric':
        data[key] = 0;
        break;
      case 'boolean':
        data[key] = false;
        break;
    }
  };
  
  const onKeyChange = (event: Event, oldKey: string) => {
    const input = event.target as HTMLInputElement;
    const newKey = input.value;
  
    if (newKey && newKey !== oldKey) {
      data[newKey] = data[oldKey];
      delete data[oldKey];
    }
  };
  
  const addItemToArray = (key: string) => {
    if (Array.isArray(data[key])) {
      (data[key] as any[]).push('');
    }
  };
  
  const addKeyToObject = (key: string) => {
    if (isObject(data[key])) {
      (data[key] as Metadata)['newKey'] = '';
    }
  };

  const isObject = (value: any) =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
</script>