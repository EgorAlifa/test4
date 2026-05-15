<template>
    <div 
        v-if="showLegend"
        class="elemwowmap-heatmap-legend"
        :class="'theme-' + currentTheme"
        role="complementary"
        aria-label="Легенда интенсивности тепловой карты"
    >
        <div class="elemwowmap-heatmap-legend-header">
            Плотность
        </div>
        
        <div 
            class="elemwowmap-heatmap-gradient-bar"
            aria-hidden="true"
        ></div>
        
        <div class="elemwowmap-heatmap-labels">
            <span class="elemwowmap-heatmap-label-item">
                <span class="elemwowmap-heatmap-label-text">Низкая</span>
                <span class="elemwowmap-heatmap-label-detail">~1-10 точек</span>
            </span>
            <span class="elemwowmap-heatmap-label-item">
                <span class="elemwowmap-heatmap-label-text">Высокая</span>
                <span class="elemwowmap-heatmap-label-detail">{{ highDensityLabel }}</span>
            </span>
        </div>
        
        <div class="elemwowmap-heatmap-total-count">
            <div class="elemwowmap-heatmap-count-row">
                <span class="elemwowmap-heatmap-count-label">Отображено:</span>
                <span class="elemwowmap-heatmap-count-value">{{ formatNumber(dataPointCount) }}</span>
            </div>
            <div 
                v-if="totalRowCount != null && totalRowCount > dataPointCount"
                class="elemwowmap-heatmap-count-row elemwowmap-heatmap-warning"
            >
                <span class="elemwowmap-heatmap-count-label">Всего в базе:</span>
                <span class="elemwowmap-heatmap-count-value">{{ formatNumber(totalRowCount) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HeatmapLegend',

    props: {
        currentTheme: {
            type: String,
            default: 'dark'
        },
        showLegend: {
            type: Boolean,
            default: true
        },
        dataPointCount: {
            type: Number,
            default: 0
        },
        totalRowCount: {
            type: Number,
            default: null
        },
        radius: {
            type: Number,
            default: 25 // eslint-disable-line no-magic-numbers
        }
    },
    
    computed: {
        /**
         * Calculate high density label based on radius and data point count
         */
        highDensityLabel() {
            if (this.dataPointCount === 0) {
                return '~100+ точек';
            }
            
            // Estimate high density threshold based on data distribution
            // Larger radius = more points contribute to a single "hot spot"
            const defaultRadius = 25; // eslint-disable-line no-magic-numbers
            const radiusFactor = this.radius / defaultRadius; // Normalize to default radius
            const baseHighDensity = 100; // eslint-disable-line no-magic-numbers
            const estimatedHighDensity = Math.ceil(baseHighDensity * radiusFactor);
            
            // For very large datasets, scale up the threshold
            const millionThreshold = 1000000; // eslint-disable-line no-magic-numbers
            const hundredThousandThreshold = 100000; // eslint-disable-line no-magic-numbers
            const tenThousandThreshold = 10000; // eslint-disable-line no-magic-numbers
            if (this.dataPointCount >= millionThreshold) {
                return '~1000+ точек';
            }
            if (this.dataPointCount >= hundredThousandThreshold) {
                return '~500+ точек';
            }
            if (this.dataPointCount >= tenThousandThreshold) {
                return '~200+ точек';
            }
            
            return `~${estimatedHighDensity}+ точек`;
        }
    },
    
    methods: {
        /**
         * Format number for display with thousands separator
         */
        formatNumber(value) {
            if (value == null) {
                return '0';
            }
            
            const num = typeof value === 'number' ? value : parseFloat(value);
            
            if (Number.isNaN(num)) {
                return '0';
            }
            
            // For very large numbers, use compact notation
            const millionThreshold = 1000000; // eslint-disable-line no-magic-numbers
            const thousandThreshold = 1000; // eslint-disable-line no-magic-numbers
            const hundredThreshold = 100; // eslint-disable-line no-magic-numbers
            if (num >= millionThreshold) {
                return `${(num / millionThreshold).toFixed(1)}M`;
            }
            if (num >= thousandThreshold) {
                // Remove unnecessary decimals for cleaner display
                const thousands = num / thousandThreshold;
                if (thousands >= hundredThreshold) {
                    return `${Math.round(thousands)}K`; // 100K, 150K, etc.
                }
                return `${thousands.toFixed(1).replace('.0', '')}K`; // 10K, 15.5K, etc.
            }
            
            // For smaller numbers, use locale string with space separator
            return num.toLocaleString('ru-RU');
        }
    }
};
</script>

<style scoped>
.elemwowmap-heatmap-legend {
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
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

/* Glass shine effect - top highlight */
.elemwowmap-heatmap-legend::before {
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

.elemwowmap-heatmap-legend.theme-dark {
    background: linear-gradient(
        135deg,
        rgba(17, 24, 39, 0.85) 0%,
        rgba(17, 24, 39, 0.75) 100%
    );
    border: 1px solid rgba(75, 85, 99, 0.4);
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    color: rgb(226, 232, 240);
}

.elemwowmap-heatmap-legend.theme-light {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0.75) 100%
    );
    border: 1px solid rgba(229, 231, 235, 0.6);
    border-top: 1px solid rgba(255, 255, 255, 0.8);
    color: rgb(51, 65, 85);
}

.elemwowmap-heatmap-legend.theme-blue {
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
.elemwowmap-heatmap-legend.theme-blue::before {
    background: linear-gradient(
        135deg,
        rgba(147, 197, 253, 0.2) 0%,
        rgba(96, 165, 250, 0.1) 30%,
        rgba(59, 130, 246, 0.05) 60%,
        transparent 100%
    );
}

.elemwowmap-heatmap-legend-header {
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 14px;
    position: relative;
    z-index: 2;
    text-align: center;
}

.elemwowmap-heatmap-gradient-bar {
    height: 8px;
    width: 100%;
    border-radius: 4px;
    background: linear-gradient(to right, 
        rgb(74, 222, 128),    /* green-400 */
        rgb(250, 204, 21),    /* yellow-400 */
        rgb(239, 68, 68)      /* red-500 */
    );
    position: relative;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.elemwowmap-heatmap-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-top: 6px;
    position: relative;
    z-index: 2;
}

.elemwowmap-heatmap-label-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.elemwowmap-heatmap-label-text {
    font-size: 11px;
    opacity: 0.8;
    font-weight: 500;
}

.elemwowmap-heatmap-label-detail {
    font-size: 10px;
    opacity: 0.7;
    font-weight: 400;
}

.elemwowmap-heatmap-legend.theme-dark .elemwowmap-heatmap-labels {
    color: rgb(148, 163, 184);
}

.elemwowmap-heatmap-legend.theme-light .elemwowmap-heatmap-labels,
.elemwowmap-heatmap-legend.theme-blue .elemwowmap-heatmap-labels {
    color: rgb(100, 116, 139);
}

.elemwowmap-heatmap-total-count {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid;
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 2;
}

.elemwowmap-heatmap-count-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.elemwowmap-heatmap-warning {
    padding: 4px 6px;
    border-radius: 6px;
    margin-top: 2px;
}

.elemwowmap-heatmap-legend.theme-dark .elemwowmap-heatmap-warning {
    background: rgba(234, 179, 8, 0.15);
}

.elemwowmap-heatmap-legend.theme-light .elemwowmap-heatmap-warning,
.elemwowmap-heatmap-legend.theme-blue .elemwowmap-heatmap-warning {
    background: rgba(234, 179, 8, 0.1);
}

.elemwowmap-heatmap-warning .elemwowmap-heatmap-count-value {
    color: rgb(234, 179, 8);
    font-weight: 700;
}

.elemwowmap-heatmap-legend.theme-dark .elemwowmap-heatmap-total-count {
    border-top-color: rgba(75, 85, 99, 0.4);
}

.elemwowmap-heatmap-legend.theme-light .elemwowmap-heatmap-total-count,
.elemwowmap-heatmap-legend.theme-blue .elemwowmap-heatmap-total-count {
    border-top-color: rgba(229, 231, 235, 0.6);
}

.elemwowmap-heatmap-count-label {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.8;
}

.elemwowmap-heatmap-count-value {
    font-size: 14px;
    font-weight: 700;
}

.elemwowmap-heatmap-legend.theme-dark .elemwowmap-heatmap-count-value {
    color: rgb(96, 165, 250);
}

.elemwowmap-heatmap-legend.theme-light .elemwowmap-heatmap-count-value,
.elemwowmap-heatmap-legend.theme-blue .elemwowmap-heatmap-count-value {
    color: rgb(37, 99, 235);
}
</style>

