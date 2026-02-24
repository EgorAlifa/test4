<template>
    <w-panel>
        <ui-container>
            <!-- ── Быстрые настройки ───────────────────────────────────── -->
            <ui-input-cp prop="btnBg">Цвет фона</ui-input-cp>
            <ui-input-cp prop="btnColor">Цвет текста</ui-input-cp>
            <ui-input prop="btnBorderRadius" placeholder="8px">Скругление углов</ui-input>

            <!-- ── Типографика ────────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Шрифт</template>
                <ui-container>
                    <ui-input prop="btnFontSize" placeholder="14px">Размер шрифта</ui-input>
                    <ui-select prop="btnFontWeight" :options="fontWeightOptions">
                        Насыщенность
                    </ui-select>
                </ui-container>
            </ui-collapse>

            <!-- ── Отступы ────────────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Отступы</template>
                <ui-container>
                    <ui-input prop="btnPaddingV" placeholder="10px">Отступ по вертикали</ui-input>
                    <ui-input prop="btnPaddingH" placeholder="20px">Отступ по горизонтали</ui-input>
                </ui-container>
            </ui-collapse>

            <!-- ── Рамка ──────────────────────────────────────────────── -->
            <ui-collapse>
                <template #header>Рамка</template>
                <ui-container>
                    <ui-input prop="btnBorderWidth" placeholder="0px">Ширина рамки</ui-input>
                    <ui-input-cp prop="btnBorderColor">Цвет рамки</ui-input-cp>
                </ui-container>
            </ui-collapse>

            <!-- ── Тень ───────────────────────────────────────────────── -->
            <ui-input prop="btnShadow" placeholder="0 2px 12px rgba(0,0,0,0.15)">
                Тень
            </ui-input>

            <!-- ── Я дизайнер (raw CSS) ───────────────────────────────── -->
            <ui-collapse>
                <template #header>Я дизайнер</template>
                <ui-container>
                    <!-- Normal state -->
                    <ui-has-panel>
                        <div class="form-label form-label-small">
                            Кнопка
                            <span
                                :style="{
                                    fontSize: '11px',
                                    opacity: '0.5',
                                    fontWeight: 'normal',
                                    marginLeft: '6px'
                                }"
                            >.btn</span>
                        </div>
                        <template #panel>
                            <ui-panel :groups="[{ name: 'CSS кнопки', slot: 'btn' }]">
                                <template #btn>
                                    <ui-container>
                                        <div
                                            :style="{
                                                marginBottom: '10px',
                                                padding: '8px',
                                                backgroundColor: '#fef3c7',
                                                borderRadius: '6px'
                                            }"
                                        >
                                            <div :style="{ fontSize: '11px', fontWeight: '500', marginBottom: '4px', color: '#92400e' }">
                                                Текущие настройки:
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
                                            >{{ currentBtnCss }}</pre>
                                        </div>

                                        <div
                                            class="form-label form-label-small mb-1"
                                            :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }"
                                        >
                                            <span>CSS свойства</span>
                                            <button
                                                type="button"
                                                :style="{
                                                    fontSize: '11px',
                                                    padding: '4px 8px',
                                                    backgroundColor: '#3b82f6',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }"
                                                @click="fillBtnWithCurrent"
                                            >
                                                Заполнить текущими
                                            </button>
                                        </div>
                                        <textarea
                                            v-model="localBtnCss"
                                            :style="{
                                                width: '100%',
                                                height: '120px',
                                                fontFamily: 'monospace',
                                                fontSize: '13px',
                                                padding: '10px',
                                                backgroundColor: '#fff',
                                                color: '#111827',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                resize: 'vertical',
                                                minHeight: '60px'
                                            }"
                                            :placeholder="currentBtnCss"
                                            spellcheck="false"
                                            @input="onBtnCssChange"
                                        />

                                        <div
                                            :style="{
                                                marginTop: '8px',
                                                padding: '8px 10px',
                                                backgroundColor: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                color: '#1e40af',
                                                lineHeight: '1.6'
                                            }"
                                        >
                                            Вводите только свойства без селектора, например:
                                            <code
                                                :style="{
                                                    padding: '2px 5px',
                                                    backgroundColor: '#dbeafe',
                                                    borderRadius: '3px',
                                                    fontFamily: 'monospace',
                                                    fontSize: '11px'
                                                }"
                                            >color: red; font-weight: bold;</code>
                                        </div>

                                        <ui-button type="ghost" class="mt-2" @click="resetBtnCss">
                                            Сбросить
                                        </ui-button>
                                    </ui-container>
                                </template>
                            </ui-panel>
                        </template>
                    </ui-has-panel>

                    <!-- Hover state -->
                    <ui-has-panel>
                        <div class="form-label form-label-small">
                            При наведении
                            <span
                                :style="{
                                    fontSize: '11px',
                                    opacity: '0.5',
                                    fontWeight: 'normal',
                                    marginLeft: '6px'
                                }"
                            >.btn:hover</span>
                        </div>
                        <template #panel>
                            <ui-panel :groups="[{ name: 'CSS при наведении', slot: 'hover' }]">
                                <template #hover>
                                    <ui-container>
                                        <textarea
                                            v-model="localHoverCss"
                                            :style="{
                                                width: '100%',
                                                height: '80px',
                                                fontFamily: 'monospace',
                                                fontSize: '13px',
                                                padding: '10px',
                                                backgroundColor: '#fff',
                                                color: '#111827',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                resize: 'vertical',
                                                minHeight: '50px'
                                            }"
                                            placeholder="background: #3b54f0; color: #fff;"
                                            spellcheck="false"
                                            @input="onHoverCssChange"
                                        />
                                        <ui-button type="ghost" class="mt-2" @click="resetHoverCss">
                                            Сбросить
                                        </ui-button>
                                    </ui-container>
                                </template>
                            </ui-panel>
                        </template>
                    </ui-has-panel>
                </ui-container>
            </ui-collapse>

            <!-- ── Сброс всего оформления ─────────────────────────────── -->
            <ui-button type="ghost" @click="resetAll">
                Сбросить оформление
            </ui-button>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

