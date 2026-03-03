<template>
    <w-panel>
        <ui-container>

            <!-- ── CSS пресеты ────────────────────────────────────────── -->
            <div class="section-label">Пресеты</div>
            <div class="css-presets">
                <button
                    v-for="p in cssPresets"
                    :key="p.label"
                    class="css-preset-chip"
                    :title="p.label"
                    @click="applyPreset(p)">
                    {{ p.label }}
                </button>
            </div>

            <!-- ── Per-element CSS editors ────────────────────────────── -->
            <div v-for="el in cssElements" :key="el.key" class="css-el-wrap">
                <div class="css-el-hd" @click="cssElOpen[el.key] = !cssElOpen[el.key]">
                    <span class="css-el-hd__label">{{ el.label }}</span>
                    <code class="css-el-hd__sel">{{ el.selector }}</code>
                    <i class="mdi" :class="cssElOpen[el.key] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="cssElOpen[el.key]" class="css-el-body">
                    <div class="css-info-box">
                        <div class="css-info-box__title">Текущие стили из «Внешний вид»:</div>
                        <pre class="css-info-box__pre">{{ getDefaultStyles(el.key) }}</pre>
                    </div>
                    <div class="css-el-editor-hd">
                        <span class="form-label">CSS свойства</span>
                        <button class="css-fill-btn" type="button" @click="fillWithCurrent(el.key)">
                            <i class="mdi mdi-keyboard-outline" /> Заполнить текущими
                        </button>
                    </div>
                    <textarea
                        v-model="localCss[el.key]"
                        class="css-textarea"
                        spellcheck="false"
                        :placeholder="el.placeholder"
                        @input="onCssChange(el.key)" />
                    <div class="css-hint-box">
                        <i class="mdi mdi-information-outline" />
                        <div>Только свойства без селекторов: <code>color: red; font-weight: bold;</code></div>
                    </div>
                    <button class="css-reset-btn" type="button" @click="resetEl(el.key)">
                        Сбросить
                    </button>
                </div>
            </div>

            <ui-button type="ghost" @click="resetAll">Сбросить весь CSS</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

const PROP_MAP = {
    root: 'cssRoot',
    item: 'cssItem',
    header: 'cssHeader',
    headerOpen: 'cssHeaderOpen',
    body: 'cssBody'
};

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'palette' },
    data: () => ({
        ...PanelInstanceTypeDescriptor,
        localCss: { root: '', item: '', header: '', headerOpen: '', body: '' },
        cssElOpen: { root: false, item: false, header: false, headerOpen: false, body: false },
        debounceTimer: null,
        cssElements: [
            {
                key: 'root',
                label: 'Контейнер',
                selector: '.elem-accordion',
                placeholder: 'box-shadow: 0 4px 24px rgba(0,0,0,0.08);'
            },
            {
                key: 'item',
                label: 'Блок аккордеона',
                selector: '.elem-accordion__item',
                placeholder: 'transition: box-shadow 0.2s;\nbox-shadow: none;'
            },
            {
                key: 'header',
                label: 'Заголовок',
                selector: '.elem-accordion__header',
                placeholder: 'text-transform: uppercase;\nletter-spacing: 0.05em;'
            },
            {
                key: 'headerOpen',
                label: 'Заголовок (открыто)',
                selector: '.elem-accordion__item--open .elem-accordion__header',
                placeholder: 'background: linear-gradient(90deg, #f0f4ff, #fff);'
            },
            {
                key: 'body',
                label: 'Содержимое',
                selector: '.elem-accordion__body',
                placeholder: 'border-top: 2px solid currentColor;'
            }
        ],
        cssPresets: [
            {
                label: 'Тени',
                root: '',
                item: 'box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: none !important;',
                header: '',
                headerOpen: '',
                body: ''
            },
            {
                label: 'Без рамок',
                root: '',
                item: 'border: none !important; border-bottom: 1px solid #e2e8f0 !important; border-radius: 0 !important;',
                header: '',
                headerOpen: '',
                body: ''
            },
            {
                label: 'Градиент откр.',
                root: '',
                item: '',
                header: '',
                headerOpen: 'background: linear-gradient(90deg, rgba(79,106,255,0.07), transparent);',
                body: ''
            },
            { label: 'Сброс', root: '', item: '', header: '', headerOpen: '', body: '' }
        ]
    }),
    mounted() {
        Object.keys(PROP_MAP).forEach((key) => {
            this.localCss[key] = this.props[PROP_MAP[key]] || '';
        });
    },
    beforeUnmount() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },
    methods: {
        onCssChange(key) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                const prop = PROP_MAP[key];
                this.props[prop] = this.localCss[key];
                this.propChanged(prop);
            }, 300);
        },
        getDefaultStyles(key) {
            const p = this.props;
            if (key === 'item') return [
                `border: 1px solid ${p.borderColor};`,
                `border-radius: ${p.borderRadius};`
            ].join('\n');
            if (key === 'header') return [
                `background: ${p.headerBg};`,
                `color: ${p.headerColor};`,
                `font-size: ${p.headerFontSize};`,
                `font-weight: ${p.headerFontWeight};`,
                `padding: ${p.headerPadding};`
            ].join('\n');
            if (key === 'headerOpen') return [
                `border-bottom: 1px solid ${p.borderColor};`,
                `color: ${p.accentColor};`
            ].join('\n');
            if (key === 'body') return [
                `background: ${p.contentBg};`,
                `color: ${p.contentColor};`,
                `font-size: ${p.contentFontSize};`,
                `padding: ${p.contentPadding};`
            ].join('\n');
            return '';
        },
        fillWithCurrent(key) {
            this.localCss[key] = this.getDefaultStyles(key);
            this.onCssChange(key);
        },
        resetEl(key) {
            this.localCss[key] = '';
            const prop = PROP_MAP[key];
            this.props[prop] = '';
            this.propChanged(prop);
        },
        applyPreset(p) {
            Object.keys(PROP_MAP).forEach((key) => {
                this.localCss[key] = p[key] || '';
                const prop = PROP_MAP[key];
                this.props[prop] = p[key] || '';
                this.propChanged(prop);
            });
        },
        resetAll() {
            Object.keys(PROP_MAP).forEach((key) => this.resetEl(key));
        }
    }
};
</script>

