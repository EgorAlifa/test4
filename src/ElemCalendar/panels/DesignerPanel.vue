<template>
    <w-panel>
        <ui-container>

            <div class="p-section__label">Я дизайнер — пользовательский CSS</div>

            <div class="css-el-wrap">
                <div class="css-el-hd" @click="open = !open">
                    <span class="css-el-hd__label">Виджет целиком</span>
                    <code class="css-el-hd__sel">.elem-cal</code>
                    <i class="mdi" :class="open ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="open" class="css-el-body">
                    <div class="css-info-box">
                        <div class="css-info-box__title">Текущие CSS-переменные из панели «Оформление»:</div>
                        <pre class="css-info-box__pre">{{ currentVarsText }}</pre>
                    </div>
                    <div class="css-el-editor-hd">
                        <span class="form-label">CSS свойства</span>
                    </div>
                    <textarea
                        v-model="localCss"
                        class="css-textarea"
                        spellcheck="false"
                        placeholder="border: 2px solid #4f6aff;&#10;font-family: 'Roboto', sans-serif;"
                        @input="onCssChange" />
                    <div class="css-hint-box">
                        <i class="mdi mdi-information-outline" />
                        <div>
                            Только CSS свойства без селекторов.
                            CSS-переменные: <code>--cal-accent</code>, <code>--cal-header-bg</code> и др.
                        </div>
                    </div>
                    <button class="css-reset-btn" @click="resetCss">Сбросить</button>
                </div>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'code-tags' },

    data: () => ({
        open: true,
        localCss: '',
        debounceTimer: null
    }),

    computed: {
        currentVarsText() {
            const p = this.props;
            return [
                `--cal-bg: ${p.calBg};`,
                `--cal-header-bg: ${p.calHeaderBg};`,
                `--cal-header-color: ${p.calHeaderColor};`,
                `--cal-accent: ${p.calAccentColor};`,
                `--cal-today-bg: ${p.calTodayBg};`,
                `--cal-today-color: ${p.calTodayColor};`,
                `--cal-selected-bg: ${p.calSelectedBg};`,
                `--cal-radius: ${p.calRadius};`,
                `--cal-shadow: ${p.calShadow};`
            ].join('\n');
        }
    },

    mounted() {
        this.localCss = this.props.calCustomCss || '';
    },

    beforeDestroy() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },

    methods: {
        onCssChange() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props.calCustomCss = this.localCss;
                this.propChanged('calCustomCss');
            }, 300);
        },

        resetCss() {
            this.localCss = '';
            this.props.calCustomCss = '';
            this.propChanged('calCustomCss');
        }
    }
};
</script>

<style scoped>
.p-section__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
}

.css-el-wrap {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
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
}
.css-el-hd .mdi { font-size: 18px; color: #94a3b8; }

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
    font-size: 10px;
    color: #78350f;
    white-space: pre-wrap;
    line-height: 1.5;
    margin: 0;
}

.css-el-editor-hd { display: flex; align-items: center; justify-content: space-between; }
.form-label { font-size: 12px; font-weight: 600; color: #334155; margin: 0; }

.css-textarea {
    width: 100%;
    height: 100px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    line-height: 1.55;
    padding: 9px 11px;
    background: #f8fafc;
    color: #1e293b;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    resize: vertical;
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
    font-size: 11px;
    color: #1e40af;
    line-height: 1.5;
}
.css-hint-box .mdi { font-size: 15px; color: #3b82f6; flex-shrink: 0; margin-top: 2px; }
.css-hint-box code {
    font-family: monospace;
    background: #dbeafe;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10px;
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
