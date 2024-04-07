<template>
    <input
        ref="inputRef"
        type="text"
        inputmode="decimal"
        :disabled="disabled"
    />
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input';

export default {
    name: 'CurrencyInput',
    props: {
        modelValue: Number,
        options: Object,
        disabled: Boolean,
    },
    setup(props) {
        const { inputRef } = useCurrencyInput(props.options)
        return { inputRef }
    }
}
</script>