<template>
    <w-panel>
        <ui-container>

            <div class="section-label">Пресеты оформления</div>
            <div class="presets-grid">
                <div
                    v-for="p in cssPresets"
                    :key="p.label"
                    class="preset-card"
                    :class="{ 'preset-card--active': activePreset === p.label }"
                    @click="applyPreset(p)">

                    <!-- ── Mini-preview of the logout dialog ── -->
                    <div class="preview-wrap" :style="{ background: p.preview.overlayBg }">
                        <div
                            class="preview-dialog"
                            :style="{
                                background:   p.preview.dialogBg,
                                color:        p.preview.dialogColor,
                                borderRadius: p.preview.dialogRadius,
                                border:       p.preview.dialogBorder || null,
                                borderTop:    p.preview.dialogBorderTop || null
                            }">
                            <div class="preview-icon" :style="{ color: p.preview.iconColor }">⚠</div>
                            <div class="preview-title">Сессия</div>
                            <div class="preview-msg">Выход через 30 сек.</div>
                            <div
                                class="preview-btn"
                                :style="{
                                    background:   p.preview.btnBg,
                                    color:        p.preview.btnColor,
                                    borderRadius: p.preview.btnRadius,
                                    border:       p.preview.btnBorder || null
                                }">
                                Остаться
                            </div>
                        </div>
                    </div>

                    <!-- ── Card footer ── -->
                    <div class="preset-label">
                        <i v-if="activePreset === p.label" class="mdi mdi-check-circle preset-check" />
                        {{ p.label }}
                    </div>
                </div>
            </div>

            <ui-button v-if="activePreset" type="ghost" @click="resetAll">
                Сбросить стили
            </ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

