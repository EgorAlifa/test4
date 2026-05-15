<template>
    <div 
        v-if="showLegend && legendItems.length > 0"
        class="elemwowmap-legend elemwowmap-choropleth-legend"
        :class="'theme-' + currentTheme"
        role="complementary"
        aria-label="Легенда хороплета"
    >
        <div class="elemwowmap-legend-header">
            {{ title }}
        </div>
        
        <div class="elemwowmap-legend-items">
            <div 
                v-for="(item, index) in legendItems" 
                :key="index" 
                class="elemwowmap-legend-item"
            >
                <span
                    class="elemwowmap-legend-color-box"
                    :style="{ backgroundColor: item.color }"
                ></span>
                <span class="elemwowmap-legend-label">
                    {{ item.label }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { ColorPalettes } from '../utils/constants';

export default {
    name: 'ChoroplethLegend',

    props: {
        data: {
            type: Object,
            default: () => ({})
        },
        colorScheme: {
            type: String,
            default: 'Blues'
        },
        colorSteps: {
            type: Number,
            default: 5 // eslint-disable-line no-magic-numbers
        },
        title: {
            type: String,
            default: 'Легенда'
        },
        currentTheme: {
            type: String,
            default: 'dark'
        },
        showLegend: {
            type: Boolean,
            default: true
        }
    },

    computed: {
        legendItems() {
            if (this.data == null || Object.keys(this.data).length === 0) {
                return [];
            }

            // Get all values to calculate min/max, filter out invalid values
            const values = Object.values(this.data)
                .filter(val => val != null && !Number.isNaN(val) && typeof val === 'number');
            
            if (values.length === 0) {
                return [];
            }
            
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            
            // Handle case where min/max are invalid
            if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
                return [];
            }

            // If all values are the same, show single range
            if (minValue === maxValue) {
                return [{
                    color: this.getColorFromPalette(0),
                    label: this.formatValue(minValue)
                }];
            }

            // Get color palette
            const palette = ColorPalettes[this.colorScheme] || ColorPalettes.Blues;
            const numSteps = Math.min(this.colorSteps, palette.length);

            // Generate legend items
            const items = [];
            const step = (maxValue - minValue) / (numSteps - 1);

            for (let i = 0; i < numSteps; i++) {
                const ratio = i / (numSteps - 1);
                const color = this.getColorFromPalette(ratio);
                
                let label;
                const lowerBound = Math.floor(minValue + (i * step));
                const upperBound = Math.floor(minValue + ((i + 1) * step));

                if (i === 0) {
                    // First range: show from minValue (or 0 if minValue is 0) to upperBound
                    label = minValue === 0
                        ? `0 - ${this.formatValue(upperBound)}`
                        : `${this.formatValue(minValue)} - ${this.formatValue(upperBound)}`;
                } else if (i === numSteps - 1) {
                    // Last range: show from lowerBound+
                    label = `${this.formatValue(lowerBound)}+`;
                } else {
                    // Middle ranges: show from lowerBound+1 to upperBound
                    label = `${this.formatValue(lowerBound + 1)} - ${this.formatValue(upperBound)}`;
                }

                items.push({
                    color,
                    label
                });
            }

            return items;
        }
    },

    methods: {
        getColorFromPalette(ratio) {
            const palette = ColorPalettes[this.colorScheme] || ColorPalettes.Blues;
            
            // Clamp ratio between 0 and 1
            const clampedRatio = Math.max(0, Math.min(1, ratio));
            
            // Calculate which color to use based on ratio (0-1)
            const index = Math.min(
                Math.floor(clampedRatio * palette.length),
                palette.length - 1
            );
            
            return palette[index];
        },

        formatValue(value) {
            if (value == null || Number.isNaN(value)) {
                return '0';
            }
            
            // Format number with spaces as thousands separator (Russian format)
            return new Intl.NumberFormat('ru-RU', {
                maximumFractionDigits: 0
            }).format(value);
        }
    }
};
</script>

<style scoped>
.elemwowmap-choropleth-legend {
    max-width: 220px;
    min-width: 180px;
    padding: 12px;
    border-radius: 16px;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    pointer-events: auto;
    position: relative;
}

/* Glass shine effect - top highlight */
.elemwowmap-choropleth-legend::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    border-radius: 16px 16px 0 0;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.05) 50%,
        transparent 100%
    );
    pointer-events: none;
    z-index: 1;
}

.elemwowmap-choropleth-legend.theme-dark {
    background: linear-gradient(
        135deg,
        rgba(17, 24, 39, 0.85) 0%,
        rgba(17, 24, 39, 0.75) 100%
    );
    border: 1px solid rgba(75, 85, 99, 0.4);
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    color: rgb(226, 232, 240);
}

.elemwowmap-choropleth-legend.theme-light {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0.75) 100%
    );
    border: 1px solid rgba(229, 231, 235, 0.6);
    border-top: 1px solid rgba(255, 255, 255, 0.8);
    color: rgb(51, 65, 85);
}

.elemwowmap-choropleth-legend.theme-blue {
    background: linear-gradient(
        135deg,
        rgba(30, 58, 138, 0.82) 0%,
        rgba(31, 63, 150, 0.815) 10%,
        rgba(32, 68, 162, 0.81) 20%,
        rgba(33, 73, 174, 0.805) 30%,
        rgba(34, 78, 186, 0.8) 40%,
        rgba(34, 83, 198, 0.795) 50%,
        rgba(35, 88, 210, 0.79) 60%,
        rgba(35, 90, 216, 0.785) 70%,
        rgba(36, 93, 222, 0.78) 80%,
        rgba(36, 96, 228, 0.775) 90%,
        rgba(37, 99, 235, 0.77) 100%
    );
    border: 1px solid rgba(96, 165, 250, 0.5);
    border-top: 1px solid rgba(147, 197, 253, 0.6);
    color: rgb(255, 255, 255);
}

/* Glass shine effect for blue theme */
.elemwowmap-choropleth-legend.theme-blue::before {
    background: linear-gradient(
        135deg,
        rgba(147, 197, 253, 0.2) 0%,
        rgba(96, 165, 250, 0.1) 30%,
        rgba(59, 130, 246, 0.05) 60%,
        transparent 100%
    );
}

.elemwowmap-legend-header {
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 14px;
    position: relative;
    z-index: 2;
}

.elemwowmap-legend-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    position: relative;
    z-index: 2;
}

.elemwowmap-legend-items::-webkit-scrollbar {
    width: 6px;
}

.elemwowmap-legend-items::-webkit-scrollbar-track {
    background: transparent;
}

.elemwowmap-legend-items::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.3);
    border-radius: 3px;
}

.elemwowmap-legend-items::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 128, 128, 0.5);
}

.elemwowmap-legend-item {
    display: flex;
    align-items: center;
    font-size: 12px;
}

.elemwowmap-legend-color-box {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    margin-right: 8px;
    flex-shrink: 0;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.elemwowmap-choropleth-legend.theme-dark .elemwowmap-legend-color-box {
    border-color: rgba(75, 85, 99, 0.3);
}

.elemwowmap-choropleth-legend.theme-light .elemwowmap-legend-color-box {
    border-color: rgba(209, 213, 219, 0.5);
}

.elemwowmap-choropleth-legend.theme-blue .elemwowmap-legend-color-box {
    border-color: rgba(96, 165, 250, 0.4);
}

.elemwowmap-legend-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>

