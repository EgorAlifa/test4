<template>
    <div v-if="isVisible" class="loading-overlay">
        <div class="loading-spinner"></div>
    </div>
</template>

<script>
export default {
    name: 'MapLoadingSpinner',

    props: {
        isVisible: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<style scoped>
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: opacity 0.2s ease-in-out;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

:deep(.theme-dark) .loading-overlay {
    background: rgba(0, 0, 0, 0.3);
}

:deep(.theme-dark) .loading-spinner {
    border-color: rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
}

:deep(.theme-light) .loading-overlay {
    background: rgba(255, 255, 255, 0.2);
}

:deep(.theme-light) .loading-spinner {
    border-color: rgba(0, 0, 0, 0.2);
    border-top-color: #000;
}

:deep(.theme-standard) .loading-overlay {
    background: rgba(0, 0, 0, 0.2);
}

:deep(.theme-standard) .loading-spinner {
    border-color: rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
}
</style>

