import { ref } from "vue";

const page = ref<HTMLElement|null>(null);
const setPage = (el: HTMLElement|null) => {
    page.value = el;
}


export const useManagementHtml = () => {
    return {
        page,
        setPage
    }
}