<style scoped>
.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 4px;
    margin-bottom: 6px;
}
.css-presets { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.css-preset-chip {
    padding: 4px 11px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
    font-family: inherit;
}
.css-preset-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.css-el-wrap { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 8px; }
.css-el-hd {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
    transition: background 0.12s;
}
.css-el-hd:hover { background: #f1f5ff; }
.css-el-hd__label { flex: 1; font-size: 13px; font-weight: 600; color: #1e293b; }
.css-el-hd__sel {
    font-family: monospace;
    font-size: 11px;
    color: #64748b;
    background: #e2e8f0;
    padding: 2px 7px;
    border-radius: 4px;
    flex-shrink: 0;
}
.css-el-hd .mdi { font-size: 18px; color: #94a3b8; flex-shrink: 0; }
.css-el-body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #fff;
    border-top: 1px solid #e2e8f0;
}
.css-info-box {
    padding: 10px 12px;
    background: #fef9ec;
    border-radius: 8px;
    border: 1px solid #fde68a;
}
.css-info-box__title { font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 6px; }
.css-info-box__pre {
    font-family: monospace;
    font-size: 11px;
    color: #78350f;
    white-space: pre-wrap;
    line-height: 1.5;
    margin: 0;
}
.css-el-editor-hd { display: flex; align-items: center; justify-content: space-between; }
.form-label { font-size: 12px; font-weight: 600; color: #334155; }
.css-fill-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 11px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.12s;
    font-weight: 500;
}
.css-fill-btn:hover { background: #2563eb; }
.css-fill-btn .mdi { font-size: 13px; }
.css-textarea {
    width: 100%;
    height: 80px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    line-height: 1.55;
    padding: 9px 11px;
    background: #f8fafc;
    color: #1e293b;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    resize: vertical;
    min-height: 52px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}
.css-textarea:focus { border-color: #4f6aff; background: #fff; }
.css-hint-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 9px 11px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    font-size: 12px;
    color: #1e40af;
    line-height: 1.5;
}
.css-hint-box .mdi { font-size: 15px; color: #3b82f6; flex-shrink: 0; margin-top: 2px; }
.css-hint-box code {
    padding: 1px 5px;
    background: #dbeafe;
    border-radius: 3px;
    font-family: monospace;
    font-size: 11px;
}
.css-reset-btn {
    align-self: flex-start;
    padding: 5px 13px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    color: #64748b;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.css-reset-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
</style>
