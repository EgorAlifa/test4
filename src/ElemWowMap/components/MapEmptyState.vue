<template>
    <div class="empty-state-container">
        <div class="empty-state-content">
            <svg
                class="empty-state-icon"
                width="240"
                height="240"
                viewBox="0 0 240 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <!-- Background Circle -->
                <circle
                    cx="120"
                    cy="120"
                    r="100"
                    fill="currentColor"
                    opacity="0.04"
                />
                
                <!-- Map Icon -->
                <!-- Map Base (folded map) -->
                <rect
                    x="50"
                    y="60"
                    width="140"
                    height="120"
                    rx="8"
                    stroke="currentColor"
                    stroke-width="3"
                    fill="none"
                    opacity="0.3"
                />
                
                <!-- Map Fold Lines -->
                <line
                    x1="97"
                    y1="60"
                    x2="97"
                    y2="180"
                    stroke="currentColor"
                    stroke-width="2.5"
                    opacity="0.2"
                />
                <line
                    x1="143"
                    y1="60"
                    x2="143"
                    y2="180"
                    stroke="currentColor"
                    stroke-width="2.5"
                    opacity="0.2"
                />
                
                <!-- Location Pin Icon -->
                <g opacity="0.4">
                    <!-- Pin Shape -->
                    <path
                        d="M120 90 C120 90, 110 90, 110 102 C110 110, 120 125, 120 125 C120 125, 130 110, 130 102 C130 90, 120 90, 120 90 Z"
                        fill="currentColor"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <!-- Pin Center Dot -->
                    <circle
                        cx="120"
                        cy="102"
                        r="3"
                        fill="white"
                    />
                </g>
                
                <!-- Decorative Map Lines (roads/paths) -->
                <g opacity="0.15">
                    <path
                        d="M 60 140 Q 80 135, 90 145"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                    />
                    <path
                        d="M 150 150 Q 165 145, 180 155"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                    />
                    <path
                        d="M 70 165 L 95 165"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                    />
                </g>
            </svg>
            
            <div class="empty-state-text-content">
                <h3 class="empty-state-title">
                    {{ title }}
                </h3>
                <p class="empty-state-description">
                    {{ description }}
                </p>
            </div>
            
            <button 
                v-if="hasDatasetConfigured === false"
                class="empty-state-button"
                @click="handleNavigateToSource"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 4v8M4 8h8"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
                Настроить источник данных
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MapEmptyState',
    
    props: {
        hasDatasetConfigured: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Нет данных для отображения'
        },
        description: {
            type: String,
            default: 'Настройте источник данных и укажите поля широты, долготы и даты для визуализации на карте'
        }
    },
    
    methods: {
        handleNavigateToSource() {
            this.$emit('navigateToSource');
        }
    }
};
</script>

<style scoped>
.empty-state-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 32px 16px;
    overflow: hidden;
}

.empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 480px;
    width: 100%;
    gap: clamp(6px, 1.5%, 10px);
}

.empty-state-icon {
    color: #94a3b8;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.03));
    width: clamp(100px, 20%, 160px);
    height: clamp(100px, 20%, 160px);
    flex-shrink: 0;
}

.empty-state-container:hover .empty-state-icon {
    transform: scale(1.03) translateY(-2px);
}

.empty-state-text-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
}

.empty-state-title {
    font-size: clamp(14px, 2%, 16px);
    font-weight: 600;
    color: #475569;
    letter-spacing: -0.02em;
    margin: 0;
}

.empty-state-description {
    font-size: clamp(12px, 1.8%, 13px);
    color: #64748b;
    line-height: 1.4;
    opacity: 0.85;
    max-width: 90%;
    margin: 0;
}

.empty-state-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    margin-top: 4px;
    font-size: clamp(12px, 1.8%, 13px);
    font-weight: 500;
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
    letter-spacing: -0.01em;
}

.empty-state-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
}

.empty-state-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

.empty-state-button svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}
</style>

