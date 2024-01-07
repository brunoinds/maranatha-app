<template>
    <input
        ref="inputRef"
        type="text"
        :disabled="disabled"
    />
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input';

export default {
    name: 'CurrencyInput',
    props: {
        modelValue: Number, // Vue 2: value
        options: Object,
        disabled: Boolean,
    },
    setup(props) {
        const { inputRef } = useCurrencyInput(props.options)

        return { inputRef }
    }
}
</script>