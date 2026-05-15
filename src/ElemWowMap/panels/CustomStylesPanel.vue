<template>
    <w-panel>
        <ui-container>
            <!-- JSON Style Presets Section -->
            <ui-has-panel>
                <div 
                    class="form-label form-label-small"
                    :style="{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        padding: '8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }"
                >
                    <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                        :style="{ flexShrink: '0', opacity: '0.7' }"
                    >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <span>Пресеты стилей карты</span>
                </div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Пресеты стилей карты', slot: 'json-presets' }]">
                        <template #json-presets>
                            <ui-container>
                                <div :style="{ padding: '8px 0' }">
                                    <div class="form-label form-label-small" :style="{ marginBottom: '8px' }">
                                        Вставьте JSON массив с кастомными стилями:
                                    </div>
                                    <textarea
                                        v-model="jsonPresetInput"
                                        :style="{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '8px',
                                            fontFamily: 'monospace',
                                            fontSize: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            backgroundColor: '#f9fafb',
                                            resize: 'vertical'
                                        }"
                                        placeholder="Вставьте JSON..."
                                    />
                                    
                                    <div
                                        v-if="jsonError"
                                        :style="{ 
                                            marginTop: '8px', 
                                            padding: '8px', 
                                            backgroundColor: '#fef2f2', 
                                            border: '1px solid #fecaca',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            color: '#991b1b'
                                        }"
                                    >
                                        {{ jsonError }}
                                    </div>
                                    
                                    <div
                                        v-if="isJsonSuccess"
                                        :style="{ 
                                            marginTop: '8px', 
                                            padding: '8px', 
                                            backgroundColor: '#f0fdf4', 
                                            border: '1px solid #bbf7d0',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            color: '#166534'
                                        }"
                                    >
                                        ✓ Стили успешно применены!
                                    </div>
                                    
                                    <button
                                        @click="saveCustomPresets"
                                        :style="{
                                            marginTop: '8px',
                                            width: '100%',
                                            padding: '8px 16px',
                                            backgroundColor: '#2563eb',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }"
                                    >
                                        Сохранить кастомные стили
                                    </button>
                                    
                                    <details :style="{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }">
                                        <summary :style="{ cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }">
                                            Пример JSON
                                        </summary>
                                        <pre
                                            :style="{ 
                                                backgroundColor: '#f9fafb', 
                                                padding: '8px', 
                                                borderRadius: '4px',
                                                overflow: 'auto',
                                                fontSize: '11px',
                                                fontFamily: 'monospace'
                                            }"
                                        >{{ exampleJson }}</pre>
                                    </details>
                                </div>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            
            <!-- Choropleth Aggregation Method Setting -->
            <div 
                v-if="hasChoroplethCategory"
                :style="{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                }"
            >
                <div class="form-label form-label-small" :style="{ marginBottom: '8px' }">
                    Метод агрегации
                </div>
                <w-custom-select
                    :value="currentAggregationMethod"
                    :options="safeAggregationMethodOptions"
                    @input="handleAggregationMethodChange($event)"
                />
                <div
                    :style="{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: '1.5'
                    }"
                >
                    💡 Выберите способ расчета значений для элементов карты
                </div>
            </div>
            
            <!-- Category Groups -->
            <ui-has-panel v-for="category in categories" :key="category">
                <div 
                    class="form-label form-label-small"
                    :style="{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        padding: '8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }"
                >
                    <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                        :style="{ flexShrink: '0', opacity: '0.7' }"
                    >
                        <path :d="getCategoryIconPath(category)" />
                    </svg>
                    <span>{{ category }}</span>
                    <span 
                        class="text-xs opacity-60 font-normal"
                        :style="{ marginLeft: 'auto' }"
                    >({{ getElementsByCategory(category).length }})</span>
                </div>
                <template #panel>
                    <ui-panel :groups="[{ name: category, slot: getCategorySlotName(category) }]">
                        <template #[getCategorySlotName(category)]>
                            <ui-container>
                                <!-- Elements in this category -->
                                <ui-has-panel v-for="element in getElementsByCategory(category)" :key="element.key">
                                    <div class="form-label form-label-small">
                                        {{ element.label }}
                                        <span class="text-xs opacity-60 font-normal ml-2">{{ element.selector }}</span>
                                    </div>
                                    <template #panel>
                                        <ui-panel :groups="[{ name: element.label, slot: element.key }]">
                                            <template #[element.key]>
                                                <ui-container>
                                                    <!-- Default Styles Info -->
                                                    <div
                                                        :style="{
                                                            marginBottom: '10px',
                                                            padding: '8px',
                                                            backgroundColor: '#fef3c7',
                                                            borderRadius: '6px'
                                                        }"
                                                    >
                                                        <div
                                                            :style="{
                                                                fontSize: '11px',
                                                                fontWeight: '500',
                                                                marginBottom: '4px',
                                                                color: '#92400e'
                                                            }"
                                                        >
                                                            Текущие настройки:
                                                        </div>
                                                        <pre
                                                            :style="{
                                                                fontSize: '11px',
                                                                color: '#78350f',
                                                                fontFamily: 'monospace',
                                                                whiteSpace: 'pre-wrap',
                                                                lineHeight: '1.4',
                                                                margin: '0'
                                                            }"
                                                        >{{ getElementDefaultStyles(element.key) }}</pre>
                                                    </div>
                                                    
                                                    <!-- CSS Editor -->
                                                    <div class="form-label form-label-small mb-1 flex justify-between items-center">
                                                        <span>CSS свойства</span>
                                                        <button
                                                            @click="fillWithCurrentSettings(element.key)"
                                                            :style="{
                                                                fontSize: '11px',
                                                                padding: '4px 8px',
                                                                backgroundColor: '#3b82f6',
                                                                color: '#ffffff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }"
                                                            type="button"
                                                        >
                                                            ⌨️ Заполнить текущими
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        v-model="localStyles[element.key]"
                                                        @input="handleStyleChange(element.key)"
                                                        :style="{
                                                            width: '100%',
                                                            height: '160px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '13px',
                                                            padding: '10px',
                                                            backgroundColor: '#ffffff',
                                                            color: '#111827',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: '6px',
                                                            resize: 'vertical',
                                                            minHeight: '100px',
                                                            maxHeight: '400px'
                                                        }"
                                                        :placeholder="getElementPlaceholder(element.key)"
                                                        spellcheck="false"
                                                    />
                                                    
                                                    <!-- Help/Advice -->
                                                    <div
                                                        :style="{
                                                            marginTop: '10px',
                                                            padding: '10px',
                                                            backgroundColor: '#eff6ff',
                                                            border: '1px solid #bfdbfe',
                                                            borderRadius: '6px'
                                                        }"
                                                    >
                                                        <div
                                                            :style="{ display: 'flex', alignItems: 'flex-start', gap: '8px' }"
                                                        >
                                                            <svg 
                                                                :style="{ width: '16px', height: '16px', color: '#2563eb', marginTop: '2px', flexShrink: '0' }"
                                                                fill="currentColor" 
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                                            </svg>
                                                            <div
                                                                :style="{ fontSize: '12px', color: '#1e40af', lineHeight: '1.6', flex: '1' }"
                                                            >
                                                                <strong
                                                                    :style="{ fontWeight: '600' }"
                                                                >💡 Совет:</strong> Вводите только CSS свойства без селекторов. Например: 
                                                                <code
                                                                    :style="{ 
                                                                        padding: '2px 6px', 
                                                                        backgroundColor: '#dbeafe', 
                                                                        borderRadius: '4px', 
                                                                        fontFamily: 'monospace', 
                                                                        fontSize: '11px',
                                                                        whiteSpace: 'nowrap'
                                                                    }"
                                                                >background-color: rgba(0,0,0,0.8); border-radius: 12px;</code>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <ui-button 
                                                        type="ghost" 
                                                        @click="resetElement(element.key)"
                                                        class="mt-2"
                                                    >
                                                        Сбросить {{ element.label.toLowerCase() }}
                                                    </ui-button>
                                                </ui-container>
                                            </template>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            
            <!-- Global Actions -->
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                <ui-button type="danger" @click="resetAll">
                    Сбросить все стили
                </ui-button>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import CustomSelect from '../components/CustomSelect.vue';
