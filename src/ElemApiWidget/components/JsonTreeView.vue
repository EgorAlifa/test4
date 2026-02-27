<template>
    <div class="json-tree-view" :style="cssVars">
        <div 
            v-for="(item, key) in limitedData" 
            :key="key"
            class="json-tree-item"
            :class="`depth-${currentDepth}`">
            <div class="json-tree-key">
                <button
                    v-if="isExpandable(item)"
                    class="expand-btn"
                    @click="toggleExpand(key)"
                    :aria-label="expanded[key] ? 'Свернуть' : 'Развернуть'"
                    tabindex="0">
                    <span class="expand-icon">{{ expanded[key] ? '▼' : '▶' }}</span>
                </button>
                <span class="key-name">{{ key }}:</span>
                <span v-if="!isExpandable(item)" class="value" :class="`type-${getType(item)}`">
                    {{ formatValue(item) }}
                </span>
                <span v-else class="value-type">{{ getTypeLabel(item) }}</span>
            </div>
            
            <div 
                v-if="isExpandable(item) && expanded[key]" 
                class="json-tree-children">
                <JsonTreeView
                    :data="item"
                    :maxDepth="maxDepth"
                    :currentDepth="currentDepth + 1"
                    :colors="colors" />
            </div>
        </div>
    </div>
</template>

<script>
import { getValueType } from '../utils';

export default {
    name: 'JsonTreeView',
    
    props: {
        data: {
            type: [Object, Array],
            required: true
        },
        maxDepth: {
            type: Number,
            default: 3
        },
        currentDepth: {
            type: Number,
            default: 0
        },
        colors: {
            type: Object,
            default: () => ({})
        }
    },
    
    data: () => ({
        expanded: {}
    }),
    
    computed: {
        limitedData() {
            if (this.maxDepth !== -1 && this.currentDepth >= this.maxDepth) {
                return '[максимальная глубина достигнута]';
            }
            return this.data;
        },
        
        cssVars() {
            return {
                '--primary-color': this.colors.primary || '#3b82f6',
                '--success-color': this.colors.success || '#10b981',
                '--error-color': this.colors.error || '#ef4444'
            };
        }
    },
    
    methods: {
        isExpandable(value) {
            return value !== null && (typeof value === 'object' || Array.isArray(value));
        },
        
        getType(value) {
            return getValueType(value);
        },
        
        getTypeLabel(value) {
            if (Array.isArray(value)) {
                return `Array[${value.length}]`;
            }
            if (value && typeof value === 'object') {
                return `Object{${Object.keys(value).length}}`;
            }
            return '';
        },
        
        formatValue(value) {
            if (value === null) return 'null';
            if (value === undefined) return 'undefined';
            if (typeof value === 'string') return `"${value}"`;
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            return String(value);
        },
        
        toggleExpand(key) {
            this.$set(this.expanded, key, !this.expanded[key]);
        }
    },
    
    mounted() {
        // Авто-раскрытие первого уровня
        if (this.currentDepth === 0) {
            Object.keys(this.data).forEach(key => {
                this.$set(this.expanded, key, true);
            });
        }
    }
};
</script>

<style scoped>
.json-tree-view {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
}

.json-tree-item {
    margin-left: calc(var(--depth, 0) * 20px);
}

.json-tree-key {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
}

.expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.expand-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.expand-icon {
    font-size: 10px;
    color: #6b7280;
}

.key-name {
    font-weight: 600;
    color: var(--primary-color, #3b82f6);
}

.value {
    color: #1f2937;
}

.value.type-string {
    color: var(--success-color, #10b981);
}

.value.type-number {
    color: #f59e0b;
}

.value.type-boolean {
    color: #8b5cf6;
}

.value.type-null,
.value.type-undefined {
    color: #6b7280;
    font-style: italic;
}

.value-type {
    color: #6b7280;
    font-size: 12px;
}

.json-tree-children {
    margin-left: 20px;
    border-left: 1px solid #e5e7eb;
    padding-left: 8px;
}
</style>

