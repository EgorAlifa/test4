<template>
    <w-panel>
        <ui-container>

            <!-- ══ PRESETS ══════════════════════════════════════════════ -->
            <div class="section-label">Пресет</div>
            <div class="presets-row">
                <div
                    v-for="p in presets"
                    :key="p.label"
                    class="preset-chip"
                    :class="{ 'preset-chip--active': activePreset === p.label }"
                    :title="p.label"
                    @click="applyPreset(p)">
                    <!-- mini dialog preview inside overlay strip -->
                    <div class="chip-overlay" :style="{ background: p.swatch.overlay }">
                        <div
                            class="chip-dialog"
                            :style="{
                                background:   p.swatch.dialog,
                                color:        p.swatch.text,
                                borderRadius: p.swatch.radius,
                                borderTop:    p.swatch.borderTop || null
                            }">
                            <div class="chip-icon" :style="{ color: p.swatch.icon }">⚠</div>
                            <div class="chip-bar"></div>
                            <div class="chip-btn" :style="{ background: p.swatch.btn }"></div>
                        </div>
                    </div>
                    <div class="chip-label">
                        <i v-if="activePreset === p.label" class="mdi mdi-check chip-check" />
                        {{ p.label }}
                    </div>
                </div>
            </div>

            <div class="divider" />

            <!-- ══ OVERLAY ══════════════════════════════════════════════ -->
            <div class="section-label">Подложка</div>
            <div class="ctrl-row">
                <div class="ctrl-col">
                    <div class="ctrl-label">Цвет</div>
                    <div class="color-row">
                        <label class="color-swatch-wrap">
                            <div class="color-swatch" :style="{ background: local.overlayColor }"></div>
                            <input
                                type="color"
                                class="color-hidden"
                                v-model="local.overlayColor"
                                @change="save('overlayColor')" />
                        </label>
                        <span class="color-val">{{ local.overlayColor }}</span>
                    </div>
                </div>
                <div class="ctrl-col ctrl-col--grow">
                    <div class="ctrl-label">Непрозрачность &nbsp;<strong>{{ local.overlayOpacity }}%</strong></div>
                    <input
                        type="range"
                        class="slider"
                        min="0"
                        max="100"
                        v-model.number="local.overlayOpacity"
                        @input="save('overlayOpacity')" />
                </div>
            </div>

            <!-- ══ DIALOG ════════════════════════════════════════════════ -->
            <div class="section-label">Диалог</div>
            <div class="ctrl-row">
                <div class="ctrl-col">
                    <div class="ctrl-label">Фон</div>
                    <div class="color-row">
                        <label class="color-swatch-wrap">
                            <div class="color-swatch" :style="{ background: local.dialogBgColor || '#ffffff' }"></div>
                            <input
                                type="color"
                                class="color-hidden"
                                :value="local.dialogBgColor || '#ffffff'"
                                @change="saveColor('dialogBgColor', $event.target.value)" />
                        </label>
                        <span class="color-val">{{ local.dialogBgColor || 'авто' }}</span>
                        <button v-if="local.dialogBgColor" class="color-clear" title="Сбросить" @click="clearColor('dialogBgColor')">×</button>
                    </div>
                </div>
                <div class="ctrl-col">
                    <div class="ctrl-label">Текст</div>
                    <div class="color-row">
                        <label class="color-swatch-wrap">
                            <div class="color-swatch" :style="{ background: local.dialogTextColor || '#1a1a1a' }"></div>
                            <input
                                type="color"
                                class="color-hidden"
                                :value="local.dialogTextColor || '#1a1a1a'"
                                @change="saveColor('dialogTextColor', $event.target.value)" />
                        </label>
                        <span class="color-val">{{ local.dialogTextColor || 'авто' }}</span>
                        <button v-if="local.dialogTextColor" class="color-clear" title="Сбросить" @click="clearColor('dialogTextColor')">×</button>
                    </div>
                </div>
            </div>
            <div class="ctrl-row">
                <div class="ctrl-col ctrl-col--grow">
                    <div class="ctrl-label">Скругление &nbsp;<strong>{{ local.dialogRadius }}px</strong></div>
                    <input
                        type="range"
                        class="slider"
                        min="0"
                        max="40"
                        v-model.number="local.dialogRadius"
                        @input="save('dialogRadius')" />
                </div>
                <div class="ctrl-col">
                    <div class="ctrl-label">Иконка</div>
                    <div class="color-row">
                        <label class="color-swatch-wrap">
                            <div class="color-swatch" :style="{ background: local.iconColor || '#f59e0b' }"></div>
                            <input
                                type="color"
                                class="color-hidden"
                                :value="local.iconColor || '#f59e0b'"
                                @change="saveColor('iconColor', $event.target.value)" />
                        </label>
                        <span class="color-val">{{ local.iconColor || 'авто' }}</span>
                        <button v-if="local.iconColor" class="color-clear" title="Сбросить" @click="clearColor('iconColor')">×</button>
                    </div>
                </div>
            </div>

            <!-- ══ BUTTON ════════════════════════════════════════════════ -->
            <div class="section-label">Кнопка</div>
            <div class="ctrl-row">
                <div class="ctrl-col">
                    <div class="ctrl-label">Фон</div>
                    <div class="color-row">
                        <label class="color-swatch-wrap">
                            <div class="color-swatch" :style="{ background: local.btnBgColor || '#4f6aff' }"></div>
                            <input
                                type="color"
                                class="color-hidden"
                                :value="local.btnBgColor || '#4f6aff'"
                                @change="saveColor('btnBgColor', $event.target.value)" />
                        </label>
                        <span class="color-val">{{ local.btnBgColor || 'авто' }}</span>
                        <button v-if="local.btnBgColor" class="color-clear" title="Сбросить" @click="clearColor('btnBgColor')">×</button>
                    </div>
                </div>
                <div class="ctrl-col">
                    <div class="ctrl-label">Текст</div>
                    <div class="color-row">
                        <label class="color-swatch-wrap">
                            <div class="color-swatch" :style="{ background: local.btnTextColor || '#ffffff' }"></div>
                            <input
                                type="color"
                                class="color-hidden"
                                :value="local.btnTextColor || '#ffffff'"
                                @change="saveColor('btnTextColor', $event.target.value)" />
                        </label>
                        <span class="color-val">{{ local.btnTextColor || 'авто' }}</span>
                        <button v-if="local.btnTextColor" class="color-clear" title="Сбросить" @click="clearColor('btnTextColor')">×</button>
                    </div>
                </div>
            </div>
            <div class="ctrl-row">
                <div class="ctrl-col ctrl-col--grow">
                    <div class="ctrl-label">Скругление &nbsp;<strong>{{ local.btnRadius }}px</strong></div>
                    <input
                        type="range"
                        class="slider"
                        min="0"
                        max="40"
                        v-model.number="local.btnRadius"
                        @input="save('btnRadius')" />
                </div>
            </div>

            <div class="divider" />

            <ui-button type="ghost" @click="resetAll">Сбросить стили</ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

