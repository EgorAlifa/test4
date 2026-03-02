<template>
    <div class="fill-row" :class="{ 'fill-row--disabled': !fill.visible }">
        <!-- Color swatch -->
        <div class="fill-row__swatch-wrapper">
            <input
                type="color"
                :value="colorValue"
                class="fill-row__color-input"
                @input="updateColor($event.target.value)"
            />
            <div
                class="fill-row__swatch"
                :style="swatchStyle"
            />
        </div>

        <!-- Color value -->
        <input
            type="text"
            :value="colorValue"
            class="fill-row__hex"
            @change="updateColor($event.target.value)"
        />

        <!-- Opacity -->
        <div class="fill-row__opacity">
            <input
                type="number"
                :value="opacityPercent"
                min="0"
                max="100"
                class="fill-row__opacity-input"
                @input="updateOpacity($event.target.value)"
            />
            <span class="fill-row__opacity-symbol">%</span>
        </div>

        <!-- Visibility toggle -->
        <button
            class="fill-row__btn fill-row__visibility"
            :class="{ 'fill-row__visibility--hidden': !fill.visible }"
            :title="fill.visible ? 'Скрыть' : 'Показать'"
            @click="toggleVisibility"
        >
            <svg v-if="fill.visible" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
        </button>

        <!-- Delete button -->
        <button
            class="fill-row__btn fill-row__delete"
            title="Удалить"
            @click="$emit('remove')"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    </div>
</template>

<script>
export default {
    name: 'FillRow',

    props: {
        fill: {
            type: Object,
            required: true
        }
    },

    computed: {
        colorValue() {
            return this.fill.color || '#FFFFFF';
        },

        opacityPercent() {
            const opacity = this.fill.opacity != null ? this.fill.opacity : 1;
            return Math.round(opacity * 100); // eslint-disable-line no-magic-numbers
        },

        swatchStyle() {
            if (this.fill.type === 'linear-gradient' && this.fill.gradient) {
                const { angle = 90, stops = [] } = this.fill.gradient; // eslint-disable-line no-magic-numbers
                const stopsCSS = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
                return { background: `linear-gradient(${angle}deg, ${stopsCSS})` };
            }
            if (this.fill.type === 'radial-gradient' && this.fill.gradient) {
                const { stops = [] } = this.fill.gradient;
                const stopsCSS = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
                return { background: `radial-gradient(circle, ${stopsCSS})` };
            }
            return { backgroundColor: this.colorValue };
        }
    },

    methods: {
        updateColor(value) {
            this.$emit('update', { ...this.fill, color: value });
        },

        updateOpacity(value) {
            const opacity = Math.min(100, Math.max(0, parseInt(value, 10) || 0)) / 100; // eslint-disable-line no-magic-numbers
            this.$emit('update', { ...this.fill, opacity });
        },

        toggleVisibility() {
            this.$emit('update', { ...this.fill, visible: !this.fill.visible });
        }
    }
};
</script>

<style scoped>
.fill-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #f9fafb;
    border-radius: 6px;
    margin-bottom: 6px;
}

.fill-row--disabled {
    opacity: 0.5;
}

.fill-row__swatch-wrapper {
    position: relative;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
}

.fill-row__color-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.fill-row__swatch {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    pointer-events: none;
}

.fill-row__hex {
    flex: 1;
    min-width: 0;
    padding: 4px 8px;
    font-size: 12px;
    font-family: monospace;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: #ffffff;
    text-transform: uppercase;
}

.fill-row__hex:focus {
    outline: none;
    border-color: #3b82f6;
}

.fill-row__opacity {
    display: flex;
    align-items: center;
    gap: 2px;
    width: 54px;
    flex-shrink: 0;
}

.fill-row__opacity-input {
    width: 36px;
    padding: 4px;
    font-size: 12px;
    text-align: right;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: #ffffff;
}

.fill-row__opacity-input:focus {
    outline: none;
    border-color: #3b82f6;
}

/* Hide number input spinners */
.fill-row__opacity-input::-webkit-inner-spin-button,
.fill-row__opacity-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.fill-row__opacity-input[type="number"] {
    -moz-appearance: textfield;
}

.fill-row__opacity-symbol {
    font-size: 12px;
    color: #9ca3af;
}

.fill-row__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 4px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
}

.fill-row__btn:hover {
    background: #e5e7eb;
    color: #374151;
}

.fill-row__visibility--hidden {
    color: #d1d5db;
}

.fill-row__delete:hover {
    background: #fee2e2;
    color: #dc2626;
}
</style>
