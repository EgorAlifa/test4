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

            <!-- Burger Menu Icons -->
            <ui-has-panel>
                <div class="form-label form-label-small">
                    Иконки бургер меню
                </div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Иконки бургер меню', slot: 'burgerIcons' }]">
                        <template #burgerIcons>
                            <ui-container>
                                <div
                                    :style="{
                                        marginBottom: '10px',
                                        padding: '8px',
                                        backgroundColor: '#eff6ff',
                                        border: '1px solid #bfdbfe',
                                        borderRadius: '6px'
                                    }"
                                >
                                    <div
                                        :style="{ fontSize: '12px', color: '#1e40af', lineHeight: '1.6' }"
                                    >
                                        <strong :style="{ fontWeight: '600' }">💡 Совет:</strong>
                                        Используйте названия MDI иконок из
                                        <a href="https://materialdesignicons.com/" target="_blank" style="color: #2563eb; text-decoration: underline;">
                                            materialdesignicons.com
                                        </a>
                                        <br>
                                        Например: <code :style="{
                                            padding: '2px 6px',
                                            backgroundColor: '#dbeafe',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px'
                                        }">mdi-menu</code>,
                                        <code :style="{
                                            padding: '2px 6px',
                                            backgroundColor: '#dbeafe',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px'
                                        }">mdi-close</code>
                                    </div>
                                </div>

                                <ui-input prop="burgerIconClosed" placeholder="mdi-menu">
                                    Иконка закрытого меню
                                </ui-input>

                                <ui-input prop="burgerIconOpen" placeholder="mdi-close">
                                    Иконка открытого меню
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Expand/Collapse Icons -->
            <ui-has-panel>
                <div class="form-label form-label-small">
                    Иконки развернуть/свернуть (иерархия)
                </div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Иконки иерархии', slot: 'expandIcons' }]">
                        <template #expandIcons>
                            <ui-container>
                                <div
                                    :style="{
                                        marginBottom: '10px',
                                        padding: '8px',
                                        backgroundColor: '#eff6ff',
                                        border: '1px solid #bfdbfe',
                                        borderRadius: '6px'
                                    }"
                                >
                                    <div
                                        :style="{ fontSize: '12px', color: '#1e40af', lineHeight: '1.6' }"
                                    >
                                        <strong :style="{ fontWeight: '600' }">💡 Совет:</strong>
                                        Иконки для разделов с подстраницами
                                        <br>
                                        Например: <code :style="{
                                            padding: '2px 6px',
                                            backgroundColor: '#dbeafe',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px'
                                        }">mdi-chevron-down</code>,
                                        <code :style="{
                                            padding: '2px 6px',
                                            backgroundColor: '#dbeafe',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px'
                                        }">mdi-chevron-right</code>
                                    </div>
                                </div>

                                <ui-input prop="expandIconExpanded" placeholder="mdi-chevron-down">
                                    Иконка развернутого раздела
                                </ui-input>

                                <ui-input prop="expandIconCollapsed" placeholder="mdi-chevron-right">
                                    Иконка свернутого раздела
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Global Actions -->
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                <ui-button type="danger" @click="resetAll">
                    Сбросить все стили и иконки
                </ui-button>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,

    meta: { name: 'Я дизайнер', icon: 'palette' },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        localStyles: {
            container: '',
            title: '',
            button: '',
            buttonHover: '',
            buttonActive: '',
            dropdownToggle: '',
            dropdownMenu: '',
            burgerToggle: '',
            burgerMenu: '',
            burgerLine: '',
            routeSlug: '',
            expandIcon: ''
        },
        debounceTimer: null
    }),

    computed: {
        elements() {
            return [
                {
                    key: 'container',
                    label: 'Основной контейнер',
                    selector: '.routes-navigator-container'
                },
                {
                    key: 'title',
                    label: 'Заголовок навигации',
                    selector: '.navigator-title'
                },
                {
                    key: 'button',
                    label: 'Кнопка страницы',
                    selector: '.route-button'
                },
                {
                    key: 'buttonHover',
                    label: 'Кнопка при наведении',
                    selector: '.route-button:hover'
                },
                {
                    key: 'buttonActive',
                    label: 'Активная кнопка',
                    selector: '.route-button-active'
                },
                {
                    key: 'dropdownToggle',
                    label: 'Кнопка выпадающего списка',
                    selector: '.dropdown-toggle'
                },
                {
                    key: 'dropdownMenu',
                    label: 'Меню выпадающего списка',
                    selector: '.dropdown-menu'
                },
                {
                    key: 'burgerToggle',
                    label: 'Кнопка бургер меню',
                    selector: '.burger-toggle'
                },
                {
                    key: 'burgerMenu',
                    label: 'Бургер меню',
                    selector: '.burger-menu'
                },
                {
                    key: 'burgerLine',
                    label: 'Линии бургер иконки (по умолчанию)',
                    selector: '.burger-line'
                },
                {
                    key: 'routeSlug',
                    label: 'Текст ссылки страницы',
                    selector: '.route-slug'
                },
                {
                    key: 'expandIcon',
                    label: 'Иконка развернуть/свернуть',
                    selector: '.expand-icon'
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
        getElementDefaultStyles(elementKey) {
            // Generate default styles based on current settings panel props
            const defaultPadding = 0.75; // 0.75rem
            const defaultFontSize = 0.875; // 0.875rem
            const paddingObj = this.props.buttonPadding || { size: defaultPadding, unit: 'rem' };
            const padding = `${paddingObj.size}${paddingObj.unit}`;
            const fontSizeObj = this.props.fontSize || { size: defaultFontSize, unit: 'rem' };
            const fontSize = `${fontSizeObj.size}${fontSizeObj.unit}`;

            switch (elementKey) {
                case 'container':
                    return `background-color: ${this.props.backgroundColor || '#ffffff'};
color: ${this.props.textColor || '#1f2937'};
border-radius: ${this.props.borderRadius || '0.375rem'};
padding: 1rem;${this.props.boxShadow ? `\nbox-shadow: ${this.props.boxShadow}` : ''}`;
                case 'title':
                    return `font-size: ${fontSizeObj.size * 1.2}${fontSizeObj.unit};
font-weight: 600;
margin-bottom: 0.75rem;
color: ${this.props.textColor || '#1f2937'};
font-family: ${this.props.fontFamily || 'inherit'}`;
                case 'button':
                    return `padding: ${padding};
font-size: ${fontSize};
border-radius: ${this.props.borderRadius || '0.375rem'};
cursor: pointer;
transition: all 0.2s ease;
font-family: ${this.props.fontFamily || 'inherit'};${this.props.buttonShadow ? `\nbox-shadow: ${this.props.buttonShadow}` : ''}`;
                case 'buttonHover':
                    return `background-color: ${this.props.hoverColor || '#60a5fa'};
color: #ffffff`;
                case 'buttonActive':
                    return `background-color: ${this.props.activeColor || '#3b82f6'};
color: #ffffff`;
                case 'dropdownToggle':
                    return `padding: ${padding};
font-size: ${fontSize};
border-radius: ${this.props.borderRadius || '0.375rem'};
border: 1px solid ${this.props.showToggleBorder ? (this.props.toggleBorderColor || '#1f2937') : 'transparent'};
background-color: ${this.props.backgroundColor || '#ffffff'};
color: ${this.props.textColor || '#1f2937'};
cursor: pointer;
font-family: ${this.props.fontFamily || 'inherit'}`;
                case 'dropdownMenu':
                    return `background-color: ${this.props.backgroundColor || '#ffffff'};
border: 1px solid ${this.props.showMenuBorder ? (this.props.menuBorderColor || '#1f2937') : 'transparent'};
border-radius: ${this.props.borderRadius || '0.375rem'};
box-shadow: ${this.props.menuShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'}`;
                case 'burgerToggle':
                    return `padding: ${padding};
border-radius: ${this.props.borderRadius || '0.375rem'};
border: 1px solid ${this.props.showToggleBorder ? (this.props.toggleBorderColor || '#1f2937') : 'transparent'};
background-color: ${this.props.backgroundColor || '#ffffff'};
cursor: pointer`;
                case 'burgerMenu':
                    return `background-color: ${this.props.backgroundColor || '#ffffff'};
border: 1px solid ${this.props.showMenuBorder ? (this.props.menuBorderColor || '#1f2937') : 'transparent'};
border-radius: ${this.props.borderRadius || '0.375rem'};
box-shadow: ${this.props.menuShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'}`;
                case 'burgerLine':
                    return `width: 20px;
height: 2px;
background-color: ${this.props.textColor || '#1f2937'};
border-radius: 2px;
/* Применяется только если MDI иконки не заданы */`;
                case 'routeSlug':
                    return `font-size: 0.75rem;
color: #6b7280;
opacity: 0.8`;
                case 'expandIcon':
                    return `font-size: 0.75rem;
color: ${this.props.textColor || '#1f2937'};
cursor: pointer;
user-select: none`;
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

            // Также сбрасываем MDI иконки бургер меню
            this.props.burgerIconOpen = '';
            this.props.burgerIconClosed = '';
            this.propChanged('burgerIconOpen');
            this.propChanged('burgerIconClosed');

            // Сбрасываем иконки expand/collapse
            this.props.expandIconExpanded = '';
            this.props.expandIconCollapsed = '';
            this.propChanged('expandIconExpanded');
            this.propChanged('expandIconCollapsed');
        }
    }
};
</script>