/**
 * @typedef {import('./OptionsPanel').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;

const DEFAULTS = {
    btnBg: '#4f6aff',
    btnColor: '#ffffff',
    btnBorderRadius: '8px',
    btnFontSize: '14px',
    btnFontWeight: '500',
    btnPaddingV: '10px',
    btnPaddingH: '20px',
    btnShadow: '0 2px 12px rgba(79, 106, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)',
    btnBorderWidth: '0px',
    btnBorderColor: 'transparent'
};

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'palette' },
    data: () => ({
        ...ComponentInstanceTypeDescriptor,
        localBtnCss: '',
        localHoverCss: '',
        debounceTimer: null,
        fontWeightOptions: [
            { label: 'Обычный (400)', value: '400' },
            { label: 'Средний (500)', value: '500' },
            { label: 'Полужирный (600)', value: '600' },
            { label: 'Жирный (700)', value: '700' }
        ]
    }),
    computed: {
        currentBtnCss() {
            const p = this.props;
            const lines = [
                `background: ${p.btnBg || DEFAULTS.btnBg};`,
                `color: ${p.btnColor || DEFAULTS.btnColor};`,
                `border-radius: ${p.btnBorderRadius || DEFAULTS.btnBorderRadius};`,
                `font-size: ${p.btnFontSize || DEFAULTS.btnFontSize};`,
                `font-weight: ${p.btnFontWeight || DEFAULTS.btnFontWeight};`,
                `padding: ${p.btnPaddingV || DEFAULTS.btnPaddingV} ${p.btnPaddingH || DEFAULTS.btnPaddingH};`,
                `box-shadow: ${p.btnShadow || DEFAULTS.btnShadow};`
            ];
            if ((p.btnBorderWidth || DEFAULTS.btnBorderWidth) !== '0px') {
                lines.push(`border: ${p.btnBorderWidth} solid ${p.btnBorderColor || DEFAULTS.btnBorderColor};`);
            }
            return lines.join('\n');
        }
    },
    mounted() {
        this.localBtnCss = this.props.btnCustomCss || '';
        this.localHoverCss = this.props.btnHoverCss || '';
    },
    beforeUnmount() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },
    methods: {
        onBtnCssChange() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props.btnCustomCss = this.localBtnCss;
                this.propChanged('btnCustomCss');
            }, 300);
        },
        onHoverCssChange() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props.btnHoverCss = this.localHoverCss;
                this.propChanged('btnHoverCss');
            }, 300);
        },
        fillBtnWithCurrent() {
            this.localBtnCss = this.currentBtnCss;
            this.props.btnCustomCss = this.localBtnCss;
            this.propChanged('btnCustomCss');
        },
        resetBtnCss() {
            this.localBtnCss = '';
            this.props.btnCustomCss = '';
            this.propChanged('btnCustomCss');
        },
        resetHoverCss() {
            this.localHoverCss = '';
            this.props.btnHoverCss = '';
            this.propChanged('btnHoverCss');
        },
        resetAll() {
            Object.entries(DEFAULTS).forEach(([key, val]) => {
                this.props[key] = val;
                this.propChanged(key);
            });
            this.resetBtnCss();
            this.resetHoverCss();
        }
    }
};
</script>