export default {
    extends: Panel,
    meta: { name: 'Внешний вид', icon: 'view-grid' },
    data: () => ({
        activePreset: null,
        cssPresets: [
            {
                label: 'По умолчанию',
                overlay: '',
                dialog:  '',
                btn:     '',
                preview: {
                    overlayBg:    'rgba(0,0,0,0.45)',
                    dialogBg:     '#ffffff',
                    dialogColor:  '#1a1a1a',
                    dialogRadius: '8px',
                    iconColor:    '#f59e0b',
                    btnBg:        '#4f6aff',
                    btnColor:     '#ffffff',
                    btnRadius:    '6px'
                }
            },
            {
                label: 'Тёмная тема',
                overlay: 'background: rgba(0,0,0,0.72);',
                dialog:  'background: #1e293b;\ncolor: #f1f5f9;\nborder-radius: 12px;\nbox-shadow: 0 8px 40px rgba(0,0,0,0.6);',
                btn:     'background: #3b82f6;\nborder-color: #3b82f6;\ncolor: #fff;',
                preview: {
                    overlayBg:    'rgba(0,0,0,0.72)',
                    dialogBg:     '#1e293b',
                    dialogColor:  '#f1f5f9',
                    dialogRadius: '12px',
                    iconColor:    '#fbbf24',
                    btnBg:        '#3b82f6',
                    btnColor:     '#fff',
                    btnRadius:    '6px'
                }
            },
            {
                label: 'Стекло',
                overlay: 'background: rgba(15,23,42,0.55);\nbackdrop-filter: blur(6px);',
                dialog:  'background: rgba(255,255,255,0.15);\nbackdrop-filter: blur(18px);\nborder: 1px solid rgba(255,255,255,0.25);\nborder-radius: 20px;\ncolor: #fff;\nbox-shadow: 0 8px 32px rgba(0,0,0,0.25);',
                btn:     'background: rgba(255,255,255,0.2);\nborder: 1.5px solid rgba(255,255,255,0.4);\ncolor: #fff;',
                preview: {
                    overlayBg:    'linear-gradient(135deg, #0f172a, #334155)',
                    dialogBg:     'rgba(255,255,255,0.18)',
                    dialogColor:  '#fff',
                    dialogRadius: '20px',
                    dialogBorder: '1px solid rgba(255,255,255,0.3)',
                    iconColor:    '#fbbf24',
                    btnBg:        'rgba(255,255,255,0.22)',
                    btnColor:     '#fff',
                    btnRadius:    '10px',
                    btnBorder:    '1.5px solid rgba(255,255,255,0.4)'
                }
            },
            {
                label: 'Опасность',
                overlay: 'background: rgba(127,29,29,0.55);',
                dialog:  'background: #fff;\nborder-top: 4px solid #ef4444;\nborder-radius: 12px;',
                btn:     'background: #ef4444;\nborder-color: #ef4444;\ncolor: #fff;',
                preview: {
                    overlayBg:       'rgba(127,29,29,0.55)',
                    dialogBg:        '#fff',
                    dialogColor:     '#1a1a1a',
                    dialogRadius:    '12px',
                    dialogBorderTop: '4px solid #ef4444',
                    iconColor:       '#ef4444',
                    btnBg:           '#ef4444',
                    btnColor:        '#fff',
                    btnRadius:       '6px'
                }
            },
            {
                label: 'Мягкая',
                overlay: 'background: rgba(100,116,139,0.35);',
                dialog:  'background: #f8fafc;\nborder: 1px solid #e2e8f0;\nborder-radius: 20px;\nbox-shadow: 0 4px 24px rgba(0,0,0,0.08);',
                btn:     'background: #64748b;\nborder-color: #64748b;\ncolor: #fff;',
                preview: {
                    overlayBg:    'rgba(100,116,139,0.35)',
                    dialogBg:     '#f8fafc',
                    dialogColor:  '#334155',
                    dialogRadius: '20px',
                    dialogBorder: '1px solid #e2e8f0',
                    iconColor:    '#f59e0b',
                    btnBg:        '#64748b',
                    btnColor:     '#fff',
                    btnRadius:    '10px'
                }
            }
        ]
    }),
    mounted() {
        this.activePreset = this.detectActivePreset();
    },
    methods: {
        detectActivePreset() {
            const { overlayCustomCss = '', dialogCustomCss = '', dialogBtnCustomCss = '' } = this.props;
            const match = this.cssPresets.find(
                (p) => p.overlay === overlayCustomCss && p.dialog === dialogCustomCss && p.btn === dialogBtnCustomCss
            );
            return match ? match.label : null;
        },

        applyPreset(p) {
            this.activePreset = p.label;
            this.props.overlayCustomCss   = p.overlay; this.propChanged('overlayCustomCss');
            this.props.dialogCustomCss    = p.dialog;  this.propChanged('dialogCustomCss');
            this.props.dialogBtnCustomCss = p.btn;     this.propChanged('dialogBtnCustomCss');
        },

        resetAll() {
            this.activePreset = null;
            this.props.overlayCustomCss   = ''; this.propChanged('overlayCustomCss');
            this.props.dialogCustomCss    = ''; this.propChanged('dialogCustomCss');
            this.props.dialogBtnCustomCss = ''; this.propChanged('dialogBtnCustomCss');
        }
    }
};
</script>

<style scoped>
/* ── Section label ──────────────────────────────────────────────── */
.section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 4px;
    margin-bottom: 10px;
}

/* ── 2-column preset grid ───────────────────────────────────────── */
.presets-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
}

/* ── Single preset card ─────────────────────────────────────────── */
.preset-card {
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    background: #fff;
}
.preset-card:hover {
    border-color: #a5b4fc;
    box-shadow: 0 2px 10px rgba(79,106,255,0.12);
}
.preset-card--active {
    border-color: #4f6aff;
    box-shadow: 0 0 0 3px rgba(79,106,255,0.15);
}

/* ── Mini preview area ─────────────────────────────────────────── */
.preview-wrap {
    height: 108px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    position: relative;
    overflow: hidden;
}

.preview-dialog {
    width: 100%;
    max-width: 160px;
    padding: 8px 10px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    font-family: inherit;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
}

.preview-icon {
    font-size: 16px;
    line-height: 1;
}

.preview-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
}

.preview-msg {
    font-size: 7.5px;
    opacity: 0.75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.preview-btn {
    margin-top: 3px;
    padding: 3px 10px;
    font-size: 7.5px;
    font-weight: 600;
    border-radius: 4px;
    white-space: nowrap;
    letter-spacing: 0.01em;
}

/* ── Card footer label ─────────────────────────────────────────── */
.preset-label {
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    border-top: 1px solid #f1f5f9;
    background: #fafafa;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
}
.preset-card--active .preset-label { color: #4f6aff; background: #f5f7ff; }
.preset-check { font-size: 14px; color: #4f6aff; }
</style>
