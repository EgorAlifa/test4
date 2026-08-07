<template>
    <w-panel>
        <ui-container>
            <!-- Element Style Editors -->
            <ui-has-panel v-for="element in elements" :key="element.key">
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
                                        Текущие настройки из панели:
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
                                        minHeight: '10px',
                                        maxHeight: '200px'
                                    }"
                                    :placeholder="getElementDefaultStyles(element.key)"
                                    spellcheck="false"
                                ></textarea>
                                
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
                                            >color: red; font-weight: bold;</code>
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
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Я дизайнер', icon: 'palette' },
    
    data: () => ({
        localStyles: {
            container: '',
            svg: '',
            segment: '',
            dot: '',
            arc: '',
            valueText: '',
            titleText: '',
            textContainer: '',
            loadingState: '',
            errorState: ''
        },
        debounceTimer: null
    }),

    computed: {
        elements() {
            return [
                {
                    key: 'container',
                    label: 'Основной контейнер',
                    selector: '.gauge-container'
                },
                {
                    key: 'svg',
                    label: 'SVG элемент',
                    selector: '.gauge-svg'
                },
                {
                    key: 'segment',
                    label: 'Сегменты (полукруг)',
                    selector: '.gauge-segment'
                },
                {
                    key: 'dot',
                    label: 'Точки (круг)',
                    selector: '.gauge-dot'
                },
                {
                    key: 'arc',
                    label: 'Дуга (круг)',
                    selector: '.gauge-arc'
                },
                {
                    key: 'textContainer',
                    label: 'Контейнер текста',
                    selector: '.gauge-text-container'
                },
                {
                    key: 'valueText',
                    label: 'Текст значения',
                    selector: '.gauge-value-text'
                },
                {
                    key: 'titleText',
                    label: 'Текст заголовка',
                    selector: '.gauge-title-text'
                },
                {
                    key: 'loadingState',
                    label: 'Состояние загрузки',
                    selector: '.gauge-loading'
                },
                {
                    key: 'errorState',
                    label: 'Состояние ошибки',
                    selector: '.gauge-error'
                }
            ];
        }
    },

    mounted() {
        // Initialize localStyles from props only once on mount
        if (this.props.customStyles != null && typeof this.props.customStyles === 'object') {
            Object.keys(this.localStyles).forEach(key => {
                if (this.props.customStyles[key] != null) {
                    this.localStyles[key] = this.props.customStyles[key];
                }
            });
        }
    },

    beforeUnmount() {
        // Clean up debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    },

    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes,

        getElementDefaultStyles(elementKey) {
            // Generate default styles based on current settings panel props
            const isDark = this.props.theme === 'dark';
            const defaultContainerPaddingSize = 16; // eslint-disable-line no-magic-numbers
            const defaultValueFontSize = 4; // eslint-disable-line no-magic-numbers
            const defaultTitleFontSize = 3; // eslint-disable-line no-magic-numbers
            
            switch (elementKey) {
                case 'container': {
                    const padding = this.props.containerPadding || { size: defaultContainerPaddingSize, unit: 'px' };
                    return `padding: ${padding.size}${padding.unit};
background-color: ${isDark ? '#3b4d61' : '#ffffff'};
border-radius: ${this.getRadiusValue()};
box-shadow: ${this.getElevationValue()}`;
                }
                case 'valueText': {
                    const fontSize = this.props.valueFontSize || { size: defaultValueFontSize, unit: 'rem' };
                    const color = this.props.valueFontColor || (isDark ? '#ffffff' : '#0a0a0a');
                    const fontFamily = this.props.valueFontFamily || 'Inter, system-ui, sans-serif';
                    return `color: ${color};
font-size: ${fontSize.size}${fontSize.unit};
font-weight: 700;
font-family: ${fontFamily};
line-height: 1`;
                }
                case 'titleText': {
                    const fontSize = this.props.titleFontSize || { size: defaultTitleFontSize, unit: 'rem' };
                    const color = this.props.titleFontColor || (isDark ? '#ffffff' : '#0a0a0a');
                    const fontFamily = this.props.titleFontFamily || 'Inter, system-ui, sans-serif';
                    return `color: ${color};
font-size: ${fontSize.size}${fontSize.unit};
font-weight: 400;
font-family: ${fontFamily}`;
                }
                case 'segment':
                    return `fill: ${this.props.activeColor || '#ef4444'};
transition: all 0.3s ease`;
                case 'arc':
                    return `stroke: ${this.props.activeColor || '#ef4444'};
stroke-linecap: round`;
                case 'dot': {
                    const dotColor = isDark ? '#e5e7eb' : '#6b7280';
                    return `fill: ${dotColor}`;
                }
                case 'svg':
                    return `width: 100%;
height: auto`;
                case 'textContainer':
                    return `display: flex;
flex-direction: column;
align-items: center;
gap: 0.25rem`;
                case 'loadingState':
                    return `background-color: ${isDark ? 'rgba(24, 24, 27, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
color: ${isDark ? '#a1a1aa' : '#71717a'}`;
                case 'errorState':
                    return `color: #dc2626;
font-size: 0.75rem;
text-align: center`;
                default:
                    return '/* Нет предустановленных стилей */';
            }
        },

        handleStyleChange(elementKey) {
            // Debounce to avoid too many updates while typing
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            
            this.debounceTimer = setTimeout(() => {
                this.props.customStyles = { ...this.localStyles };
                this.propChanged('customStyles');
            }, 300); // Wait 300ms after user stops typing
        },

        fillWithCurrentSettings(elementKey) {
            const currentStyles = this.getElementDefaultStyles(elementKey);
            this.localStyles[elementKey] = currentStyles;
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        resetElement(elementKey) {
            this.localStyles[elementKey] = '';
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        resetAll() {
            Object.keys(this.localStyles).forEach(key => {
                this.localStyles[key] = '';
            });
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        getRadiusValue() {
            const radiusMap = {
                none: '0',
                small: '0.375rem',
                medium: '0.75rem',
                large: '1rem'
            };
            return radiusMap[this.props.radius] || radiusMap.large;
        },

        getElevationValue() {
            const elevationMap = {
                0: 'none',
                1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                2: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // eslint-disable-line no-magic-numbers
                3: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' // eslint-disable-line no-magic-numbers
            };
            return elevationMap[this.props.elevation] || elevationMap[0];
        }
    }
};
</script>

