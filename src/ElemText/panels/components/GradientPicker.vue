<template>
    <div class="gradient-picker">
        <!-- Type selector -->
        <div class="type-selector">
            <button
                v-for="type in types"
                :key="type.value"
                class="type-btn"
                :class="{ 'type-btn--active': fillType === type.value }"
                @click="setType(type.value)"
            >
                {{ type.label }}
            </button>
        </div>

        <!-- Solid color picker -->
        <div v-if="fillType === 'solid'" class="solid-picker">
            <div class="color-row">
                <input
                    type="color"
                    :value="color"
                    class="color-input"
                    @input="updateColor($event.target.value)"
                />
                <input
                    type="text"
                    :value="color"
                    class="color-hex"
                    @change="updateColor($event.target.value)"
                />
            </div>
        </div>

        <!-- Linear gradient editor -->
        <div v-else-if="fillType === 'linear-gradient'" class="gradient-editor">
            <!-- Angle control -->
            <div class="angle-control">
                <label>Angle</label>
                <div class="angle-input-row">
                    <input
                        type="range"
                        :value="angle"
                        min="0"
                        max="360"
                        class="angle-slider"
                        @input="updateAngle(parseInt($event.target.value, 10))"
                    />
                    <input
                        type="number"
                        :value="angle"
                        min="0"
                        max="360"
                        class="angle-number"
                        @input="updateAngle(parseInt($event.target.value, 10) || 0)"
                    />
                    <span>°</span>
                </div>
            </div>

            <!-- Gradient preview -->
            <div class="gradient-preview" :style="gradientPreviewStyle">
                <div
                    v-for="(stop, index) in stops"
                    :key="index"
                    class="gradient-stop"
                    :style="{ left: stop.position + '%' }"
                    :class="{ 'gradient-stop--active': activeStop === index }"
                    @click="activeStop = index"
                >
                    <div class="gradient-stop__marker" :style="{ backgroundColor: stop.color }" />
                </div>
            </div>

            <!-- Stops editor -->
            <div class="stops-list">
                <div
                    v-for="(stop, index) in stops"
                    :key="index"
                    class="stop-row"
                    :class="{ 'stop-row--active': activeStop === index }"
                    @click="activeStop = index"
                >
                    <input
                        type="color"
                        :value="stop.color"
                        class="stop-color"
                        @input="updateStop(index, 'color', $event.target.value)"
                    />
                    <input
                        type="number"
                        :value="stop.position"
                        min="0"
                        max="100"
                        class="stop-position"
                        @input="updateStop(index, 'position', parseInt($event.target.value, 10) || 0)"
                    />
                    <span class="stop-percent">%</span>
                    <button
                        v-if="stops.length > 2"
                        class="stop-delete"
                        @click.stop="removeStop(index)"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <button class="add-stop-btn" @click="addStop">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add stop
                </button>
            </div>
        </div>

        <!-- Radial gradient editor -->
        <div v-else-if="fillType === 'radial-gradient'" class="gradient-editor">
            <!-- Gradient preview -->
            <div class="gradient-preview gradient-preview--radial" :style="radialPreviewStyle">
                <div
                    v-for="(stop, index) in stops"
                    :key="index"
                    class="gradient-stop gradient-stop--radial"
                    :style="{ left: stop.position + '%' }"
                    :class="{ 'gradient-stop--active': activeStop === index }"
                    @click="activeStop = index"
                >
                    <div class="gradient-stop__marker" :style="{ backgroundColor: stop.color }" />
                </div>
            </div>

            <!-- Stops editor (same as linear) -->
            <div class="stops-list">
                <div
                    v-for="(stop, index) in stops"
                    :key="index"
                    class="stop-row"
                    :class="{ 'stop-row--active': activeStop === index }"
                    @click="activeStop = index"
                >
                    <input
                        type="color"
                        :value="stop.color"
                        class="stop-color"
                        @input="updateStop(index, 'color', $event.target.value)"
                    />
                    <input
                        type="number"
                        :value="stop.position"
                        min="0"
                        max="100"
                        class="stop-position"
                        @input="updateStop(index, 'position', parseInt($event.target.value, 10) || 0)"
                    />
                    <span class="stop-percent">%</span>
                    <button
                        v-if="stops.length > 2"
                        class="stop-delete"
                        @click.stop="removeStop(index)"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <button class="add-stop-btn" @click="addStop">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add stop
                </button>
            </div>
        </div>
    </div>
</template>

<script>
const DEFAULT_GRADIENT = {
    angle: 90, // eslint-disable-line no-magic-numbers
    stops: [
        { color: '#FF0000', position: 0, opacity: 1 },
        { color: '#0000FF', position: 100, opacity: 1 } // eslint-disable-line no-magic-numbers
    ]
};

