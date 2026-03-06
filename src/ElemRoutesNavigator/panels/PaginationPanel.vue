<template>
    <ui-panel-container>
        <ui-container>

            <!-- ── Пресеты стилей ──────────────────────────────────────── -->
            <div class="section-label">Пресеты</div>
            <div class="presets-row">
                <button
                    v-for="p in stylePresets"
                    :key="p.label"
                    class="preset-chip"
                    :class="{ 'preset-chip--reset': p.isReset }"
                    :title="p.label"
                    @click="applyPreset(p)">
                    {{ p.label }}
                </button>
            </div>

            <!-- ── Стиль кнопок ────────────────────────────────────────── -->
            <div class="section-label">Стиль кнопок</div>
            <div class="opt-grid opt-grid--3">
                <div
                    v-for="v in buttonStyleOptions"
                    :key="v.value"
                    class="opt-card"
                    :class="{ 'opt-card--active': props.buttonStyle === v.value }"
                    @click="setButtonStyle(v.value)">
                    <div class="btn-style-preview" :class="`btn-style-preview--${v.value}`">
                        <span>Aa</span>
                    </div>
                    <div class="opt-card__label">{{ v.label }}</div>
                </div>
            </div>

            <!-- ── Цвета ───────────────────────────────────────────────── -->
            <div class="section-label">Цвета</div>

            <!-- Фон кнопок -->
            <div class="color-block">
                <div class="color-block__label">Фон кнопок</div>
                <div class="color-swatches">
                    <button
                        v-for="c in colorPalettes.buttonBg"
                        :key="c.value"
                        class="swatch"
                        :class="{
                            'swatch--active': props.buttonBackgroundColor === c.value,
                            'swatch--transparent': c.value === 'transparent'
                        }"
                        :style="c.value !== 'transparent' ? { background: c.value } : {}"
                        :title="c.label"
                        @click="setColorProp('buttonBackgroundColor', c.value)" />
                    <label class="swatch swatch--custom" title="Свой цвет">
                        <input type="color" class="swatch-color-input"
                            :value="props.buttonBackgroundColor"
                            @change="setColorProp('buttonBackgroundColor', $event.target.value)" />
                    </label>
                </div>
            </div>

            <!-- Цвет текста -->
            <div class="color-block">
                <div class="color-block__label">
                    Цвет текста
                    <span v-if="overriddenValues.textColor" class="hint-override">⚠ Переопределено</span>
                </div>
                <div class="color-swatches">
                    <button
                        v-for="c in colorPalettes.text"
                        :key="c.value"
                        class="swatch"
                        :class="{ 'swatch--active': props.textColor === c.value }"
                        :style="{ background: c.value }"
                        :title="c.label"
                        @click="setColorProp('textColor', c.value)" />
                    <label class="swatch swatch--custom" title="Свой цвет">
                        <input type="color" class="swatch-color-input"
                            :value="props.textColor"
                            @change="setColorProp('textColor', $event.target.value)" />
                    </label>
                </div>
            </div>

            <!-- Цвет активной страницы -->
            <template v-if="props.highlightActivePage">
                <div class="color-block">
                    <div class="color-block__label">
                        Цвет активной страницы
                        <span v-if="overriddenValues.activeColor" class="hint-override">⚠ Переопределено</span>
                    </div>
                    <div class="color-swatches">
                        <button
                            v-for="c in colorPalettes.active"
                            :key="c.value"
                            class="swatch"
                            :class="{ 'swatch--active': props.activeColor === c.value }"
                            :style="{ background: c.value }"
                            :title="c.label"
                            @click="setColorProp('activeColor', c.value)" />
                        <label class="swatch swatch--custom" title="Свой цвет">
                            <input type="color" class="swatch-color-input"
                                :value="props.activeColor"
                                @change="setColorProp('activeColor', $event.target.value)" />
                        </label>
                    </div>
                </div>
            </template>

            <!-- Эффект наведения -->
            <ui-switch prop="enableHoverColor">Эффект наведения</ui-switch>
            <div v-if="props.enableHoverColor" class="color-block">
                <div class="color-block__label">
                    Цвет при наведении
                    <span v-if="overriddenValues.hoverColor" class="hint-override">⚠ Переопределено</span>
                </div>
                <div class="color-swatches">
                    <button
                        v-for="c in colorPalettes.hover"
                        :key="c.value"
                        class="swatch"
                        :class="{ 'swatch--active': props.hoverColor === c.value }"
                        :style="{ background: c.value }"
                        :title="c.label"
                        @click="setColorProp('hoverColor', c.value)" />
                    <label class="swatch swatch--custom" title="Свой цвет">
                        <input type="color" class="swatch-color-input"
                            :value="props.hoverColor"
                            @change="setColorProp('hoverColor', $event.target.value)" />
                    </label>
                </div>
            </div>

            <!-- Фон контейнера -->
            <div class="color-block">
                <div class="color-block__label">
                    Фон контейнера
                    <span v-if="overriddenValues.backgroundColor" class="hint-override">⚠ Переопределено</span>
                </div>
                <div class="color-swatches">
                    <button
                        v-for="c in colorPalettes.containerBg"
                        :key="c.value"
                        class="swatch"
                        :class="{
                            'swatch--active': props.backgroundColor === c.value,
                            'swatch--transparent': c.value === 'transparent'
                        }"
                        :style="c.value !== 'transparent' ? { background: c.value } : {}"
                        :title="c.label"
                        @click="setColorProp('backgroundColor', c.value)" />
                    <label class="swatch swatch--custom" title="Свой цвет">
                        <input type="color" class="swatch-color-input"
                            :value="props.backgroundColor"
                            @change="setColorProp('backgroundColor', $event.target.value)" />
                    </label>
                </div>
            </div>

            <!-- ── Шрифт ───────────────────────────────────────────────── -->
            <div class="section-label">Шрифт</div>
            <div class="font-grid">
                <button
                    v-for="f in fontFamilyOptions"
                    :key="f.value"
                    class="font-chip"
                    :class="{ 'font-chip--active': currentFontFamily === f.value }"
                    :style="{ fontFamily: f.value || 'inherit' }"
                    @click="setFontFamily(f.value)">
                    {{ f.label }}
                </button>
            </div>
            <div class="custom-font-row">
                <input
                    class="custom-font-input"
                    placeholder="Свой шрифт, напр. Comfortaa"
                    :value="customFontInput"
                    @input="customFontInput = $event.target.value"
                    @keydown.enter.prevent="applyCustomFont" />
                <button class="custom-font-btn" :disabled="!customFontInput.trim()" @click="applyCustomFont">
                    <i class="mdi mdi-check" />
                </button>
            </div>

            <!-- ── Размер текста ───────────────────────────────────────── -->
            <div class="section-label">Размер текста</div>
            <div class="size-grid">
                <div
                    v-for="s in sizePresets"
                    :key="s.label"
                    class="size-card"
                    :class="{ 'size-card--active': activeSizeLabel === s.label }"
                    @click="applySizePreset(s)">
                    <div class="size-card__stage">
                        <span class="size-card__letter" :style="{ fontSize: s.previewPx + 'px' }">Аа</span>
                    </div>
                    <div class="size-card__name">{{ s.label }}</div>
                </div>
            </div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="10"
                    max="24"
                    step="1"
                    :value="fontSizePx"
                    @input="onFontSizeSlider" />
                <span class="slider-val">{{ fontSizeDisplay }}</span>
                <div class="unit-btns">
                    <button class="unit-btn" :class="{ 'unit-btn--active': sizeUnit === 'rem' }" @click="sizeUnit = 'rem'">rem</button>
                    <button class="unit-btn" :class="{ 'unit-btn--active': sizeUnit === 'px' }" @click="sizeUnit = 'px'">px</button>
                </div>
            </div>

            <!-- ── Скругление ──────────────────────────────────────────── -->
            <div class="section-label">Скругление углов</div>
            <div class="radius-grid">
                <button
                    v-for="r in radiusPresets"
                    :key="r.label"
                    class="radius-card"
                    :class="{ 'radius-card--active': activeRadiusLabel === r.label }"
                    @click="applyRadiusPreset(r)">
                    <span class="radius-card__shape" :style="{ borderRadius: r.shape }" />
                    <span class="radius-card__label">{{ r.label }}</span>
                </button>
            </div>
            <div class="slider-row">
                <input
                    type="range"
                    class="slider"
                    min="0"
                    max="32"
                    step="1"
                    :value="borderRadiusPx"
                    @input="onRadiusSlider" />
                <span class="slider-val">{{ radiusDisplay }}</span>
                <div class="unit-btns">
                    <button class="unit-btn" :class="{ 'unit-btn--active': radiusUnit === 'rem' }" @click="radiusUnit = 'rem'">rem</button>
                    <button class="unit-btn" :class="{ 'unit-btn--active': radiusUnit === 'px' }" @click="radiusUnit = 'px'">px</button>
                </div>
            </div>

            <!-- ── Тени ────────────────────────────────────────────────── -->
            <div class="section-label">Тени</div>
            <div class="opt-grid opt-grid--4">
                <div
                    v-for="sh in shadowPresets"
                    :key="sh.label"
                    class="opt-card"
                    :class="{ 'opt-card--active': activeShadowLabel === sh.label }"
                    @click="applyShadowPreset(sh)">
                    <div class="opt-card__shadow-dot" :style="{ boxShadow: sh.preview }" />
                    <div class="opt-card__label">{{ sh.label }}</div>
                </div>
            </div>

            <!-- ── Отступы и интервалы ─────────────────────────────────── -->
            <div class="section-label">Отступы и интервалы</div>

            <ui-input-units
                col-size="6-12"
                min="0"
                :units="FontSizeFirstPxUnits"
                v-model="buttonPaddingString"
                @change="saveButtonPadding">
                Отступ кнопок
            </ui-input-units>

            <ui-input-units
                col-size="6-12"
                min="0"
                :units="FontSizeFirstPxUnits"
                v-model="buttonGapString"
                @change="saveButtonGap">
                Расстояние между кнопками
            </ui-input-units>

            <!-- ── Пагинация ───────────────────────────────────────────── -->
            <div class="section-label">Пагинация</div>

            <ui-switch prop="enablePagination">Включить пагинацию</ui-switch>

            <template v-if="props.enablePagination && isListOrientation">
                <ui-select
                    prop="paginationType"
                    :options="options.paginationTypes"
                    label="Тип пагинации" />

                <ui-input-cp
                    v-if="props.paginationType === 'pages'"
                    prop="paginationActiveColor">
                    Цвет текущего номера
                </ui-input-cp>

                <ui-input
                    prop="itemsPerPage"
                    type="number"
                    :min="1"
                    placeholder="6">
                    Элементов на странице
                </ui-input>
            </template>

            <template v-if="props.enablePagination && isMenuOrientation">
                <ui-select
                    prop="openMode"
                    :options="options.openModes"
                    label="Режим открытия меню" />
            </template>

            <!-- ── Границы (только dropdown / burger) ─────────────────── -->
            <template v-if="isMenuOrientation">
                <div class="section-label">Границы</div>

                <ui-checkbox prop="showMenuBorder">Граница списка</ui-checkbox>
                <ui-input-cp v-if="props.showMenuBorder" prop="menuBorderColor">
                    Цвет границы списка
                </ui-input-cp>

                <ui-checkbox prop="showToggleBorder">Граница кнопки</ui-checkbox>
                <ui-input-cp v-if="props.showToggleBorder" prop="toggleBorderColor">
                    Цвет границы кнопки
                </ui-input-cp>
            </template>

        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';
