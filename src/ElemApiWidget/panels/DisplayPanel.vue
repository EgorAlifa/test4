<template>
    <w-panel>
        <ui-container>
            <h3 class="text-lg font-semibold mb-4">Настройки отображения</h3>
            
            <ui-select 
                prop="displayMode" 
                :options="displayModeOptions">
                Режим отображения
            </ui-select>
            
            <ui-select 
                prop="maxDepth" 
                :options="depthOptions">
                Глубина JSON
            </ui-select>
            
            <div class="space-y-2">
                <ui-checkbox prop="showHeaders">
                    Показывать заголовки ответа
                </ui-checkbox>
                
                <ui-checkbox prop="showStatusCode">
                    Показывать HTTP статус
                </ui-checkbox>
                
                <ui-checkbox prop="showResponseTime">
                    Показывать время ответа
                </ui-checkbox>
                
                <ui-checkbox prop="enableCopy">
                    Включить копирование
                </ui-checkbox>
                
                <ui-checkbox prop="enableDownload">
                    Включить скачивание JSON
                </ui-checkbox>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { JSON_DISPLAY_OPTIONS, DEPTH_OPTIONS } from '../config';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Отображение', icon: 'visibility' },

    data: () => ({
        displayModeOptions: JSON_DISPLAY_OPTIONS,
        depthOptions: DEPTH_OPTIONS
    }),
    
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }
};
</script>

