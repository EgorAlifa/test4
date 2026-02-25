<template>
    <w-panel>
        <ui-container>

            <!-- ── CSS пресеты ────────────────────────────────────────── -->
            <div class="section-label">Пресеты стилей</div>
            <div class="css-presets">
                <button
                    v-for="p in cssPresets"
                    :key="p.label"
                    class="css-preset-chip"
                    :title="p.label"
                    @click="applyCssPreset(p)">
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
                    <!-- Yellow: current computed styles from visual panel -->
                    <div class="css-info-box">
                        <div class="css-info-box__title">Текущие настройки из панели «Стили»:</div>
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
                    <div class="css-hint-box">
                        <i class="mdi mdi-information-outline" />
                        <div>
                            <strong>Совет:</strong> Только CSS свойства без селекторов.
                            Пример: <code>color: red; font-weight: bold;</code>
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
    meta: { name: 'Я дизайнер', icon: 'code-braces' },
    data: () => ({
        localStyles: { btn: '', hover: '' },
        cssElOpen:   { btn: false, hover: false },
        debounceTimer: null,
        cssElements: [
            {
                key: 'btn',
                label: 'Кнопка',
                selector: '.elem-btn',
                placeholder: 'text-transform: uppercase;\nletter-spacing: 0.08em;'
            },
            {
                key: 'hover',
                label: 'Кнопка при наведении',
                selector: '.elem-btn:hover',
                placeholder: 'opacity: 0.85;\ntransform: scale(1.02);'
            }
        ],
        cssPresets: [
            {
                label: 'Неон',
                btn:   'text-transform: uppercase;\nletter-spacing: 0.12em;\nborder: 2px solid currentColor;\nbox-shadow: 0 0 8px currentColor, inset 0 0 8px rgba(255,255,255,0.1);',
                hover: 'box-shadow: 0 0 18px currentColor, inset 0 0 18px rgba(255,255,255,0.15);\nfilter: brightness(1.15);'
            },
            {
                label: '3D',
                btn:   'box-shadow: 0 6px 0 rgba(0,0,0,0.25), 0 8px 12px rgba(0,0,0,0.2);\ntransform: translateY(-3px);',
                hover: 'box-shadow: 0 3px 0 rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.2);\ntransform: translateY(0);'
            },
            {
                label: 'Пунктир',
                btn:   'background: transparent;\nborder: 2px dashed currentColor;\ncolor: var(--btn-bg);',
                hover: 'background: var(--btn-bg);\ncolor: #fff;'
            },
            {
                label: 'Заглавные',
                btn:   'text-transform: uppercase;\nletter-spacing: 0.1em;\nfont-weight: 700;',
                hover: ''
            },
            {
                label: 'Подчёрк.',
                btn:   'background: transparent;\ncolor: var(--btn-bg);\nborder-radius: 0;\nborder-bottom: 2px solid currentColor;',
                hover: 'opacity: 0.75;'
            },
            { label: 'Сброс', btn: '', hover: '' }
        ]
    }),
    mounted() {
        this.localStyles.btn   = this.props.btnCustomCss || '';
        this.localStyles.hover = this.props.btnHoverCss  || '';
    },
    beforeUnmount() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },
    methods: {
        onStyleChange(key) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                if (key === 'btn') {
                    this.props.btnCustomCss = this.localStyles.btn;
                    this.propChanged('btnCustomCss');
                } else if (key === 'hover') {
                    this.props.btnHoverCss = this.localStyles.hover;
                    this.propChanged('btnHoverCss');
                }
            }, 300);
        },

        getElementDefaultStyles(key) {
            const p = this.props;
            const resolvedBg = p.btnGradientTo
                ? `linear-gradient(${p.btnGradientAngle || '135deg'}, ${p.btnBg || '#4f6aff'}, ${p.btnGradientTo})`
                : (p.btnBg || '#4f6aff');
            if (key === 'btn') {
                let s = [
                    `background: ${resolvedBg};`,
                    `color: ${p.btnColor || '#ffffff'};`,
                    `border-radius: ${p.btnBorderRadius || '8px'};`,
                    `font-size: ${p.btnFontSize || '14px'};`,
                    `font-weight: ${p.btnFontWeight || '500'};`,
                    `padding: ${p.btnPaddingV || '10px'} ${p.btnPaddingH || '20px'};`,
                    'cursor: pointer;'
                ].join('\n');
                if (p.btnShadow) s += `\nbox-shadow: ${p.btnShadow};`;
                if (p.btnBorderWidth && p.btnBorderWidth !== '0px') {
                    s += `\nborder: ${p.btnBorderWidth} solid ${p.btnBorderColor || 'transparent'};`;
                }
                return s;
            }
            if (key === 'hover') {
                return `/* Эффект: ${p.btnHoverEffect || 'default'} */\nfilter: brightness(0.9);`;
            }
            return '';
        },

        fillWithCurrentStyles(key) {
            this.localStyles[key] = this.getElementDefaultStyles(key);
            this.onStyleChange(key);
        },

        resetElement(key) {
            this.localStyles[key] = '';
            if (key === 'btn') {
                this.props.btnCustomCss = ''; this.propChanged('btnCustomCss');
            } else if (key === 'hover') {
                this.props.btnHoverCss = ''; this.propChanged('btnHoverCss');
            }
        },

        applyCssPreset(p) {
            this.localStyles.btn = p.btn;
            this.props.btnCustomCss = p.btn; this.propChanged('btnCustomCss');
            this.localStyles.hover = p.hover;
            this.props.btnHoverCss = p.hover; this.propChanged('btnHoverCss');
        },

        resetAllCss() {
            this.resetElement('btn');
            this.resetElement('hover');
        }
    }
};
</script>

<style scoped>
/* ── Section label ────────────────────────────────────────────── */
.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 4px;
    margin-bottom: 6px;
}

/* ── CSS preset chips ─────────────────────────────────────────── */
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
}
.css-preset-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }

/* ── Per-element editor ───────────────────────────────────────── */
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
.css-el-hd__label {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
}
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

/* ── Yellow info box ─────────────────────────────────────────── */
.css-info-box {
    padding: 10px 12px;
    background: #fef9ec;
    border-radius: 8px;
    border: 1px solid #fde68a;
}
.css-info-box__title {
    font-size: 11px;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 6px;
}
.css-info-box__pre {
    font-family: monospace;
    font-size: 11px;
    color: #78350f;
    white-space: pre-wrap;
    line-height: 1.5;
    margin: 0;
}

/* ── Editor header ───────────────────────────────────────────── */
.css-el-editor-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
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

/* ── CSS textarea ────────────────────────────────────────────── */
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

/* ── Blue hint box ───────────────────────────────────────────── */
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

/* ── Reset element button ────────────────────────────────────── */
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