const PRESETS = [
    {
        label: 'По умолч.',
        swatch: { overlay: 'rgba(0,0,0,0.45)', dialog: '#fff', text: '#1a1a1a', radius: '8px', icon: '#f59e0b', btn: '#4f6aff' },
        visual: { overlayColor: '#000000', overlayOpacity: 45, dialogBgColor: '', dialogTextColor: '', dialogRadius: 8, btnBgColor: '', btnTextColor: '', btnRadius: 8, iconColor: '' },
        rawCss: { overlay: '', dialog: '', btn: '' }
    },
    {
        label: 'Тёмная',
        swatch: { overlay: 'rgba(0,0,0,0.72)', dialog: '#1e293b', text: '#f1f5f9', radius: '12px', icon: '#fbbf24', btn: '#3b82f6' },
        visual: { overlayColor: '#000000', overlayOpacity: 72, dialogBgColor: '#1e293b', dialogTextColor: '#f1f5f9', dialogRadius: 12, btnBgColor: '#3b82f6', btnTextColor: '#ffffff', btnRadius: 8, iconColor: '#fbbf24' },
        rawCss: { overlay: '', dialog: '', btn: '' }
    },
    {
        label: 'Стекло',
        swatch: { overlay: 'linear-gradient(135deg,#0f172a,#334155)', dialog: 'rgba(255,255,255,0.18)', text: '#fff', radius: '20px', icon: '#fbbf24', btn: 'rgba(255,255,255,0.3)' },
        visual: { overlayColor: '#0f172a', overlayOpacity: 55, dialogBgColor: '', dialogTextColor: '#ffffff', dialogRadius: 20, btnBgColor: '', btnTextColor: '#ffffff', btnRadius: 10, iconColor: '#fbbf24' },
        rawCss: {
            overlay: 'backdrop-filter: blur(6px);',
            dialog:  'background: rgba(255,255,255,0.15); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.25);',
            btn:     'background: rgba(255,255,255,0.2) !important; border: 1.5px solid rgba(255,255,255,0.4) !important;'
        }
    },
    {
        label: 'Опасность',
        swatch: { overlay: 'rgba(127,29,29,0.55)', dialog: '#fff', text: '#1a1a1a', radius: '12px', borderTop: '3px solid #ef4444', icon: '#ef4444', btn: '#ef4444' },
        visual: { overlayColor: '#7f1d1d', overlayOpacity: 55, dialogBgColor: '#ffffff', dialogTextColor: '#1a1a1a', dialogRadius: 12, btnBgColor: '#ef4444', btnTextColor: '#ffffff', btnRadius: 8, iconColor: '#ef4444' },
        rawCss: { overlay: '', dialog: 'border-top: 4px solid #ef4444;', btn: '' }
    },
    {
        label: 'Мягкая',
        swatch: { overlay: 'rgba(100,116,139,0.35)', dialog: '#f8fafc', text: '#334155', radius: '20px', icon: '#f59e0b', btn: '#64748b' },
        visual: { overlayColor: '#64748b', overlayOpacity: 35, dialogBgColor: '#f8fafc', dialogTextColor: '#334155', dialogRadius: 20, btnBgColor: '#64748b', btnTextColor: '#ffffff', btnRadius: 10, iconColor: '#f59e0b' },
        rawCss: { overlay: '', dialog: 'border: 1px solid #e2e8f0;', btn: '' }
    }
];

