<template>
    <w-panel>
        <ui-container>

            <!-- ── CSS пресеты ───────────────────────────────────────────── -->
            <div class="dp-section-label">Пресеты стилей</div>
            <div class="dp-presets">
                <button
                    v-for="p in cssPresets"
                    :key="p.label"
                    class="dp-preset-chip"
                    @click="applyPreset(p)">
                    {{ p.label }}
                </button>
            </div>

            <!-- ── Редакторы по элементам ────────────────────────────────── -->
            <div v-for="el in elements" :key="el.key" class="dp-el-wrap">

                <div class="dp-el-hd" @click="toggleSection(el.key)">
                    <span class="dp-el-hd__label">{{ el.label }}</span>
                    <code class="dp-el-hd__sel">{{ el.selector }}</code>
                    <i class="mdi" :class="open[el.key] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>

                <div v-if="open[el.key]" class="dp-el-body">

                    <div class="dp-defaults-box">
                        <div class="dp-defaults-box__title">
                            Текущие настройки из панели «Оформление»:
                        </div>
                        <pre class="dp-defaults-box__pre">{{ getElementDefaultStyles(el.key) }}</pre>
                    </div>

                    <div class="dp-editor-hd">
                        <span class="dp-editor-hd__label">CSS свойства</span>
                        <button class="dp-fill-btn" type="button" @click="fillWithDefaults(el.key)">
                            <i class="mdi mdi-keyboard-outline" />
                            Заполнить текущими
                        </button>
                    </div>

                    <textarea
                        v-model="localStyles[el.key]"
                        class="dp-textarea"
                        spellcheck="false"
                        placeholder="font-weight: 700;&#10;letter-spacing: 0.05em;"
                        @input="onInput" />

                    <div class="dp-hint-box">
                        <i class="mdi mdi-information-outline" />
                        <span>
                            Только CSS свойства без селекторов:
                            <code>color: red; font-weight: bold;</code>
                        </span>
                    </div>

                    <button class="dp-reset-btn" type="button" @click="resetElement(el.key)">
                        Сбросить {{ el.label.toLowerCase() }}
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

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'palette' },
    data: () => ({
        ...PanelInstanceTypeDescriptor,
        localStyles: {},
        open: {},
        cssPresets: [
            {
                label: 'Тени',
                item: 'box-shadow: 0 2px 8px rgba(0,0,0,0.08);\nborder: none;',
                header: 'padding: 18px 20px;'
            },
            {
                label: 'Без рамок',
                root: 'border: none;',
                item: 'border: none;\nborder-bottom: 1px solid #e2e8f0;\nborder-radius: 0;'
            },
            {
                label: 'Тёмный',
                root: 'background: #1e293b;',
                item: 'border-color: #334155;\nborder-radius: 10px;',
                header: 'background: #1e293b;\ncolor: #f8fafc;',
                body: 'background: #0f172a;\ncolor: #94a3b8;'
            },
            {
                label: 'Стекло',
                root: 'background: rgba(255,255,255,0.05);\nbackdrop-filter: blur(10px);',
                item: 'background: rgba(255,255,255,0.1);\nborder: 1px solid rgba(255,255,255,0.2);\nborder-radius: 12px;',
                header: 'background: transparent;\ncolor: #fff;',
                body: 'background: rgba(255,255,255,0.05);\ncolor: rgba(255,255,255,0.8);'
            },
            { label: 'Сброс' }
        ]
    }),
    computed: {
        elements() {
            return [
                { key: 'root',       label: 'Корень',               selector: '.elem-accordion' },
                { key: 'item',       label: 'Блок',                 selector: '.elem-accordion__item' },
                { key: 'header',     label: 'Заголовок',            selector: '.elem-accordion__header' },
                { key: 'headerOpen', label: 'Заголовок (открытый)', selector: '.elem-accordion__item--open .elem-accordion__header' },
                { key: 'body',       label: 'Содержимое',           selector: '.elem-accordion__body' }
            ];
        }
    },
    mounted() {
        const saved = this.props.customStyles || {};
        this.elements.forEach((el) => {
            this.$set(this.localStyles, el.key, saved[el.key] || '');
            this.$set(this.open, el.key, false);
        });
    },
    beforeDestroy() {
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
    },
    methods: {
        toggleSection(key) {
            this.$set(this.open, key, !this.open[key]);
        },
        getElementDefaultStyles(key) {
            const p = this.props;
            switch (key) {
                case 'root':
                    return `gap: ${p.itemGap || '8px'};`;
                case 'item':
                    return [
                        `border: 1px solid ${p.borderColor || '#e2e8f0'};`,
                        `border-radius: ${p.borderRadius || '12px'};`,
                        `overflow: hidden;`
                    ].join('\n');
                case 'header':
                    return [
                        `background: ${p.headerBg || '#ffffff'};`,
                        `color: ${p.headerColor || '#1e293b'};`,
                        `font-size: ${p.headerFontSize || '15px'};`,
                        `font-weight: ${p.headerFontWeight || '600'};`,
                        `padding: ${p.headerPadding || '16px 20px'};`
                    ].join('\n');
                case 'headerOpen':
                    return [
                        `color: ${p.accentColor || '#4f6aff'};`,
                        `border-bottom: 1px solid ${p.borderColor || '#e2e8f0'};`
                    ].join('\n');
                case 'body':
                    return [
                        `background: ${p.contentBg || '#f8fafc'};`,
                        `color: ${p.contentColor || '#475569'};`,
                        `font-size: ${p.contentFontSize || '14px'};`,
                        `padding: ${p.contentPadding || '12px 20px 16px'};`
                    ].join('\n');
                default:
                    return '/* нет предустановленных стилей */';
            }
        },
        fillWithDefaults(key) {
            this.$set(this.localStyles, key, this.getElementDefaultStyles(key));
            this.save();
        },
        onInput() {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(() => this.save(), 300);
        },
        save() {
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },
        resetElement(key) {
            this.$set(this.localStyles, key, '');
            this.save();
        },
        applyPreset(preset) {
            this.elements.forEach((el) => {
                this.$set(this.localStyles, el.key, preset[el.key] || '');
            });
            this.save();
        },
        resetAll() {
            this.elements.forEach((el) => this.$set(this.localStyles, el.key, ''));
            this.props.customStyles = {};
            this.propChanged('customStyles');
        }
    }
};
</script>

