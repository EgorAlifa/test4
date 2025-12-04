<template>
    <div class="json-table-view" :style="cssVars">
        <div v-if="tableData.length === 0" class="empty-state">
            Нет данных для отображения
        </div>
        
        <div v-else class="table-container">
            <table class="json-table">
                <thead>
                    <tr>
                        <th v-for="column in columns" :key="column">
                            {{ column }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in tableData" :key="index">
                        <td v-for="column in columns" :key="column">
                            <span :class="`type-${getType(row[column])}`">
                                {{ formatValue(row[column]) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { getValueType, convertToTableData } from '../utils';

export default {
    name: 'JsonTableView',
    
    props: {
        data: {
            type: [Object, Array],
            required: true
        },
        colors: {
            type: Object,
            default: () => ({})
        }
    },
    
    computed: {
        tableData() {
            return convertToTableData(this.data);
        },
        
        columns() {
            if (this.tableData.length === 0) return [];
            
            const allKeys = new Set();
            this.tableData.forEach(row => {
                if (row && typeof row === 'object') {
                    Object.keys(row).forEach(key => allKeys.add(key));
                }
            });
            
            return Array.from(allKeys);
        },
        
        cssVars() {
            return {
                '--primary-color': this.colors.primary || '#3b82f6',
                '--border-color': this.colors.border || '#e5e7eb'
            };
        }
    },
    
    methods: {
        getType(value) {
            return getValueType(value);
        },
        
        formatValue(value) {
            if (value === null) return 'null';
            if (value === undefined) return '-';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'string') return value;
            return String(value);
        }
    }
};
</script>

<style scoped>
.json-table-view {
    width: 100%;
    overflow: auto;
}

.empty-state {
    padding: 40px;
    text-align: center;
    color: #6b7280;
    font-style: italic;
}

.table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
}

.json-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.json-table thead {
    background-color: #f9fafb;
}

.json-table th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: var(--primary-color, #3b82f6);
    border-bottom: 2px solid var(--border-color, #e5e7eb);
}

.json-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    color: #1f2937;
}

.json-table tbody tr:hover {
    background-color: #f9fafb;
}

.json-table tbody tr:last-child td {
    border-bottom: none;
}

.type-string {
    color: #10b981;
}

.type-number {
    color: #f59e0b;
}

.type-boolean {
    color: #8b5cf6;
}

.type-null,
.type-undefined {
    color: #6b7280;
    font-style: italic;
}
</style>

