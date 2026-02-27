<template>
    <w-panel>
        <ui-container>
            <h3 class="text-lg font-semibold mb-4">Стилизация</h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Цветовая схема</label>
                    
                    <div class="space-y-2">
                        <ui-color-picker prop="primaryColor">
                            Основной цвет
                        </ui-color-picker>
                        
                        <ui-color-picker prop="successColor">
                            Цвет успеха
                        </ui-color-picker>
                        
                        <ui-color-picker prop="errorColor">
                            Цвет ошибки
                        </ui-color-picker>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Размеры и отступы</label>
                    
                    <ui-select 
                        prop="fontSize" 
                        :options="fontSizeOptions">
                        Размер шрифта
                    </ui-select>
                    
                    <ui-input 
                        prop="borderRadius" 
                        placeholder="8px">
                        Радиус границ
                    </ui-input>
                    
                    <ui-input 
                        prop="padding" 
                        placeholder="16px">
                        Внутренние отступы
                    </ui-input>
                </div>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { FONT_SIZE_OPTIONS } from '../config';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Стилизация', icon: 'palette' },

    data: () => ({
        fontSizeOptions: FONT_SIZE_OPTIONS
    }),
    
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }
};
</script>