export default {
    name: 'GradientPicker',

    props: {
        fill: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            activeStop: 0,
            types: [
                { value: 'solid', label: 'Solid' },
                { value: 'linear-gradient', label: 'Linear' },
                { value: 'radial-gradient', label: 'Radial' }
            ]
        };
    },

    computed: {
        fillType() {
            return this.fill.type || 'solid';
        },

        color() {
            return this.fill.color || '#FFFFFF';
        },

        gradient() {
            return this.fill.gradient || DEFAULT_GRADIENT;
        },

        angle() {
            return this.gradient.angle || 90; // eslint-disable-line no-magic-numbers
        },

        stops() {
            return this.gradient.stops || DEFAULT_GRADIENT.stops;
        },

        gradientPreviewStyle() {
            const stopsCSS = this.stops
                .slice()
                .sort((a, b) => a.position - b.position)
                .map(stop => `${stop.color} ${stop.position}%`)
                .join(', ');
            return {
                background: `linear-gradient(${this.angle}deg, ${stopsCSS})`
            };
        },

        radialPreviewStyle() {
            const stopsCSS = this.stops
                .slice()
                .sort((a, b) => a.position - b.position)
                .map(stop => `${stop.color} ${stop.position}%`)
                .join(', ');
            return {
                background: `radial-gradient(circle, ${stopsCSS})`
            };
        }
    },

    methods: {
        setType(type) {
            const updatedFill = { ...this.fill, type };
            if (type !== 'solid' && !this.fill.gradient) {
                updatedFill.gradient = { ...DEFAULT_GRADIENT };
            }
            this.$emit('update', updatedFill);
        },

        updateColor(color) {
            this.$emit('update', { ...this.fill, color });
        },

        updateAngle(angle) {
            const clampedAngle = Math.max(0, Math.min(360, angle)); // eslint-disable-line no-magic-numbers
            this.$emit('update', {
                ...this.fill,
                gradient: { ...this.gradient, angle: clampedAngle }
            });
        },

        updateStop(index, prop, value) {
            const newStops = [...this.stops];
            newStops[index] = { ...newStops[index], [prop]: value };
            this.$emit('update', {
                ...this.fill,
                gradient: { ...this.gradient, stops: newStops }
            });
        },

        addStop() {
            // Add a new stop in the middle between the last two stops
            const sortedStops = [...this.stops].sort((a, b) => a.position - b.position);
            const lastIndex = sortedStops.length - 1;
            const newPosition = Math.round((sortedStops[lastIndex - 1].position + sortedStops[lastIndex].position) / 2); // eslint-disable-line no-magic-numbers
            const newStop = {
                color: '#888888',
                position: newPosition,
                opacity: 1
            };
            this.$emit('update', {
                ...this.fill,
                gradient: { ...this.gradient, stops: [...this.stops, newStop] }
            });
            this.activeStop = this.stops.length;
        },

        removeStop(index) {
            if (this.stops.length <= 2) return; // eslint-disable-line no-magic-numbers
            const newStops = [...this.stops];
            newStops.splice(index, 1);
            this.$emit('update', {
                ...this.fill,
                gradient: { ...this.gradient, stops: newStops }
            });
            if (this.activeStop >= newStops.length) {
                this.activeStop = newStops.length - 1;
            }
        }
    }
};
</script>

<style scoped>
.gradient-picker {
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
}

/* Type selector */
.type-selector {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
}

.type-btn {
    flex: 1;
    padding: 8px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 6px;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
}

.type-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
}

.type-btn--active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 500;
}

/* Solid picker */
.color-row {
    display: flex;
    gap: 8px;
    align-items: center;
}

.color-input {
    width: 36px;
    height: 36px;
    padding: 2px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
}

.color-hex {
    flex: 1;
    padding: 8px;
    font-size: 13px;
    font-family: monospace;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    text-transform: uppercase;
}

.color-hex:focus {
    outline: none;
    border-color: #3b82f6;
}

/* Angle control */
.angle-control {
    margin-bottom: 12px;
}

.angle-control label {
    display: block;
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.angle-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.angle-slider {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444);
    appearance: none;
    cursor: pointer;
}

.angle-slider::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #374151;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: grab;
}

.angle-number {
    width: 50px;
    padding: 6px 8px;
    font-size: 13px;
    text-align: right;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
}

.angle-number:focus {
    outline: none;
    border-color: #3b82f6;
}

.angle-input-row > span {
    font-size: 13px;
    color: #6b7280;
}

/* Gradient preview */
.gradient-preview {
    position: relative;
    height: 32px;
    border-radius: 6px;
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
}

.gradient-preview--radial {
    height: 64px;
    border-radius: 50%;
    width: 64px;
    margin: 0 auto 12px;
}

.gradient-stop {
    position: absolute;
    bottom: -8px;
    transform: translateX(-50%);
    cursor: pointer;
}

.gradient-stop--radial {
    bottom: auto;
    top: 100%;
    margin-top: 4px;
}

.gradient-stop__marker {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.gradient-stop--active .gradient-stop__marker {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Stops list */
.stops-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.stop-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
}

.stop-row--active {
    border-color: #3b82f6;
    background: #f0f9ff;
}

.stop-color {
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
}

.stop-position {
    width: 48px;
    padding: 4px 6px;
    font-size: 12px;
    text-align: right;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
}

.stop-position:focus {
    outline: none;
    border-color: #3b82f6;
}

.stop-percent {
    font-size: 12px;
    color: #9ca3af;
}

.stop-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 4px;
    margin-left: auto;
}

.stop-delete:hover {
    background: #fee2e2;
    color: #dc2626;
}

.add-stop-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    border: 1px dashed #d1d5db;
    background: transparent;
    border-radius: 6px;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
}

.add-stop-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f0f9ff;
}

/* Hide number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
}
</style>
