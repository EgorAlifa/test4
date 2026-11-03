<template>
    <button
        type="button"
        class="aiw-fab"
        :class="[`aiw-fab--${visual.shape}`, { 'aiw-fab--pulse': pulse, 'aiw-fab--labeled': !!visual.label }]"
        :style="visual.style"
        :title="title"
        :aria-label="title"
        @click="$emit('click', $event)">
        <svg v-if="visual.iconPath" viewBox="0 0 24 24" :width="visual.iconSize" :height="visual.iconSize" aria-hidden="true">
            <path fill="currentColor" :d="visual.iconPath" />
        </svg>
        <span v-if="visual.label" class="aiw-fab__label">{{ visual.label }}</span>
    </button>
</template>

<script>
/**
 * Плавающая кнопка помощника. Только внешний вид: положение на странице
 * задаёт виджет (класс .aiw-fab-fixed), а превью в панели — свой контейнер.
 */
import { fabVisual } from '../fab';

export default {
    name: 'FabButton',
    props: {
        /** props виджета (fab*, accentColor) */
        config: { type: Object, required: true },
        title: { type: String, default: '' },
        /** пульсирующее кольцо — пока кнопку ни разу не открыли */
        pulse: { type: Boolean, default: false }
    },
    computed: {
        visual() {
            return fabVisual(this.config);
        }
    }
};
</script>

<style scoped>
.aiw-fab {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45em;
    box-sizing: border-box;
    margin: 0;
    font-family: inherit;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.aiw-fab:hover {
    transform: translateY(-2px) scale(1.04);
    filter: brightness(1.05);
}

.aiw-fab:focus-visible {
    outline: 3px solid var(--aiw-fab-glow);
    outline-offset: 3px;
}

.aiw-fab svg {
    flex-shrink: 0;
}

.aiw-fab__label {
    letter-spacing: 0.01em;
}

.aiw-fab--pulse::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: 0 0 0 0 var(--aiw-fab-glow);
    animation: aiw-fab-pulse 2s ease-out infinite;
    pointer-events: none;
}

@keyframes aiw-fab-pulse {
    0% {
        box-shadow: 0 0 0 0 var(--aiw-fab-glow);
    }
    70% {
        box-shadow: 0 0 0 14px transparent;
    }
    100% {
        box-shadow: 0 0 0 0 transparent;
    }
}

@media (prefers-reduced-motion: reduce) {
    .aiw-fab,
    .aiw-fab:hover {
        transition: none;
        transform: none;
    }

    .aiw-fab--pulse::after {
        animation: none;
    }
}
</style>
