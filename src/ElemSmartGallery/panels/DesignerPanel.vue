<template>
    <w-panel>
        <ui-container>

            <!-- ── CSS пресеты ──────────────────────────────────────────── -->
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

            <!-- ── Редакторы по элементам ──────────────────────────────── -->
            <div v-for="el in elements" :key="el.key" class="dp-el-wrap">

                <div class="dp-el-hd" @click="toggle(el.key)">
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

            <ui-button type="ghost" class="mt-2" @click="resetAll">
                Сбросить весь CSS
            </ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import UiContainer from './components/UiContainer.vue';

const DEBOUNCE_MS = 300; // eslint-disable-line no-magic-numbers

export default {
    extends: Panel,
    components: { UiContainer },

    meta: { name: 'Я дизайнер', icon: 'palette' },

    data: () => ({
        localStyles: {},
        open: {},
        debounceTimer: null,

        cssPresets: [
            {
                label: 'Неон',
                container: 'border: 2px solid currentColor;\nbox-shadow: 0 0 10px currentColor, inset 0 0 10px rgba(255,255,255,0.05);'
            },
            {
                label: 'Стекло',
                container: 'background: rgba(255,255,255,0.1) !important;\nbackdrop-filter: blur(12px);\nborder: 1px solid rgba(255,255,255,0.2);'
            },
            {
                label: 'Тёмный',
                container: 'background: #0f172a !important;\ncolor: #e2e8f0 !important;\nborder: 1px solid #334155;'
            },
            {
                label: 'Минимализм',
                container: 'background: transparent !important;\nborder: 1.5px solid currentColor;'
            },
            { label: 'Сброс' }
        ]
    }),

    computed: {
        elements() {
            return [
                {
                    key: 'container',
                    label: 'Контейнер (сетка)',
                    selector: '.slots-grid'
                },
                {
                    key: 'slot',
                    label: 'Слот',
                    selector: '.slot-item'
                },
                {
                    key: 'stackSlot',
                    label: 'Плейсхолдер',
                    selector: '.slot-item__placeholder'
                }
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
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },

    methods: {
        toggle(key) {
            this.$set(this.open, key, !this.open[key]);
        },

        onInput() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props.customStyles = { ...this.localStyles };
                this.propChanged('customStyles');
            }, DEBOUNCE_MS);
        },

        getElementDefaultStyles(key) {
            const p = this.props;
            switch (key) {
                case 'container':
                    return [
                        p.backgroundColor ? `background-color: ${p.backgroundColor};` : null,
                        p.textColor       ? `color: ${p.textColor};`                  : null,
                        p.borderRadius    ? `border-radius: ${p.borderRadius};`        : null,
                        p.boxShadow       ? `box-shadow: ${p.boxShadow};`              : null,
                        p.opacity != null && parseFloat(p.opacity) < 1
                            ? `opacity: ${p.opacity};`
                            : null
                    ].filter(Boolean).join('\n') || '/* нет предустановленных стилей */';
                default:
                    return '/* нет предустановленных стилей */';
            }
        },

        fillWithDefaults(key) {
            const css = this.getElementDefaultStyles(key);
            this.$set(this.localStyles, key, css);
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        resetElement(key) {
            this.$set(this.localStyles, key, '');
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        applyPreset(preset) {
            this.elements.forEach((el) => {
                this.$set(this.localStyles, el.key, preset[el.key] ?? '');
            });
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
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
.mt-2 { margin-top: 8px; }

.dp-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: #94a3b8; margin: 4px 0 6px;
}

.dp-presets { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.dp-preset-chip {
    padding: 4px 11px; border-radius: 20px; border: 1.5px solid #e2e8f0;
    background: #fff; color: #475569; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: 0.12s;
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
