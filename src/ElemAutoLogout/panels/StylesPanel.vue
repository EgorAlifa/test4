<template>
    <w-panel>
        <ui-container>

            <!-- ── Per-element CSS editors ────────────────────────────── -->
            <div v-for="el in cssElements" :key="el.key" class="css-el-wrap">
                <div class="css-el-hd" @click="cssElOpen[el.key] = !cssElOpen[el.key]">
                    <span class="css-el-hd__label">{{ el.label }}</span>
                    <code class="css-el-hd__sel">{{ el.selector }}</code>
                    <i class="mdi" :class="cssElOpen[el.key] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="cssElOpen[el.key]" class="css-el-body">
                    <div class="css-info-box">
                        <div class="css-info-box__title">Базовые стили из темы:</div>
                        <pre class="css-info-box__pre">{{ getElementDefaultStyles(el.key) }}</pre>
                    </div>
                    <div class="css-el-editor-hd">
                        <span class="form-label form-label-small">CSS свойства</span>
                        <button class="css-fill-btn" type="button" @click="fillWithCurrentStyles(el.key)">
                            <i class="mdi mdi-keyboard-outline" /> Заполнить текущими
                        </button>
                    </div>
                    <textarea
                        v-model="localStyles[el.key]"
                        class="css-textarea"
                        spellcheck="false"
                        :placeholder="el.placeholder"
                        @input="onStyleChange(el.key)" />
                    <div class="css-autosave-note"><i class="mdi mdi-check-circle-outline" /> Применяется автоматически</div>
                    <div class="css-hint-box">
                        <i class="mdi mdi-information-outline" />
                        <div>
                            <strong>Совет:</strong> Только CSS свойства без селекторов.
                            Пример: <code>background: #1e293b; color: #fff;</code>
                        </div>
                    </div>
                    <button class="css-reset-el-btn" type="button" @click="resetElement(el.key)">
                        Сбросить {{ el.label.toLowerCase() }}
                    </button>
                </div>
            </div>

            <!-- ── Сброс всего CSS ────────────────────────────────────── -->
            <ui-button type="ghost" @click="resetAllCss">Сбросить весь CSS</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'palette' },
    data: () => ({
        localStyles: { overlay: '', dialog: '', btn: '' },
        cssElOpen:   { overlay: false, dialog: false, btn: false },
        debounceTimer: null,
        cssElements: [
            {
                key: 'overlay',
                label: 'Подложка',
                selector: '.auto-logout__overlay',
                placeholder: 'background: rgba(0,0,0,0.65);'
            },
            {
                key: 'dialog',
                label: 'Диалоговое окно',
                selector: '.auto-logout__dialog',
                placeholder: 'background: #1e293b;\ncolor: #f1f5f9;\nborder-radius: 16px;'
            },
            {
                key: 'btn',
                label: 'Кнопка',
                selector: '.auto-logout__dialog-btn',
                placeholder: 'background: #3b82f6;\nborder-radius: 8px;'
            }
        ]
    }),
    mounted() {
        this.localStyles.overlay = this.props.overlayCustomCss   || '';
        this.localStyles.dialog  = this.props.dialogCustomCss    || '';
        this.localStyles.btn     = this.props.dialogBtnCustomCss || '';
    },
    beforeUnmount() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },
    methods: {
        onStyleChange(key) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                const propMap = { overlay: 'overlayCustomCss', dialog: 'dialogCustomCss', btn: 'dialogBtnCustomCss' };
                this.props[propMap[key]] = this.localStyles[key];
                this.propChanged(propMap[key]);
            }, 300);
        },

        getElementDefaultStyles(key) {
            if (key === 'overlay') {
                return 'position: fixed;\ninset: 0;\ndisplay: flex;\nalign-items: center;\njustify-content: center;\nbackground: rgba(0,0,0,0.45);\nz-index: 9999;';
            }
            if (key === 'dialog') {
                return 'background: #fff;\nborder-radius: 8px;\npadding: 2rem;\nmax-width: 380px;\nwidth: 90%;\ndisplay: flex;\nflex-direction: column;\nalign-items: center;\ngap: 1rem;\ntext-align: center;\nbox-shadow: 0 8px 32px rgba(0,0,0,0.18);';
            }
            if (key === 'btn') {
                return '/* наследует стили btn btn-primary */\nmin-width: 180px;\nmargin-top: 0.5rem;';
            }
            return '';
        },

        fillWithCurrentStyles(key) {
            this.localStyles[key] = this.getElementDefaultStyles(key);
            this.onStyleChange(key);
        },

        resetElement(key) {
            this.localStyles[key] = '';
            const propMap = { overlay: 'overlayCustomCss', dialog: 'dialogCustomCss', btn: 'dialogBtnCustomCss' };
            this.props[propMap[key]] = '';
            this.propChanged(propMap[key]);
        },

        resetAllCss() {
            ['overlay', 'dialog', 'btn'].forEach((key) => this.resetElement(key));
        }
    }
};
</script>

<style scoped>
.css-el-wrap {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 8px;
}
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
.css-el-editor-hd .form-label { margin: 0; font-size: 12px; font-weight: 600; color: #334155; }
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

.css-autosave-note {
    font-size: 11px;
    color: #22c55e;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: -4px;
}
.css-autosave-note .mdi { font-size: 13px; }

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

.css-reset-el-btn {
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
.css-reset-el-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
</style>