import {
    ORIENTATION_OPTIONS,
    BUTTON_STYLE_OPTIONS,
    FontSizeFirstPxUnits
} from '../config';

const DEFAULTS = {
    buttonStyle: 'filled',
    activeColor: '#3b82f6',
    hoverColor: '#60a5fa',
    buttonBackgroundColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: '0.375rem',
    fontFamily: 'inherit',
    fontSize: { size: 0.875, unit: 'rem' },
    boxShadow: '',
    buttonShadow: '',
    menuShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    showMenuBorder: true,
    menuBorderColor: '#1f2937',
    showToggleBorder: true,
    toggleBorderColor: '#1f2937'
};

function remToPx(remStr) {
    if (!remStr) return 0;
    const s = String(remStr).trim();
    if (s.endsWith('rem')) return Math.round(parseFloat(s) * 16); // eslint-disable-line no-magic-numbers
    if (s.endsWith('px')) return Math.round(parseFloat(s));
    return Math.round(parseFloat(s) * 16); // eslint-disable-line no-magic-numbers
}

function pxToRem(px) {
    return Math.round((px / 16) * 1000) / 1000; // eslint-disable-line no-magic-numbers
}

export default {
    extends: Panel,

    data: () => ({
        /** @public */
        $meta: { name: 'Оформление', icon: 'palette-outline' },
        ...PanelInstanceTypeDescriptor,

        customFontInput: '',
        sizeUnit: 'rem',
        radiusUnit: 'rem',

        options: {
            orientations: ORIENTATION_OPTIONS,
            buttonStyles: BUTTON_STYLE_OPTIONS,
            openModes: [
                { label: 'По клику', value: 'click' },
                { label: 'При наведении', value: 'hover' }
            ],
            paginationTypes: [
                { label: 'Прокрутка', value: 'scroll' },
                { label: 'Нумерация страниц', value: 'pages' }
            ]
        },

        buttonStyleOptions: [
            { label: 'Заливка',  value: 'filled' },
            { label: 'Обводка',  value: 'outlined' },
            { label: 'Текст',    value: 'text' }
        ],

        fontFamilyOptions: [
            { label: 'По умолч.',    value: 'inherit' },
            { label: 'Inter',        value: 'Inter, sans-serif' },
            { label: 'Roboto',       value: 'Roboto, sans-serif' },
            { label: 'Montserrat',   value: 'Montserrat, sans-serif' },
            { label: 'Open Sans',    value: "'Open Sans', sans-serif" },
            { label: 'Poppins',      value: 'Poppins, sans-serif' },
            { label: 'Nunito',       value: 'Nunito, sans-serif' },
            { label: 'PT Sans',      value: "'PT Sans', sans-serif" },
            { label: 'Rubik',        value: 'Rubik, sans-serif' },
            { label: 'Oswald',       value: 'Oswald, sans-serif' },
            { label: 'Merriweather', value: 'Merriweather, serif' },
            { label: 'PT Serif',     value: "'PT Serif', serif" },
            { label: 'Mono',         value: 'monospace' }
        ],

        sizePresets: [
            { label: 'XS', rem: 0.75,  previewPx: 9 },
            { label: 'S',  rem: 0.875, previewPx: 11 },
            { label: 'M',  rem: 1,     previewPx: 13 },
            { label: 'L',  rem: 1.125, previewPx: 15 },
            { label: 'XL', rem: 1.25,  previewPx: 17 }
        ],

        radiusPresets: [
            { label: 'Острые',  shape: '0',     css: '0rem' },
            { label: 'Мягкие',  shape: '6px',   css: '0.375rem' },
            { label: 'Круглые', shape: '12px',  css: '0.75rem' },
            { label: 'Пилюля',  shape: '999px', css: '999px' }
        ],

        colorPalettes: {
            buttonBg: [
                { label: 'Прозрачный',    value: 'transparent' },
                { label: 'Белый',         value: '#ffffff' },
                { label: 'Светло-серый',  value: '#f3f4f6' },
                { label: 'Серый',         value: '#e5e7eb' },
                { label: 'Голубой',       value: '#eff6ff' },
                { label: 'Синий',         value: '#3b82f6' },
                { label: 'Индиго',        value: '#4f46e5' },
                { label: 'Фиолетовый',    value: '#8b5cf6' },
                { label: 'Зелёный',       value: '#10b981' },
                { label: 'Красный',       value: '#ef4444' },
                { label: 'Тёмный',        value: '#1e293b' }
            ],
            text: [
                { label: 'Чёрный',        value: '#111827' },
                { label: 'Тёмно-серый',   value: '#1f2937' },
                { label: 'Серый',         value: '#64748b' },
                { label: 'Белый',         value: '#ffffff' },
                { label: 'Синий',         value: '#3b82f6' },
                { label: 'Индиго',        value: '#4f46e5' },
                { label: 'Фиолетовый',    value: '#8b5cf6' },
                { label: 'Зелёный',       value: '#10b981' },
                { label: 'Красный',       value: '#ef4444' }
            ],
            active: [
                { label: 'Синий',         value: '#3b82f6' },
                { label: 'Индиго',        value: '#4f46e5' },
                { label: 'Фиолетовый',    value: '#8b5cf6' },
                { label: 'Зелёный',       value: '#10b981' },
                { label: 'Жёлтый',        value: '#f59e0b' },
                { label: 'Красный',       value: '#ef4444' },
                { label: 'Розовый',       value: '#ec4899' },
                { label: 'Тёмный',        value: '#1e293b' }
            ],
            hover: [
                { label: 'Синий',         value: '#2563eb' },
                { label: 'Голубой',       value: '#60a5fa' },
                { label: 'Индиго',        value: '#4338ca' },
                { label: 'Фиолетовый',    value: '#7c3aed' },
                { label: 'Зелёный',       value: '#059669' },
                { label: 'Серый',         value: '#6b7280' },
                { label: 'Красный',       value: '#dc2626' },
                { label: 'Тёмный',        value: '#1e293b' }
            ],
            containerBg: [
                { label: 'Прозрачный',    value: 'transparent' },
                { label: 'Белый',         value: '#ffffff' },
                { label: 'Очень светлый', value: '#f8fafc' },
                { label: 'Светло-серый',  value: '#f1f5f9' },
                { label: 'Серый',         value: '#e2e8f0' },
                { label: 'Голубой',       value: '#eff6ff' },
                { label: 'Тёмный',        value: '#1e293b' },
                { label: 'Чёрный',        value: '#0f172a' }
            ]
        },

        shadowPresets: [
            {
                label: 'Нет',
                preview: 'none',
                boxShadow: '', buttonShadow: '', menuShadow: ''
            },
            {
                label: 'Лёгкая',
                preview: '0 2px 6px rgba(0,0,0,0.15)',
                boxShadow: '',
                buttonShadow: '0 1px 3px rgba(0,0,0,0.1)',
                menuShadow: '0 2px 8px rgba(0,0,0,0.1)'
            },
            {
                label: 'Средняя',
                preview: '0 4px 12px rgba(0,0,0,0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                buttonShadow: '0 2px 6px rgba(0,0,0,0.12)',
                menuShadow: '0 4px 12px rgba(0,0,0,0.15)'
            },
            {
                label: 'Объёмная',
                preview: '0 8px 24px rgba(0,0,0,0.25)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                buttonShadow: '0 4px 10px rgba(0,0,0,0.15)',
                menuShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }
        ],

        stylePresets: [
            {
                label: 'Минимал',
                buttonStyle: 'text',
                buttonBackgroundColor: 'transparent',
                backgroundColor: 'transparent',
                borderRadius: '0.25rem',
                boxShadow: '', buttonShadow: '', menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: false, showToggleBorder: false
            },
            {
                label: 'Заполненный',
                buttonStyle: 'filled',
                buttonBackgroundColor: '#f3f4f6',
                backgroundColor: '#ffffff',
                borderRadius: '0.375rem',
                boxShadow: '', buttonShadow: '', menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: true, showToggleBorder: true
            },
            {
                label: 'Контурный',
                buttonStyle: 'outlined',
                buttonBackgroundColor: 'transparent',
                backgroundColor: 'transparent',
                borderRadius: '0.375rem',
                boxShadow: '', buttonShadow: '', menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: true, showToggleBorder: true
            },
            {
                label: 'Пилюли',
                buttonStyle: 'filled',
                buttonBackgroundColor: '#f3f4f6',
                backgroundColor: '#ffffff',
                borderRadius: '999px',
                boxShadow: '', buttonShadow: '', menuShadow: '0 4px 6px rgba(0,0,0,0.1)',
                showMenuBorder: false, showToggleBorder: false
            },
            {
                label: 'Карточки',
                buttonStyle: 'filled',
                buttonBackgroundColor: '#ffffff',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                buttonShadow: '0 1px 3px rgba(0,0,0,0.1)',
                menuShadow: '0 8px 24px rgba(0,0,0,0.12)',
                showMenuBorder: false, showToggleBorder: false
            },
            { label: 'Сброс', isReset: true, ...DEFAULTS }
        ]
    }),

    static: {
        FontSizeFirstPxUnits
    },

    computed: {
        isListOrientation() {
            const o = this.props.orientation;
            return o === 'vertical' || o === 'dropdown' || o === 'burger';
        },

        isMenuOrientation() {
            const o = this.props.orientation;
            return o === 'dropdown' || o === 'burger';
        },

        currentFontFamily() {
            return this.props.fontFamily || 'inherit';
        },

        fontSizePx() {
            const fs = this.props.fontSize || DEFAULTS.fontSize;
            if (typeof fs === 'object') {
                return fs.unit === 'px' ? Math.round(fs.size) : Math.round(fs.size * 16); // eslint-disable-line no-magic-numbers
            }
            return 14; // eslint-disable-line no-magic-numbers
        },

        fontSizeDisplay() {
            if (this.sizeUnit === 'rem') return `${pxToRem(this.fontSizePx)}rem`;
            return `${this.fontSizePx}px`;
        },

        radiusDisplay() {
            const px = this.borderRadiusPx;
            if (px >= 32) return this.radiusUnit === 'rem' ? '∞' : '999px'; // eslint-disable-line no-magic-numbers
            if (this.radiusUnit === 'rem') return `${pxToRem(px)}rem`;
            return `${px}px`;
        },

        activeSizeLabel() {
            const px = this.fontSizePx;
            const match = this.sizePresets.find(s => Math.round(s.rem * 16) === px); // eslint-disable-line no-magic-numbers
            return match ? match.label : null;
        },

        borderRadiusPx() {
            const r = this.props.borderRadius || DEFAULTS.borderRadius;
            if (parseFloat(r) >= 100) return 32; // eslint-disable-line no-magic-numbers
            return remToPx(r);
        },

        activeRadiusLabel() {
            const raw = this.props.borderRadius || DEFAULTS.borderRadius;
            if (parseFloat(raw) >= 100) return 'Пилюля'; // eslint-disable-line no-magic-numbers
            const px = remToPx(raw);
            if (px === 0) return 'Острые';
            if (px >= 5 && px <= 7) return 'Мягкие'; // eslint-disable-line no-magic-numbers
            if (px >= 11 && px <= 13) return 'Круглые'; // eslint-disable-line no-magic-numbers
            return null;
        },

        activeShadowLabel() {
            const bs = this.props.buttonShadow || '';
            if (!bs && !this.props.boxShadow) return 'Нет';
            if (bs.includes('rgba(0,0,0,0.1)') || bs.includes('rgba(0,0,0,0.1 )')) return 'Лёгкая';
            if (bs.includes('rgba(0,0,0,0.12)')) return 'Средняя';
            if (bs.includes('rgba(0,0,0,0.15)')) return 'Объёмная';
            return null;
        },

        overriddenValues() {
            const customStyles = this.props.customStyles || {};
            const overrides = {};

            Object.keys(customStyles).forEach(key => {
                const css = customStyles[key];
                if (!css || !css.trim()) return;

                const colorMatch = css.match(/(?:background-)?color:\s*([^;!]+)/i);
                if (colorMatch) {
                    if (key === 'button' || key === 'container') {
                        const bgMatch = css.match(/background-color:\s*([^;!]+)/i);
                        const textMatch = css.match(/(?:^|;)\s*color:\s*([^;!]+)/i);
                        if (bgMatch) overrides.backgroundColor = bgMatch[1].trim();
                        if (textMatch) overrides.textColor = textMatch[1].trim();
                    }
                    if (key === 'buttonHover') overrides.hoverColor = colorMatch[1].trim();
                    if (key === 'buttonActive') overrides.activeColor = colorMatch[1].trim();
                }
            });

            return overrides;
        },

        fontSizeString: {
            get() {
                const fontSize = this.props.fontSize || DEFAULTS.fontSize;
                return `${fontSize.size}${fontSize.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.fontSize = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.fontSize = val;
                }
            }
        },

        buttonPaddingString: {
            get() {
                const padding = this.props.buttonPadding || { size: 0.75, unit: 'rem' };
                return `${padding.size}${padding.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.buttonPadding = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.buttonPadding = val;
                }
            }
        },

        buttonGapString: {
            get() {
                const gap = this.props.buttonGap || { size: 0.5, unit: 'rem' };
                return `${gap.size}${gap.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.buttonGap = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.buttonGap = val;
                }
            }
        }
    },

    methods: {
        setColorProp(prop, value) {
            this.props[prop] = value;
            this.propChanged(prop);
        },

        setButtonStyle(val) {
            this.props.buttonStyle = val;
            this.propChanged('buttonStyle');
        },

        setFontFamily(val) {
            this.props.fontFamily = val;
            this.propChanged('fontFamily');
        },

        applyCustomFont() {
            const f = this.customFontInput.trim();
            if (!f) return;
            this.props.fontFamily = f;
            this.propChanged('fontFamily');
            this.customFontInput = '';
        },

        applySizePreset(s) {
            this.props.fontSize = { size: s.rem, unit: 'rem' };
            this.propChanged('fontSize');
        },

        onFontSizeSlider(e) {
            const px = parseInt(e.target.value, 10);
            this.props.fontSize = { size: pxToRem(px), unit: 'rem' };
            this.propChanged('fontSize');
        },

        applyRadiusPreset(r) {
            this.props.borderRadius = r.css;
            this.propChanged('borderRadius');
        },

        onRadiusSlider(e) {
            const px = parseInt(e.target.value, 10);
            this.props.borderRadius = px >= 32 ? '999px' : `${pxToRem(px)}rem`; // eslint-disable-line no-magic-numbers
            this.propChanged('borderRadius');
        },

        applyShadowPreset(sh) {
            this.props.boxShadow = sh.boxShadow;
            this.propChanged('boxShadow');
            this.props.buttonShadow = sh.buttonShadow;
            this.propChanged('buttonShadow');
            this.props.menuShadow = sh.menuShadow;
            this.propChanged('menuShadow');
        },

        saveFontSize() {
            this.propChanged('fontSize');
        },

        saveButtonPadding() {
            this.propChanged('buttonPadding');
        },

        saveButtonGap() {
            this.propChanged('buttonGap');
        },

        applyPreset(preset) {
            const keys = [
                'buttonStyle', 'buttonBackgroundColor', 'backgroundColor',
                'borderRadius', 'fontFamily',
                'boxShadow', 'buttonShadow', 'menuShadow',
                'showMenuBorder', 'menuBorderColor', 'showToggleBorder', 'toggleBorderColor'
            ];
            keys.forEach(key => {
                if (preset[key] !== undefined) {
                    this.props[key] = preset[key];
                    this.propChanged(key);
                }
            });
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
    margin-top: 12px;
    margin-bottom: 5px;
}

/* ── Preset chips ─────────────────────────────────────────────── */
.presets-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 4px;
}
.preset-chip {
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
.preset-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }
.preset-chip--reset:hover { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }

/* ── Opt-card grid ────────────────────────────────────────────── */
.opt-grid {
    display: grid;
    gap: 6px;
    margin-bottom: 4px;
}
.opt-grid--3 { grid-template-columns: repeat(3, 1fr); }
.opt-grid--4 { grid-template-columns: repeat(4, 1fr); }

.opt-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 8px 4px 6px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    background: #fafbfc;
    transition: border-color 0.12s, background 0.12s, box-shadow 0.12s;
    user-select: none;
}
.opt-card:hover { border-color: #a5b4fc; background: #f5f7ff; }
.opt-card--active { border-color: #4f6aff; background: #eff2ff; box-shadow: 0 0 0 2px rgba(79,106,255,0.15); }
.opt-card__label {
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    text-align: center;
    line-height: 1.2;
}
.opt-card--active .opt-card__label { color: #4f6aff; }

/* ── Button style preview ─────────────────────────────────────── */
.btn-style-preview {
    width: 48px;
    height: 24px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
}
.btn-style-preview--filled   { background: #3b82f6; color: #fff; border: none; }
.btn-style-preview--outlined { background: transparent; color: #3b82f6; border: 1.5px solid #3b82f6; }
.btn-style-preview--text     { background: transparent; color: #3b82f6; border: none; }

/* ── Shadow dot ───────────────────────────────────────────────── */
.opt-card__shadow-dot {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #fff;
    border: 1px solid #e2e8f0;
}

/* ── Font grid ────────────────────────────────────────────────── */
.font-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 6px;
}
.font-chip {
    padding: 4px 10px;
    border-radius: 6px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #334155;
    font-size: 12px;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    white-space: nowrap;
}
.font-chip:hover { border-color: #a5b4fc; background: #f5f7ff; color: #4f6aff; }
.font-chip--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; font-weight: 600; }

/* ── Custom font row ──────────────────────────────────────────── */
.custom-font-row {
    display: flex;
    gap: 5px;
    margin-bottom: 2px;
}
.custom-font-input {
    flex: 1;
    padding: 6px 9px;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    font-size: 12px;
    font-family: inherit;
    color: #334155;
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
}
.custom-font-input:focus { border-color: #4f6aff; }
.custom-font-input::placeholder { color: #b0bec5; }
.custom-font-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    background: #fff;
    color: #64748b;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.custom-font-btn:not(:disabled):hover { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; }
.custom-font-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Size cards ───────────────────────────────────────────────── */
.size-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
    margin-bottom: 6px;
}
.size-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 4px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    background: #fafbfc;
    transition: border-color 0.12s, background 0.12s;
    user-select: none;
}
.size-card:hover { border-color: #a5b4fc; background: #f5f7ff; }
.size-card--active { border-color: #4f6aff; background: #eff2ff; }
.size-card__stage {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.size-card__letter { color: #334155; font-weight: 600; line-height: 1; }
.size-card--active .size-card__letter { color: #4f6aff; }
.size-card__name { font-size: 10px; font-weight: 600; color: #94a3b8; text-align: center; }
.size-card--active .size-card__name { color: #4f6aff; }

/* ── Radius cards ─────────────────────────────────────────────── */
.radius-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    margin-bottom: 6px;
}
.radius-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 8px 4px 6px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    background: #fafbfc;
    transition: border-color 0.12s, background 0.12s;
    user-select: none;
}
.radius-card:hover { border-color: #a5b4fc; background: #f5f7ff; }
.radius-card--active { border-color: #4f6aff; background: #eff2ff; }
.radius-card__shape {
    width: 24px;
    height: 16px;
    background: #cbd5e1;
    display: block;
}
.radius-card--active .radius-card__shape { background: #818cf8; }
.radius-card__label { font-size: 10px; font-weight: 600; color: #94a3b8; text-align: center; line-height: 1.2; }
.radius-card--active .radius-card__label { color: #4f6aff; }

/* ── Slider ───────────────────────────────────────────────────── */
.slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
}
.slider {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 2px;
    background: #e2e8f0;
    outline: none;
    cursor: pointer;
}
.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4f6aff;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(79,106,255,0.4);
}
.slider-val {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
    min-width: 36px;
    text-align: right;
}

/* ── Color blocks ─────────────────────────────────────────────── */
.color-block {
    margin-bottom: 6px;
}
.color-block__label {
    font-size: 12px;
    font-weight: 500;
    color: #475569;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.color-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 5px;
}
.swatch {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    flex-shrink: 0;
    padding: 0;
    outline: none;
}
.swatch:hover { transform: scale(1.18); }
.swatch--active { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #4f6aff; }
.swatch--transparent {
    background: linear-gradient(135deg, #fff 40%, #f87171 40%, #f87171 60%, #fff 60%) !important;
    border-color: #e2e8f0;
}
.swatch--custom {
    background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
    border-color: transparent;
    cursor: pointer;
    position: relative;
    display: inline-flex;
}
.swatch-color-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    top: 50%;
    left: 50%;
    pointer-events: none;
}

/* ── Unit toggle ──────────────────────────────────────────────── */
.unit-btns {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
}
.unit-btn {
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    background: transparent;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    line-height: 1.4;
    transition: border-color 0.1s, color 0.1s, background 0.1s;
}
.unit-btn:hover { border-color: #a5b4fc; color: #4f6aff; }
.unit-btn--active { border-color: #4f6aff; background: #eff2ff; color: #4f6aff; font-weight: 600; }

/* ── Override hint ────────────────────────────────────────────── */
.hint-override {
    color: #f59e0b;
    font-size: 0.75rem;
}
</style>