export default {
    extends: Panel,
    meta: { name: 'Стили', icon: 'palette' },
    data: () => ({
        activePreset: null,
        debounceTimer: null,
        presets: PRESETS,
        local: {
            overlayColor:    '#000000',
            overlayOpacity:  45,
            dialogBgColor:   '',
            dialogTextColor: '',
            dialogRadius:    8,
            btnBgColor:      '',
            btnTextColor:    '',
            btnRadius:       8,
            iconColor:       ''
        }
    }),
    mounted() {
        const p = this.props;
        this.local.overlayColor    = p.overlayColor    || '#000000';
        this.local.overlayOpacity  = p.overlayOpacity  != null ? p.overlayOpacity  : 45;
        this.local.dialogBgColor   = p.dialogBgColor   || '';
        this.local.dialogTextColor = p.dialogTextColor || '';
        this.local.dialogRadius    = p.dialogRadius    != null ? p.dialogRadius    : 8;
        this.local.btnBgColor      = p.btnBgColor      || '';
        this.local.btnTextColor    = p.btnTextColor    || '';
        this.local.btnRadius       = p.btnRadius       != null ? p.btnRadius       : 8;
        this.local.iconColor       = p.iconColor       || '';
        this.activePreset = this.detectActivePreset();
    },
    beforeUnmount() {
        clearTimeout(this.debounceTimer);
    },
    methods: {
        detectActivePreset() {
            const p = this.props;
            return PRESETS.find((preset) => {
                const v = preset.visual;
                return (
                    v.overlayColor    === (p.overlayColor    || '#000000') &&
                    v.overlayOpacity  === (p.overlayOpacity  != null ? p.overlayOpacity  : 45) &&
                    v.dialogBgColor   === (p.dialogBgColor   || '') &&
                    v.dialogTextColor === (p.dialogTextColor || '') &&
                    v.dialogRadius    === (p.dialogRadius    != null ? p.dialogRadius    : 8) &&
                    v.btnBgColor      === (p.btnBgColor      || '') &&
                    v.btnTextColor    === (p.btnTextColor    || '') &&
                    v.btnRadius       === (p.btnRadius       != null ? p.btnRadius       : 8) &&
                    v.iconColor       === (p.iconColor       || '') &&
                    preset.rawCss.overlay === (p.overlayCustomCss    || '') &&
                    preset.rawCss.dialog  === (p.dialogCustomCss     || '') &&
                    preset.rawCss.btn     === (p.dialogBtnCustomCss  || '')
                );
            })?.label ?? null;
        },

        applyPreset(preset) {
            this.activePreset = preset.label;
            const v = preset.visual;
            // Apply visual props
            Object.entries(v).forEach(([key, val]) => {
                this.local[key] = val;
                this.props[key] = val;
                this.propChanged(key);
            });
            // Apply raw CSS overrides
            this.props.overlayCustomCss   = preset.rawCss.overlay; this.propChanged('overlayCustomCss');
            this.props.dialogCustomCss    = preset.rawCss.dialog;  this.propChanged('dialogCustomCss');
            this.props.dialogBtnCustomCss = preset.rawCss.btn;     this.propChanged('dialogBtnCustomCss');
        },

        save(key) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props[key] = this.local[key];
                this.propChanged(key);
                this.activePreset = this.detectActivePreset();
            }, 120);
        },

        saveColor(key, value) {
            this.local[key] = value;
            this.props[key] = value;
            this.propChanged(key);
            this.activePreset = this.detectActivePreset();
        },

        clearColor(key) {
            this.local[key] = '';
            this.props[key] = '';
            this.propChanged(key);
            this.activePreset = this.detectActivePreset();
        },

        resetAll() {
            const defaults = {
                overlayColor: '#000000', overlayOpacity: 45,
                dialogBgColor: '', dialogTextColor: '', dialogRadius: 8,
                btnBgColor: '', btnTextColor: '', btnRadius: 8, iconColor: ''
            };
            Object.entries(defaults).forEach(([key, val]) => {
                this.local[key] = val;
                this.props[key] = val;
                this.propChanged(key);
            });
            ['overlayCustomCss', 'dialogCustomCss', 'dialogBtnCustomCss'].forEach((key) => {
                this.props[key] = '';
                this.propChanged(key);
            });
            this.activePreset = null;
        }
    }
};
</script>

