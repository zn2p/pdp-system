// Toast 通知 —— 全局 UI 通知，由 UI 负责人维护

const { ref } = window.Vue;

export function useToasts() {
    const toasts = ref([]);

    function showToast(text, type = "success", duration = 3000) {
        const id = Date.now();
        toasts.value.push({ id, text, type });
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id);
        }, duration);
    }

    return { toasts, showToast };
}
