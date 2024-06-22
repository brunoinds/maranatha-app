<template>
    <ion-datetime
      presentation="date"
      locale="es-ES"
      multiple
      :value="currentUserSelection"
      v-on:ion-change="handleDateChange"
      :highlighted-dates="defineHighlightStyle"
      v-bind="$attrs"
    />
  </template>
  <script setup lang="ts">
  import { IonDatetime, DatetimeChangeEventDetail } from '@ionic/vue';
  import { IonDatetimeCustomEvent, DatetimeHighlightCallback } from '@ionic/core';
  import { onMounted, ref } from 'vue';
  import { DateTime } from 'luxon';
import { Theme } from '@/utils/Theme/Theme';
  
  interface ClinkDatetimeRange {
    start: string;
    end: string;
  }
  
  const props = defineProps<ClinkDatetimeRange>();
  const emit = defineEmits<{
    (e: 'update:start' | 'update:end', date: string): void;
  }>();
  
  const currentUserSelection = ref<string[] | undefined>();
  const previousUserSelection = ref<string[] | undefined>();
  
  onMounted(() => {
    const initRange: string[] = [props.start, props.end];
    currentUserSelection.value = previousUserSelection.value = initRange;
  });
  
  const defineHighlightStyle: DatetimeHighlightCallback = (date: string) => {
    if (!currentUserSelection.value || currentUserSelection.value.length < 2)
      return;
    const startDateCurrentRange = DateTime.fromFormat(
      currentUserSelection.value[0],
      'yyyy-MM-dd'
    );
    const endDateCurrentRange = DateTime.fromFormat(
      currentUserSelection.value.at(-1) as string,
      'yyyy-MM-dd'
    );
    const formattedDate = DateTime.fromFormat(date, 'yyyy-MM-dd');
    const isDateWhithinRange =
      formattedDate > startDateCurrentRange &&
      formattedDate < endDateCurrentRange;
  
    if (isDateWhithinRange)
      return {
        backgroundColor: Theme.getTheme() == 'dark' ?  '#2f3640' : '#e4edff',
      };
  };
  
  const handleDateChange = (
    e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>
  ) => {
    currentUserSelection.value = e.detail.value as string[] | undefined;
  
    if (!currentUserSelection.value && !previousUserSelection.value) return;
  
    if (!currentUserSelection.value || currentUserSelection.value.length < 2)
      return;
  
    currentUserSelection.value = [...currentUserSelection.value].sort((a, b) =>
      a > b ? 1 : -1
    );
  
    if (previousUserSelection.value && previousUserSelection.value.length >= 2) {
      const isSelectionWhithinPreviousRange =
        currentUserSelection.value.length < previousUserSelection.value.length;
  
      if (isSelectionWhithinPreviousRange) {
        const selectedDateWhithinPreviousRange =
          previousUserSelection.value.filter(
            (date) => !(currentUserSelection.value as string[]).includes(date)
          );
        currentUserSelection.value = selectedDateWhithinPreviousRange;
      } else {
        const lastUserSelection = [(e.detail.value as string[]).at(-1) as string];
        currentUserSelection.value = lastUserSelection;
      }
    }
  
    previousUserSelection.value = currentUserSelection.value;
    emit('update:start', currentUserSelection.value[0]);
    emit('update:end', currentUserSelection.value.at(-1) as string);
  };
  </script>