<style scoped>
/* ── Section label ────────────────────────────────────────────── */
.section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 10px;
    margin-bottom: 6px;
}

/* ── Divider ──────────────────────────────────────────────────── */
.divider {
    height: 1px;
    background: #f1f5f9;
    margin: 10px 0 4px;
}

/* ── Preset chips row ─────────────────────────────────────────── */
.presets-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.preset-chip {
    flex: 1 1 0;
    min-width: 52px;
    max-width: 68px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.13s, box-shadow 0.13s;
    background: #fff;
}
.preset-chip:hover { border-color: #a5b4fc; }
.preset-chip--active {
    border-color: #4f6aff;
    box-shadow: 0 0 0 2px rgba(79,106,255,0.18);
}

/* mini overlay fill */
.chip-overlay {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
}

/* mini dialog card */
.chip-dialog {
    width: 100%;
    padding: 4px 5px 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
}
.chip-icon { font-size: 9px; line-height: 1; }
.chip-bar { width: 70%; height: 3px; background: currentColor; opacity: 0.25; border-radius: 2px; }
.chip-btn { width: 80%; height: 5px; border-radius: 2px; margin-top: 1px; }

/* chip label */
.chip-label {
    padding: 4px 4px 4px;
    font-size: 10px;
    font-weight: 600;
    color: #475569;
    text-align: center;
    background: #fafafa;
    border-top: 1px solid #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
}
.preset-chip--active .chip-label { color: #4f6aff; background: #f5f7ff; }
.chip-check { font-size: 10px; color: #4f6aff; }

/* ── Control rows ─────────────────────────────────────────────── */
.ctrl-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    margin-bottom: 8px;
}
.ctrl-col { display: flex; flex-direction: column; gap: 4px; }
.ctrl-col--grow { flex: 1; }

.ctrl-label {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    white-space: nowrap;
}
.ctrl-label strong { color: #1e293b; font-weight: 700; }

/* ── Slider ───────────────────────────────────────────────────── */
.slider {
    width: 100%;
    height: 4px;
    cursor: pointer;
    accent-color: #4f6aff;
}

/* ── Color picker ─────────────────────────────────────────────── */
.color-row {
    display: flex;
    align-items: center;
    gap: 5px;
}
.color-swatch-wrap {
    position: relative;
    cursor: pointer;
    display: block;
    width: 26px;
    height: 26px;
    flex-shrink: 0;
}
.color-swatch {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: 1.5px solid rgba(0,0,0,0.12);
}
.color-hidden {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    padding: 0;
    border: none;
}
.color-val {
    font-size: 10px;
    color: #64748b;
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    max-width: 52px;
    text-overflow: ellipsis;
}
.color-clear {
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
    transition: color 0.1s;
    flex-shrink: 0;
}
.color-clear:hover { color: #ef4444; }
</style>
