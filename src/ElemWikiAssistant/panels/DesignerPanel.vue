<template>
    <w-panel>
        <ui-container>
            <!-- Редакторы CSS по элементам -->
            <ui-has-panel v-for="element in elements" :key="element.key">
                <div class="form-label form-label-small">
                    {{ element.label }}
                    <span class="text-xs opacity-60 font-normal ml-2">{{ element.selector }}</span>
                </div>
                <template #panel>
                    <ui-panel :groups="[{ name: element.label, slot: element.key }]">
                        <template #[element.key]>
                            <ui-container>
                                <!-- Текущие стили из «Оформления» -->
                                <div class="dp-defaults">
                                    <div class="dp-defaults__title">Текущие настройки из панели:</div>
                                    <pre class="dp-defaults__code">{{ getElementDefaultStyles(element.key) }}</pre>
                                </div>

                                <!-- Редактор CSS -->
                                <div class="form-label form-label-small mb-1 flex justify-between items-center">
                                    <span>CSS свойства</span>
                                    <button class="dp-fill-btn" type="button" @click="fillWithCurrentSettings(element.key)">
                                        Заполнить текущими
                                    </button>
                                </div>
                                <textarea
                                    v-model="localStyles[element.key]"
                                    class="dp-textarea"
                                    :placeholder="getElementDefaultStyles(element.key)"
                                    spellcheck="false"
                                    @input="handleStyleChange"
                                ></textarea>

                                <!-- Подсказка -->
                                <div class="dp-hint">
                                    <strong>Совет:</strong> вводите только CSS свойства без селекторов. Например:
                                    <code>color: red; font-weight: bold;</code>
                                </div>

                                <ui-button type="ghost" class="mt-2" @click="resetElement(element.key)">
                                    Сбросить {{ element.label.toLowerCase() }}
                                </ui-button>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                <ui-button type="danger" @click="resetAll">Сбросить все стили</ui-button>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';
import { CSS_ELEMENTS } from '../constants';

/** Задержка сохранения CSS при наборе, мс */
const SAVE_DEBOUNCE_MS = 300;

export default {
    extends: Panel,

    meta: { name: 'Я дизайнер', icon: 'palette' },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        localStyles: CSS_ELEMENTS.reduce((acc, { key }) => ({ ...acc, [key]: '' }), {}),
        debounceTimer: null
    }),

    computed: {
        elements() {
            return CSS_ELEMENTS;
        }
    },

    mounted() {
        // Локальная модель заполняется из пропа один раз при монтировании
        const saved = this.props.customStyles;
        if (saved != null && typeof saved === 'object') {
            Object.keys(this.localStyles).forEach((key) => {
                if (saved[key] != null) {
                    this.localStyles[key] = saved[key];
                }
            });
        }
    },

    beforeDestroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    },

    methods: {
        /**
         * CSS, который сейчас задают пропы «Оформления» для элемента
         * @param {string} key
         * @return {string}
         */
        getElementDefaultStyles(key) {
            const p = this.props;
            const accent = p.accentColor || '#4f46e5';
            const bg = p.backgroundColor || '#ffffff';
            const text = p.textColor || '#1f2937';
            const radius = `${Number(p.borderRadius) || 0}px`;
            const fontSize = `${Number(p.fontSize) || 14}px`;

            switch (key) {
                case 'root':
                    return `font-size: ${fontSize};\ncolor: ${text};`;
                case 'fab':
                    return `width: 56px;\nheight: 56px;\nborder-radius: 50%;\nbackground: ${accent};\ncolor: #ffffff;`;
                case 'panel':
                    return [
                        p.displayMode !== 'inline' ? `width: ${Number(p.panelWidth) || 380}px;` : 'width: 100%;',
                        p.displayMode !== 'inline' ? `height: ${Number(p.panelHeight) || 560}px;` : 'height: 100%;',
                        `background: ${bg};`,
                        `border-radius: ${radius};`
                    ].join('\n');
                case 'header':
                    return `padding: 12px 16px;\nborder-bottom: 1px solid rgba(0, 0, 0, 0.08);\nfont-weight: 600;`;
                case 'messages':
                    return 'padding: 16px;\ngap: 12px;';
                case 'userBubble':
                    return `background: ${accent};\ncolor: #ffffff;\nborder-radius: 14px 14px 4px 14px;`;
                case 'assistantBubble':
                    return `background: rgba(0, 0, 0, 0.04);\ncolor: ${text};\nborder-radius: 14px 14px 14px 4px;`;
                case 'citation':
                    return `color: ${accent};\ntext-decoration: underline;`;
                case 'suggestion':
                    return `border: 1px solid ${accent};\ncolor: ${accent};\nborder-radius: 999px;`;
                case 'composer':
                    return 'padding: 10px 12px;\nborder-top: 1px solid rgba(0, 0, 0, 0.08);';
                case 'input':
                    return `font-size: ${fontSize};\ncolor: ${text};\nborder-radius: 10px;`;
                case 'sendButton':
                    return `background: ${accent};\ncolor: #ffffff;\nborder-radius: 10px;`;
                default:
                    return '/* Нет предустановленных стилей */';
            }
        },

        saveStyles() {
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        handleStyleChange() {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = setTimeout(() => {
                this.debounceTimer = null;
                this.saveStyles();
            }, SAVE_DEBOUNCE_MS);
        },

        fillWithCurrentSettings(key) {
            this.localStyles[key] = this.getElementDefaultStyles(key);
            this.saveStyles();
        },

        resetElement(key) {
            this.localStyles[key] = '';
            this.saveStyles();
        },

        resetAll() {
            Object.keys(this.localStyles).forEach((key) => {
                this.localStyles[key] = '';
            });
            this.props.customStyles = {};
            this.propChanged('customStyles');
        }
    }
};
</script>

<style lang="pcss" scoped>
.dp-defaults {
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 6px;
    background-color: #fef3c7;

    &__title {
        margin-bottom: 4px;
        font-size: 11px;
        font-weight: 500;
        color: #92400e;
    }

    &__code {
        margin: 0;
        font-family: monospace;
        font-size: 11px;
        line-height: 1.4;
        white-space: pre-wrap;
        color: #78350f;
    }
}

.dp-fill-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background-color: #3b82f6;
    font-size: 11px;
    color: #ffffff;
    cursor: pointer;
}

.dp-textarea {
    width: 100%;
    height: 160px;
    min-height: 60px;
    max-height: 240px;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: #ffffff;
    font-family: monospace;
    font-size: 13px;
    color: #111827;
    resize: vertical;
}

.dp-hint {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    background-color: #eff6ff;
    font-size: 12px;
    line-height: 1.6;
    color: #1e40af;

    code {
        padding: 2px 6px;
        border-radius: 4px;
        background-color: #dbeafe;
        font-family: monospace;
        font-size: 11px;
        white-space: nowrap;
    }
}
</style>