// eslint-disable-next-line import/named
import { AGGREGATION_METHOD_OPTIONS } from '../utils/constants';

const JSON_INDENT_SPACES = 2;
const SUCCESS_MESSAGE_TIMEOUT_MS = 3000;

export default {
    extends: Panel,
    
    components: {
        'w-custom-select': CustomSelect
    },
    
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Я дизайнер', icon: 'palette' },
    
    data: () => ({
        debounceTimer: null,
        localStyles: {
            // Base Container
            mapContainer: '',
            mapRoot: '',
            
            // Controls Panel
            controlsPanel: '',
            controlsPanelContent: '',
            controlsPanelFront: '',
            controlsPanelBack: '',
            controlsHeader: '',
            filterTitleHeader: '',
            controlsLabel: '',
            controlsTitle: '',
            headerButtons: '',
            dateDisplay: '',
            dateLabel: '',
            dateValue: '',
            settingsBtn: '',
            
            // Filters in Controls
            controlsFilters: '',
            filterRow: '',
            filterRowLabel: '',
            filterSelectDropdown: '',
            
            // Animation Controls
            animationControlsCompact: '',
            controlButtonsRow: '',
            controlIconBtn: '',
            controlIconBtnActive: '',
            controlIconBtnWarn: '',
            speedControl: '',
            speedLabel: '',
            speedSlider: '',
            
            // Heatmap Controls
            heatmapControlsCompact: '',
            heatmapSliders: '',
            sliderControl: '',
            sliderLabel: '',
            sliderRow: '',
            heatmapSlider: '',
            sliderValue: '',
            heatmapLoadingIndicator: '',
            heatmapLoadingSpinner: '',
            
            // Dots Controls
            dotsControlsCompact: '',
            dotsSliders: '',
            dotsSlider: '',
            dotsLoadingIndicator: '',
            dotsLoadingSpinner: '',
            dotsLoadingText: '',
            
            // Options Panel (Settings Back Face)
            optionsList: '',
            optionGroup: '',
            optionLabel: '',
            optionCheckboxes: '',
            optionCheckboxItem: '',
            optionCheckboxLabel: '',
            optionCheckbox: '',
            optionHint: '',
            paletteSelector: '',
            palettePreview: '',
            
            // Legend Wrapper
            legendWrapper: '',
            
            // Legend Components
            legendColorBox: '',
            legendLabel: '',
            legendCount: '',
            choroplethLegend: '',
            heatmapLegend: '',
            heatmapGradientBar: '',
            heatmapLabels: '',
            heatmapLabelItem: '',
            heatmapLabelText: '',
            heatmapLabelDetail: '',
            heatmapTotalCount: '',
            heatmapCountRow: '',
            heatmapWarning: '',
            heatmapCountLabel: '',
            heatmapCountValue: '',
            
            // Custom Select Component
            customSelectWrapper: '',
            customSelectTrigger: '',
            triggerPlaceholder: '',
            triggerValue: '',
            dropdownArrow: '',
            arrowOpen: '',
            customSelectDropdown: '',
            customSelectOption: '',
            isSelected: '',
            isHighlighted: '',
            selectOptionLabel: '',
            checkIcon: '',
            
            // Leaflet Map Controls
            leafletZoomControl: '',
            leafletZoomButton: '',
            
            // Choropleth SVG
            choroplethContainer: '',
            choroplethSvgOverlay: '',
            choroplethPath: '',
            choroplethPathHover: '',
            
            // Dots Popup
            dotPopupContainer: '',
            dotPopupContent: '',
            dotPopupHeader: '',
            dotPopupDescription: '',
            dotPopupDate: '',
            
            // Loading & Error States
            loadingOverlay: '',
            loadingSpinner: '',
            errorContainer: '',
            errorTitle: '',
            errorMessage: ''
        },
        jsonPresetInput: '',
        jsonError: '',
        isJsonSuccess: false,
        
        // Style element definitions with categories
        styleElements: [
            // Base Container
            { key: 'mapContainer', label: 'Контейнер карты', selector: '.map-container', category: 'Основа' },
            { key: 'mapRoot', label: 'Корневой элемент', selector: '.elemwowmap-widget-root', category: 'Основа' },
            
            // Controls Panel
            { key: 'controlsPanel', label: 'Панель управления', selector: '.elemwowmap-controls-panel', category: 'Панель управления' },
            { key: 'controlsPanelContent', label: 'Контент панели', selector: '.elemwowmap-controls-content', category: 'Панель управления' },
            { key: 'controlsPanelFront', label: 'Передняя сторона панели', selector: '.elemwowmap-controls-front', category: 'Панель управления' },
            { key: 'controlsPanelBack', label: 'Задняя сторона панели', selector: '.elemwowmap-controls-back', category: 'Панель управления' },
            { key: 'controlsHeader', label: 'Заголовок панели', selector: '.controls-header', category: 'Панель управления' },
            { key: 'filterTitleHeader', label: 'Заголовок фильтра', selector: '.filter-title-header', category: 'Панель управления' },
            { key: 'controlsLabel', label: 'Метка настроек', selector: '.controls-label', category: 'Панель управления' },
            { key: 'controlsTitle', label: 'Заголовок настроек', selector: '.controls-title', category: 'Панель управления' },
            { key: 'headerButtons', label: 'Кнопки заголовка', selector: '.header-buttons', category: 'Панель управления' },
            { key: 'dateDisplay', label: 'Отображение даты', selector: '.date-display', category: 'Панель управления' },
            { key: 'dateLabel', label: 'Метка даты', selector: '.date-label', category: 'Панель управления' },
            { key: 'dateValue', label: 'Значение даты', selector: '.date-value', category: 'Панель управления' },
            { key: 'settingsBtn', label: 'Кнопка настроек', selector: '.settings-btn', category: 'Панель управления' },
            
            // Filters
            { key: 'controlsFilters', label: 'Секция фильтров', selector: '.controls-filters', category: 'Фильтры' },
            { key: 'filterRow', label: 'Строка фильтра', selector: '.filter-row', category: 'Фильтры' },
            { key: 'filterRowLabel', label: 'Метка фильтра', selector: '.filter-row-label', category: 'Фильтры' },
            { key: 'filterSelectDropdown', label: 'Выпадающий список фильтра', selector: '.filter-select-dropdown', category: 'Фильтры' },
            
            // Animation Controls
            { key: 'animationControlsCompact', label: 'Контейнер управления анимацией', selector: '.animation-controls-compact', category: 'Анимация' },
            { key: 'controlButtonsRow', label: 'Ряд кнопок управления', selector: '.control-buttons-row', category: 'Анимация' },
            { key: 'controlIconBtn', label: 'Кнопка управления', selector: '.control-icon-btn', category: 'Анимация' },
            { key: 'controlIconBtnActive', label: 'Активная кнопка управления', selector: '.control-icon-btn.active', category: 'Анимация' },
            { key: 'controlIconBtnWarn', label: 'Кнопка предупреждения', selector: '.control-icon-btn-warn', category: 'Анимация' },
            { key: 'speedControl', label: 'Контроль скорости', selector: '.speed-control', category: 'Анимация' },
            { key: 'speedLabel', label: 'Метка скорости', selector: '.speed-label', category: 'Анимация' },
            { key: 'speedSlider', label: 'Слайдер скорости', selector: '.speed-slider', category: 'Анимация' },
            
            // Heatmap Controls
            { key: 'heatmapControlsCompact', label: 'Контейнер управления теплокартой', selector: '.heatmap-controls-compact', category: 'Теплокарта' },
            { key: 'heatmapSliders', label: 'Контейнер слайдеров', selector: '.heatmap-sliders', category: 'Теплокарта' },
            { key: 'sliderControl', label: 'Контроль слайдера', selector: '.slider-control', category: 'Теплокарта' },
            { key: 'sliderLabel', label: 'Метка слайдера', selector: '.slider-label', category: 'Теплокарта' },
            { key: 'sliderRow', label: 'Строка слайдера', selector: '.slider-row', category: 'Теплокарта' },
            { key: 'heatmapSlider', label: 'Слайдер теплокарты', selector: '.heatmap-slider', category: 'Теплокарта' },
            { key: 'sliderValue', label: 'Значение слайдера', selector: '.slider-value', category: 'Теплокарта' },
            { key: 'heatmapLoadingIndicator', label: 'Индикатор загрузки', selector: '.heatmap-loading-indicator', category: 'Теплокарта' },
            { key: 'heatmapLoadingSpinner', label: 'Спиннер загрузки', selector: '.heatmap-loading-spinner', category: 'Теплокарта' },
            
            // Dots Controls
            { key: 'dotsControlsCompact', label: 'Контейнер управления точками', selector: '.dots-controls-compact', category: 'Точки' },
            { key: 'dotsSliders', label: 'Слайдеры точек', selector: '.dots-sliders', category: 'Точки' },
            { key: 'dotsSlider', label: 'Слайдер точек', selector: '.dots-slider', category: 'Точки' },
            { key: 'dotsLoadingIndicator', label: 'Индикатор загрузки точек', selector: '.dots-loading-indicator', category: 'Точки' },
            { key: 'dotsLoadingSpinner', label: 'Спиннер загрузки точек', selector: '.dots-loading-spinner', category: 'Точки' },
            { key: 'dotsLoadingText', label: 'Текст загрузки точек', selector: '.dots-loading-text', category: 'Точки' },
            
            // Options Panel
            { key: 'optionsList', label: 'Список опций', selector: '.options-list', category: 'Настройки' },
            { key: 'optionGroup', label: 'Группа опций', selector: '.option-group', category: 'Настройки' },
            { key: 'optionLabel', label: 'Метка опции', selector: '.option-label', category: 'Настройки' },
            { key: 'optionCheckboxes', label: 'Контейнер чекбоксов', selector: '.option-checkboxes', category: 'Настройки' },
            { key: 'optionCheckboxItem', label: 'Элемент чекбокса', selector: '.option-checkbox-item', category: 'Настройки' },
            { key: 'optionCheckboxLabel', label: 'Метка чекбокса', selector: '.option-checkbox-label', category: 'Настройки' },
            { key: 'optionCheckbox', label: 'Чекбокс', selector: '.option-checkbox', category: 'Настройки' },
            { key: 'optionHint', label: 'Подсказка опции', selector: '.option-hint', category: 'Настройки' },
            { key: 'paletteSelector', label: 'Селектор палитры', selector: '.palette-selector', category: 'Настройки' },
            { key: 'palettePreview', label: 'Превью палитры', selector: '.palette-preview', category: 'Настройки' },
            
            // Legend
            { key: 'legendWrapper', label: 'Обёртка легенды', selector: '.elemwowmap-legend-wrapper', category: 'Легенда' },
            { key: 'legendColorBox', label: 'Цветной блок легенды', selector: '.elemwowmap-legend-color-box', category: 'Легенда' },
            { key: 'legendLabel', label: 'Метка легенды', selector: '.elemwowmap-legend-label', category: 'Легенда' },
            { key: 'legendCount', label: 'Счётчик легенды', selector: '.elemwowmap-legend-count', category: 'Легенда' },
            { key: 'choroplethLegend', label: 'Легенда хороплета', selector: '.elemwowmap-choropleth-legend', category: 'Легенда' },
            { key: 'heatmapLegend', label: 'Легенда теплокарты', selector: '.elemwowmap-heatmap-legend', category: 'Легенда' },
            { key: 'heatmapGradientBar', label: 'Градиентная полоса', selector: '.elemwowmap-heatmap-gradient-bar', category: 'Легенда' },
            { key: 'heatmapLabels', label: 'Метки теплокарты', selector: '.elemwowmap-heatmap-labels', category: 'Легенда' },
            { key: 'heatmapLabelItem', label: 'Элемент метки', selector: '.elemwowmap-heatmap-label-item', category: 'Легенда' },
            { key: 'heatmapLabelText', label: 'Текст метки', selector: '.elemwowmap-heatmap-label-text', category: 'Легенда' },
            { key: 'heatmapLabelDetail', label: 'Детали метки', selector: '.elemwowmap-heatmap-label-detail', category: 'Легенда' },
            { key: 'heatmapTotalCount', label: 'Общий счётчик', selector: '.elemwowmap-heatmap-total-count', category: 'Легенда' },
            { key: 'heatmapCountRow', label: 'Строка счётчика', selector: '.elemwowmap-heatmap-count-row', category: 'Легенда' },
            { key: 'heatmapWarning', label: 'Предупреждение', selector: '.elemwowmap-heatmap-warning', category: 'Легенда' },
            { key: 'heatmapCountLabel', label: 'Метка счётчика', selector: '.elemwowmap-heatmap-count-label', category: 'Легенда' },
            { key: 'heatmapCountValue', label: 'Значение счётчика', selector: '.elemwowmap-heatmap-count-value', category: 'Легенда' },
            
            // Custom Select Component
            { key: 'customSelectWrapper', label: 'Обёртка селекта', selector: '.custom-select-wrapper', category: 'Компоненты' },
            { key: 'customSelectTrigger', label: 'Триггер селекта', selector: '.custom-select-trigger', category: 'Компоненты' },
            { key: 'triggerPlaceholder', label: 'Плейсхолдер', selector: '.trigger-placeholder', category: 'Компоненты' },
            { key: 'triggerValue', label: 'Значение триггера', selector: '.trigger-value', category: 'Компоненты' },
            { key: 'dropdownArrow', label: 'Стрелка выпадающего списка', selector: '.dropdown-arrow', category: 'Компоненты' },
            { key: 'arrowOpen', label: 'Открытая стрелка', selector: '.arrow-open', category: 'Компоненты' },
            { key: 'customSelectDropdown', label: 'Выпадающий список', selector: '.custom-select-dropdown', category: 'Компоненты' },
            { key: 'customSelectOption', label: 'Опция селекта', selector: '.custom-select-option', category: 'Компоненты' },
            { key: 'isSelected', label: 'Выбранная опция', selector: '.is-selected', category: 'Компоненты' },
            { key: 'isHighlighted', label: 'Выделенная опция', selector: '.is-highlighted', category: 'Компоненты' },
            { key: 'selectOptionLabel', label: 'Метка опции селекта', selector: '.custom-select-option .option-label', category: 'Компоненты' },
            { key: 'checkIcon', label: 'Иконка галочки', selector: '.check-icon', category: 'Компоненты' },
            
            // Leaflet Controls
            { key: 'leafletZoomControl', label: 'Контрол масштабирования', selector: '.leaflet-control-zoom', category: 'Управление картой' },
            { key: 'leafletZoomButton', label: 'Кнопка масштабирования', selector: '.leaflet-control-zoom a', category: 'Управление картой' },
            
            // Choropleth
            { key: 'choroplethContainer', label: 'Контейнер хороплета', selector: '.choropleth-container', category: 'Хороплет' },
            { key: 'choroplethSvgOverlay', label: 'SVG оверлей хороплета', selector: '.choropleth-svg-overlay', category: 'Хороплет' },
            { key: 'choroplethPath', label: 'Путь хороплета', selector: '.choropleth-svg-overlay path', category: 'Хороплет' },
            { key: 'choroplethPathHover', label: 'Путь хороплета при наведении', selector: '.choropleth-svg-overlay path:hover', category: 'Хороплет' },
            
            // Dots Popup
            { key: 'dotPopupContainer', label: 'Контейнер попапа точки', selector: '.dot-popup-container', category: 'Попап точек' },
            { key: 'dotPopupContent', label: 'Контент попапа', selector: '.dot-popup', category: 'Попап точек' },
            { key: 'dotPopupHeader', label: 'Заголовок попапа', selector: '.dot-popup-header', category: 'Попап точек' },
            { key: 'dotPopupDescription', label: 'Описание попапа', selector: '.dot-popup-description', category: 'Попап точек' },
            { key: 'dotPopupDate', label: 'Дата попапа', selector: '.dot-popup-date', category: 'Попап точек' },
            
            // Loading & Error
            { key: 'loadingOverlay', label: 'Оверлей загрузки', selector: '.loading-overlay', category: 'Состояния' },
            { key: 'loadingSpinner', label: 'Спиннер загрузки', selector: '.loading-spinner', category: 'Состояния' },
            { key: 'errorContainer', label: 'Контейнер ошибки', selector: '.error-container', category: 'Состояния' },
            { key: 'errorTitle', label: 'Заголовок ошибки', selector: '.error-title', category: 'Состояния' },
            { key: 'errorMessage', label: 'Сообщение об ошибке', selector: '.error-message', category: 'Состояния' }
        ],
        
        // Aggregation method options for choropleth
        aggregationMethodOptions: AGGREGATION_METHOD_OPTIONS || []
    }),
    
    computed: {
        categories() {
            if (this.styleElements == null || !Array.isArray(this.styleElements)) {
                return [];
            }
            const uniqueCategories = [...new Set(this.styleElements.map(el => el.category))];
            return uniqueCategories;
        },
        
        hasChoroplethCategory() {
            if (this.categories == null || !Array.isArray(this.categories)) {
                return false;
            }
            return this.categories.includes('Хороплет');
        },
        
        currentAggregationMethod() {
            if (this.props == null) {
                return 'count';
            }
            return this.props.choroplethAggregationMethod || 'count';
        },
        
        safeAggregationMethodOptions() {
            if (this.aggregationMethodOptions == null || !Array.isArray(this.aggregationMethodOptions)) {
                return [
                    { value: 'count', label: 'Количество' },
                    { value: 'sum', label: 'Сумма' },
                    { value: 'average', label: 'Среднее' },
                    { value: 'min', label: 'Минимум' },
                    { value: 'max', label: 'Максимум' }
                ];
            }
            return this.aggregationMethodOptions;
        },
        
        exampleJson() {
            return JSON.stringify([
                {
                    name: 'Тёмная тема панели управления',
                    description: 'Стиль для тёмной темы',
                    styles: {
                        controlsPanelContent: 'background: rgba(17, 24, 39, 0.95); border: 1px solid rgba(75, 85, 99, 0.6);',
                        dateLabel: 'color: rgb(148, 163, 184);',
                        dateValue: 'color: rgb(241, 245, 249); font-weight: 700;'
                    }
                },
                {
                    name: 'Яркие кнопки',
                    description: 'Увеличенные яркие кнопки управления',
                    styles: {
                        controlIconBtn: 'width: 36px; height: 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
                        controlIconBtnActive: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); transform: scale(1.1);'
                    }
                }
            ], null, JSON_INDENT_SPACES);
        }
    },
    
    watch: {
        'props.customStyles': {
            handler(newVal) {
                if (newVal != null) {
                    this.localStyles = { ...this.localStyles, ...newVal };
                }
            },
            deep: true,
            immediate: true
        }
    },
    
    methods: {
        getCategoryIconPath(category) {
            const icons = {
                'Основа': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
                'Панель управления': 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
                'Фильтры': 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
                'Анимация': 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                'Теплокарта': 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z',
                'Точки': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
                'Настройки': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                'Легенда': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                'Компоненты': 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z',
                'Управление картой': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7',
                'Хороплет': 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
                'Попап точек': 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
                'Состояния': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            };
            return icons[category] || 'M12 6v6m0 0v6m0-6h6m-6 0H6';
        },
        
        getCategorySlotName(category) {
            return category.toLowerCase().replace(/\s+/g, '-');
        },
        
        getElementsByCategory(category) {
            return this.styleElements.filter(el => el.category === category);
        },
        
        getElementPlaceholder(key) {
            const placeholders = {
                controlsPanelContent: 'background: rgba(17, 24, 39, 0.85);\nborder: 1px solid rgba(75, 85, 99, 0.4);\npadding: 14px;\nborder-radius: 16px;',
                controlIconBtn: 'width: 28px;\nheight: 28px;\nbackground: rgba(55, 65, 81, 0.6);\nborder-radius: 6px;',
                filterSelectDropdown: 'background: transparent;\nborder: 1px solid rgb(75, 85, 99);\ncolor: rgb(226, 232, 240);\nborder-radius: 6px;',
                leafletZoomButton: 'width: 32px;\nheight: 32px;\nbackground: linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.75) 100%);\nborder-radius: 10px;'
            };
            return placeholders[key] || 'color: #000000;\nbackground-color: #ffffff;\npadding: 8px;\nborder-radius: 4px;';
        },
        
        handleStyleChange(key) {
            // Debounce to avoid clearing field while typing
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            
            this.debounceTimer = setTimeout(() => {
                this.$emit('update:prop', 'customStyles', { ...this.localStyles });
            }, 300); // eslint-disable-line no-magic-numbers
        },
        
        fillWithCurrentSettings(key) {
            const currentStyles = this.getElementDefaultStyles(key);
            this.localStyles[key] = currentStyles;
            this.$emit('update:prop', 'customStyles', { ...this.localStyles });
        },
        
        resetElement(key) {
            this.localStyles[key] = '';
            this.$emit('update:prop', 'customStyles', { ...this.localStyles });
        },
        
        resetAll() {
            Object.keys(this.localStyles).forEach(key => {
                this.localStyles[key] = '';
            });
            this.$emit('update:prop', 'customStyles', { ...this.localStyles });
            this.$emit('update:prop', 'customStylePresets', []);
        },
        
        handleAggregationMethodChange(value) {
            this.$emit('update:prop', 'choroplethAggregationMethod', value);
        },
        
        saveCustomPresets() {
            this.jsonError = '';
            this.isJsonSuccess = false;
            
            try {
                const parsed = JSON.parse(this.jsonPresetInput);
                
                if (!Array.isArray(parsed)) {
                    throw new Error('JSON должен быть массивом пресетов');
                }
                
                // Validate structure
                parsed.forEach((preset, index) => {
                    if (preset.name == null) {
                        throw new Error(`Пресет #${index + 1} должен иметь поле "name"`);
                    }
                    if (preset.styles == null || typeof preset.styles !== 'object') {
                        throw new Error(`Пресет #${index + 1} должен иметь поле "styles" в виде объекта`);
                    }
                });
                
                // Apply the first preset's styles
                if (parsed.length > 0 && parsed[0].styles) {
                    Object.keys(parsed[0].styles).forEach(key => {
                        if (Object.prototype.hasOwnProperty.call(this.localStyles, key)) {
                            this.localStyles[key] = parsed[0].styles[key];
                        }
                    });
                }
                
                this.$emit('update:prop', 'customStylePresets', parsed);
                this.$emit('update:prop', 'customStyles', { ...this.localStyles });
                
                this.isJsonSuccess = true;
                setTimeout(() => {
                    this.isJsonSuccess = false;
                }, SUCCESS_MESSAGE_TIMEOUT_MS);
            } catch (error) {
                this.jsonError = error.message;
            }
        },
        
        getElementDefaultStyles(key) {
            const { props } = this;
            let mapRootBackgroundColor = '#f5f5f5';
            if (props.theme === 'dark') {
                mapRootBackgroundColor = '#1a1a1a';
            } else if (props.theme === 'blue') {
                mapRootBackgroundColor = '#0f172a';
            }
            const styleMap = {
                // Base Container
                mapContainer: `position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
z-index: 0;`,
                
                mapRoot: `position: relative;
width: 100%;
height: 100%;
overflow: hidden;
background-color: ${mapRootBackgroundColor};`,
                
                // Controls Panel
                controlsPanel: `position: fixed;
top: 20px;
left: 20px;
z-index: 10000;
width: 280px;
min-height: 160px;
perspective: 1000px;`,
                
                controlsPanelContent: `padding: 12px 14px;
border-radius: 16px;
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
background: ${props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.75) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)'};
border: 1px solid ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'};`,
                
                filterTitleHeader: `flex: 1;`,
                
                controlsLabel: `font-size: 9px;
margin-bottom: 2px;
text-transform: uppercase;
letter-spacing: 0.12em;
opacity: 0.5;
font-weight: 600;
color: ${props.theme === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(71, 85, 105)'};`,
                
                controlsTitle: `font-weight: 600;
font-size: 18px;
line-height: 1.1;
color: ${props.theme === 'dark' ? 'rgb(241, 245, 249)' : 'rgb(30, 41, 59)'};`,
                
                headerButtons: `display: flex;
gap: 4px;
align-items: center;`,
                
                dateLabel: `font-size: 9px;
text-transform: uppercase;
letter-spacing: 0.12em;
opacity: 0.5;
font-weight: 600;
color: ${props.theme === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(71, 85, 105)'};`,
                
                dateValue: `font-weight: 600;
font-size: 18px;
line-height: 1.1;
color: ${props.theme === 'dark' ? 'rgb(241, 245, 249)' : 'rgb(30, 41, 59)'};`,
                
                settingsBtn: `background: transparent;
border: none;
cursor: pointer;
width: 28px;
height: 28px;
padding: 5px;
border-radius: 6px;
opacity: 0.6;
transition: all 0.2s ease;`,
                
                filterSelectDropdown: `background: transparent;
font-size: 12px;
font-weight: 500;
padding: 6px 10px;
border-radius: 6px;
border: 1px solid ${props.theme === 'dark' ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)'};
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};
cursor: pointer;`,
                
                // Animation Controls
                controlIconBtn: `width: 28px;
height: 28px;
padding: 5px;
border: none;
border-radius: 6px;
cursor: pointer;
transition: all 0.2s ease;
background: ${props.theme === 'dark' ? 'rgba(55, 65, 81, 0.6)' : 'rgba(229, 231, 235, 0.9)'};
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};`,
                
                controlIconBtnActive: `background: rgba(59, 130, 246, ${props.theme === 'dark' ? '0.7' : '0.9'}) !important;
color: rgb(255, 255, 255) !important;`,
                
                speedSlider: `flex: 1;
height: 3px;
border-radius: 2px;
appearance: none;
cursor: pointer;
background: ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'};`,
                
                // Heatmap Controls
                heatmapSlider: `flex: 1;
height: 3px;
border-radius: 2px;
appearance: none;
cursor: pointer;
background: ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'};`,
                
                sliderValue: `font-size: 11px;
font-weight: 600;
min-width: 28px;
text-align: right;
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};`,
                
                heatmapLoadingIndicator: `display: flex;
align-items: center;
gap: 8px;
padding: 8px;
border-radius: 4px;
font-size: 11px;
font-weight: 500;
background: ${props.theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'};
color: ${props.theme === 'dark' ? 'rgb(252, 165, 165)' : 'rgb(220, 38, 38)'};`,
                
                // Dots Controls
                dotsSlider: `flex: 1;
height: 3px;
border-radius: 2px;
appearance: none;
cursor: pointer;
background: ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'};`,
                
                dotsLoadingIndicator: `display: flex;
align-items: center;
gap: 8px;
padding: 8px;
border-radius: 4px;
font-size: 11px;
font-weight: 500;
background: ${props.theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)'};
color: ${props.theme === 'dark' ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)'};`,
                
                dotsLoadingText: `opacity: 0.9;`,
                
                // Options Panel
                paletteSelector: `display: flex;
align-items: center;
gap: 8px;`,
                
                palettePreview: `flex: 1;
height: 32px;
border-radius: 6px;
border: 1px solid ${props.theme === 'dark' ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)'};
min-width: 80px;`,
                
                optionCheckbox: `width: 40px;
height: 20px;
appearance: none;
background: rgba(128, 128, 128, 0.3);
border-radius: 10px;
cursor: pointer;
position: relative;
transition: all 0.3s ease;`,
                
                // Legend Components
                legendColorBox: `width: 12px;
height: 12px;
border-radius: 2px;
margin-right: 8px;
flex-shrink: 0;
border: 1px solid ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)'};`,
                
                legendLabel: `flex: 1;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;`,
                
                legendCount: `margin-left: 8px;
font-weight: 600;
font-size: 11px;
color: ${props.theme === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)'};`,
                
                choroplethLegend: `max-width: 220px;
min-width: 180px;
padding: 12px;
border-radius: 16px;
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
background: ${props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.75) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)'};
border: 1px solid ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'};
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};`,
                
                heatmapLegend: `max-width: 220px;
min-width: 180px;
padding: 12px;
border-radius: 16px;
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
background: ${props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.75) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)'};
border: 1px solid ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'};
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};`,
                
                heatmapGradientBar: `height: 8px;
width: 100%;
border-radius: 4px;
background: linear-gradient(to right, rgb(74, 222, 128), rgb(250, 204, 21), rgb(239, 68, 68));
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);`,
                
                heatmapLabels: `display: flex;
justify-content: space-between;
font-size: 12px;
margin-top: 6px;
color: ${props.theme === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)'};`,
                
                heatmapLabelItem: `display: flex;
flex-direction: column;
align-items: center;
gap: 2px;`,
                
                heatmapLabelText: `font-size: 11px;
opacity: 0.8;
font-weight: 500;`,
                
                heatmapLabelDetail: `font-size: 10px;
opacity: 0.7;
font-weight: 400;`,
                
                heatmapTotalCount: `margin-top: 10px;
padding-top: 8px;
border-top: 1px solid ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'};
display: flex;
flex-direction: column;
gap: 4px;`,
                
                heatmapCountRow: `display: flex;
justify-content: space-between;
align-items: center;`,
                
                heatmapWarning: `padding: 4px 6px;
border-radius: 6px;
margin-top: 2px;
background: ${props.theme === 'dark' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.1)'};`,
                
                heatmapCountLabel: `font-size: 11px;
font-weight: 500;
opacity: 0.8;`,
                
                heatmapCountValue: `font-size: 14px;
font-weight: 700;
color: ${props.theme === 'dark' ? 'rgb(96, 165, 250)' : 'rgb(37, 99, 235)'};`,
                
                // Custom Select Component
                customSelectWrapper: `position: relative;`,
                
                customSelectTrigger: `display: flex;
align-items: center;
justify-content: space-between;
padding: 6px 10px;
border-radius: 6px;
border: 1px solid ${props.theme === 'dark' ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)'};
background: transparent;
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};
cursor: pointer;
font-size: 12px;
font-weight: 500;
transition: all 0.2s ease;`,
                
                triggerPlaceholder: `opacity: 0.7;
color: ${props.theme === 'dark' ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)'};`,
                
                triggerValue: `flex: 1;
text-align: left;`,
                
                dropdownArrow: `width: 12px;
height: 8px;
transition: transform 0.2s ease;
opacity: 0.7;`,
                
                arrowOpen: `transform: rotate(180deg);`,
                
                customSelectDropdown: `position: absolute;
top: 100%;
left: 0;
right: 0;
margin-top: 4px;
background: ${props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.9) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)'};
border: 1px solid ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.7)'};
border-radius: 6px;
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
max-height: 200px;
overflow-y: auto;
z-index: 1000;`,
                
                customSelectOption: `display: flex;
align-items: center;
justify-content: space-between;
padding: 8px 12px;
cursor: pointer;
transition: background-color 0.2s ease;
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};`,
                
                isSelected: `background-color: ${props.theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)'};
color: ${props.theme === 'dark' ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)'};`,
                
                isHighlighted: `background-color: ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)'};`,
                
                selectOptionLabel: `flex: 1;
text-align: left;`,
                
                checkIcon: `width: 16px;
height: 16px;
color: ${props.theme === 'dark' ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)'};`,
                
                // Leaflet Zoom Controls
                leafletZoomButton: `width: 32px !important;
height: 32px !important;
line-height: 32px !important;
font-size: 18px !important;
font-weight: 600 !important;
border-radius: 10px !important;
backdrop-filter: blur(20px) saturate(180%) !important;
background: ${props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.75) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)'} !important;
border: 1px solid ${props.theme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.6)'} !important;`,
                
                // Choropleth
                choroplethContainer: `margin: 16px;`,
                
                choroplethPath: `fill: #3b82f6 !important;
fill-opacity: 0.3 !important;
stroke: #2563eb !important;
stroke-width: 1px !important;
stroke-opacity: 0.8 !important;
transition: fill-opacity 0.2s ease, stroke-opacity 0.2s ease;`,
                
                choroplethPathHover: `fill-opacity: 0.5 !important;
stroke-opacity: 1.0 !important;
stroke-width: 2px !important;`,
                
                // Dots Popup
                dotPopupContent: `padding: 12px 14px;
font-family: system-ui, -apple-system, sans-serif;
font-size: 13px;
line-height: 1.5;
min-width: 150px;
color: ${props.theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)'};`,
                
                // Loading & Error States
                loadingOverlay: `position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: ${props.theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
display: flex;
align-items: center;
justify-content: center;
z-index: 2000;`,
                
                loadingSpinner: `width: 50px;
height: 50px;
border: 4px solid rgba(0, 0, 0, 0.1);
border-top-color: #3498db;
border-radius: 50%;
animation: elemwowmap-spin 1s linear infinite;`,
                
                errorContainer: `background: ${props.theme === 'dark' ? '#2d2d2d' : '#ffffff'};
border: 1px solid #e74c3c;
border-radius: 8px;
padding: 20px;
max-width: 400px;
text-align: center;
color: ${props.theme === 'dark' ? '#e0e0e0' : '#666666'};`
            };
            
            return styleMap[key] || '/* Нет стилей по умолчанию */';
        }
    }
};
</script>

<style scoped>
.mb-1 {
    margin-bottom: 0.25rem;
}

.mb-2 {
    margin-bottom: 0.5rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.mt-3 {
    margin-top: 0.75rem;
}

.pt-3 {
    padding-top: 0.75rem;
}

.ml-2 {
    margin-left: 0.5rem;
}

.text-xs {
    font-size: 0.75rem;
}

.opacity-60 {
    opacity: 0.6;
}

.font-normal {
    font-weight: 400;
}

.border-t {
    border-top-width: 1px;
}

.border-gray-200 {
    border-color: #e5e7eb;
}

.dark .border-zinc-700 {
    border-color: #3f3f46;
}

.flex {
    display: flex;
}

.justify-between {
    justify-content: space-between;
}

.items-center {
    align-items: center;
}
</style>