<style scoped>
.dp-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: #94a3b8; margin: 4px 0 6px;
}
.dp-presets { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.dp-preset-chip {
    padding: 4px 11px; border-radius: 20px; border: 1.5px solid #e2e8f0;
    background: #fff; color: #475569; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: 0.12s; font-family: inherit;
}
.dp-preset-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.dp-el-wrap { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 8px; }
.dp-el-hd {
    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    background: #f8fafc; cursor: pointer; user-select: none; transition: background 0.12s;
}
.dp-el-hd:hover { background: #f1f5ff; }
.dp-el-hd__label { flex: 1; font-size: 13px; font-weight: 600; color: #1e293b; }
.dp-el-hd__sel {
    font-family: monospace; font-size: 11px; color: #64748b;
    background: #e2e8f0; padding: 2px 7px; border-radius: 4px;
}
.dp-el-hd .mdi { font-size: 18px; color: #94a3b8; }
.dp-el-body {
    padding: 12px; display: flex; flex-direction: column; gap: 10px;
    background: #fff; border-top: 1px solid #e2e8f0;
}
.dp-defaults-box { padding: 10px 12px; background: #fef9ec; border-radius: 8px; border: 1px solid #fde68a; }
.dp-defaults-box__title { font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 6px; }
.dp-defaults-box__pre { font-family: monospace; font-size: 11px; color: #78350f; white-space: pre-wrap; line-height: 1.5; margin: 0; }
.dp-editor-hd { display: flex; align-items: center; justify-content: space-between; }
.dp-editor-hd__label { font-size: 12px; font-weight: 600; color: #334155; }
.dp-fill-btn {
    display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px;
    background: #3b82f6; color: #fff; border: none; border-radius: 6px;
    font-size: 11px; cursor: pointer; font-weight: 500; font-family: inherit; transition: background 0.12s;
}
.dp-fill-btn:hover { background: #2563eb; }
.dp-fill-btn .mdi { font-size: 13px; }
.dp-textarea {
    width: 100%; height: 80px; font-family: 'Consolas', monospace;
    font-size: 12px; line-height: 1.55; padding: 9px 11px; background: #f8fafc;
    color: #1e293b; border: 1.5px solid #e2e8f0; border-radius: 8px;
    resize: vertical; min-height: 52px; box-sizing: border-box; outline: none; transition: border-color 0.15s;
}
.dp-textarea:focus { border-color: #4f6aff; background: #fff; }
.dp-hint-box {
    display: flex; align-items: flex-start; gap: 8px; padding: 9px 11px;
    background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
    font-size: 12px; color: #1e40af; line-height: 1.5;
}
.dp-hint-box .mdi { font-size: 15px; color: #3b82f6; flex-shrink: 0; margin-top: 2px; }
.dp-hint-box code { padding: 1px 5px; background: #dbeafe; border-radius: 3px; font-family: monospace; font-size: 11px; }
.dp-reset-btn {
    align-self: flex-start; padding: 5px 13px; border: 1.5px solid #e2e8f0;
    border-radius: 6px; background: #fff; color: #64748b; font-size: 11px;
    cursor: pointer; font-family: inherit; transition: 0.12s;
}
.dp-reset-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
</style>
