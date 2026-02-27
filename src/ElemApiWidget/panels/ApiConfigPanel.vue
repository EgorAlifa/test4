<template>
    <w-panel>
        <ui-container>
            <h3 class="text-lg font-semibold mb-4">Конфигурация API</h3>
            
            <ui-input 
                prop="apiUrl" 
                placeholder="https://api.example.com/endpoint">
                URL адрес
            </ui-input>
            
            <ui-select 
                prop="httpMethod" 
                :options="httpMethodOptions">
                HTTP метод
            </ui-select>
            
            <ui-textarea 
                prop="headers" 
                :rows="4"
                placeholder="Content-Type: application/json&#10;Authorization: Bearer token">
                Заголовки (каждый на новой строке)
            </ui-textarea>
            
            <ui-select 
                prop="bodyFormat" 
                :options="bodyFormatOptions">
                Формат тела запроса
            </ui-select>
            
            <ui-textarea 
                v-if="props.bodyFormat !== 'none'"
                prop="bodyContent" 
                :rows="6"
                :placeholder="bodyPlaceholder">
                Тело запроса
            </ui-textarea>
            
            <ui-input 
                prop="responsePath" 
                placeholder="data.items">
                Путь к данным в ответе (через точку)
            </ui-input>
            
            <ui-checkbox prop="autoRequest">
                Автоматический запрос при загрузке
            </ui-checkbox>
            
            <ui-input 
                v-if="props.autoRequest"
                prop="requestInterval" 
                type="number"
                :min="0">
                Интервал автозапросов (сек, 0 = отключено)
            </ui-input>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { HTTP_METHOD_OPTIONS, BODY_FORMAT_OPTIONS } from '../config';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'API конфигурация', icon: 'settings' },

    data: () => ({
        httpMethodOptions: HTTP_METHOD_OPTIONS,
        bodyFormatOptions: BODY_FORMAT_OPTIONS
    }),
    
    computed: {
        bodyPlaceholder() {
            switch (this.props.bodyFormat) {
                case 'json':
                    return '{\n  "key": "value",\n  "name": "example"\n}';
                case 'formData':
                    return 'key1=value1\nkey2=value2';
                case 'raw':
                    return 'Plain text content';
                default:
                    return '';
            }
        }
    },
    
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }
};
</script>

