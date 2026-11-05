<template>
    <div
        class="elem-btn"
        :class="[cssClass, buttonDynamicClass]"
        :style="[cssStyle, buttonStyle]"
        @click="handleClick">
        <span v-if="isLoading" class="elem-btn__spinner" />
        <i
            v-if="props.btnIconLeft && !isLoading"
            :class="props.btnIconLeft"
            class="elem-btn__icon elem-btn__icon--left" />
        <!-- Editor mode: TiptapEditor (same as ElemText/ElemSticker) -->
        <tiptap-editor
            v-if="isEditingCanvas && props.btnShowText !== false"
            :value="props.btnText"
            placeholder="Кнопка"
            :autofocus="true"
            class="elem-btn__label-editor"
            @change="onBtnLabelChange"
            @click.native.stop="handleClick"
            @mousedown.native.stop
            @pointerdown.native.stop
        >
            <!-- Extra row in Tiptap toolbar: button color + size -->
            <template #extra-tools>
                <div class="tiptap-toolbar__row">
                    <span class="tiptap-toolbar__divider" />
                    <span class="tiptap-toolbar__label">Цвет</span>
                    <button
                        v-for="color in canvasQuickColors"
                        :key="color"
                        type="button"
                        class="cbar__dot"
                        :class="{ 'cbar__dot--active': props.btnBg === color }"
                        :style="{ background: color }"
                        :title="color"
                        @mousedown.prevent="setCanvasColor(color)"
                    />
                    <span class="tiptap-toolbar__divider" />
                    <span class="tiptap-toolbar__label">Размер</span>
                    <button
                        v-for="s in canvasSizes"
                        :key="s.key"
                        type="button"
                        class="cbar__size"
                        :class="{ 'cbar__size--active': canvasCurrentSize === s.key }"
                        @mousedown.prevent="setCanvasSize(s)"
                    >{{ s.key }}</button>
                </div>
            </template>
        </tiptap-editor>
        <!-- View mode: plain text -->
        <span
            v-else-if="props.btnShowText !== false"
            class="elem-btn__text"
        >{{ props.btnText || 'Кнопка' }}</span>
        <slot />
        <i
            v-if="props.btnIconRight"
            :class="props.btnIconRight"
            class="elem-btn__icon elem-btn__icon--right" />
        <!-- Редактор: проверка ссылки в новой вкладке (то же — Ctrl/⌘ + клик по кнопке) -->
        <button
            v-if="isEditingCanvas && hasLink"
            type="button"
            class="elem-btn__open-link"
            title="Открыть ссылку в новой вкладке (или Ctrl/⌘ + клик по кнопке)"
            @click.stop.prevent="openLinkFromEditor"
            @mousedown.stop
            @pointerdown.stop>
            <i class="mdi mdi-open-in-new" />
        </button>
        <ui-popover v-bind="popoverOptions" :show.sync="isPopupVisible">
            <div class="elem-btn__toast">{{ popupText }}</div>
        </ui-popover>
        <component v-if="customCssContent" :is="'style'" v-html="customCssContent" />
    </div>
</template>

<script>
/**
 * @typedef {import('./ElemButton').IComponentOptions} IComponentOptions
 * @typedef {import('./ElemButton').IInstance} IInstance
 */
import { Elem, Managers } from 'goodt-wcore';
import { cloneDeep } from 'lodash';
import { useRouteQueryManager } from '@goodt-wcore/utils';
import { Popover } from 'goodteditor-ui';
import { POPUP_LIFETIME } from './constants';
import { buildSerializedStoreUrl, toQueryValue } from './utils';
import {
    PlatformMode,
    appendQuery,
    buildEditorPreviewUrl,
    buildViewerUrl,
    classifyUrl,
    detectPlatformMode,
    getTopLocation,
    isViewerPath,
    splitRelativeUrl
} from './navigation';
import { meta, Vars } from './descriptor';
import TiptapEditor from './components/TiptapEditor.vue';

const { store, ValueObject } = Managers.StoreManager;
const { addRouteQueryParams } = useRouteQueryManager();

/**
 * @typedef {import('./types').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;

export default {
    extends: Elem,
    meta,
    components: { UiPopover: Popover, TiptapEditor },

    data: () => ({
        isPopupVisible: false,
        popupText: '',
        isLoading: false,
        hasClassActive: false,
        ...ComponentInstanceTypeDescriptor,
        canvasQuickColors: ['#4f6aff', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#0f172a', '#ffffff'],
        canvasSizes: [
            { key: 'S',  paddingV: '6px',  paddingH: '14px', fontSize: '12px' },
            { key: 'M',  paddingV: '10px', paddingH: '20px', fontSize: '14px' },
            { key: 'L',  paddingV: '14px', paddingH: '28px', fontSize: '16px' },
            { key: 'XL', paddingV: '18px', paddingH: '36px', fontSize: '18px' }
        ]
    }),
    static: {
        popoverOptions: {
            // eslint-disable-next-line no-restricted-syntax
            positionOffset: [0, -50],
            target: 'body',
            appendToBody: false,
            autoWidth: false,
            position: 'bottom'
        }
    },
    computed: {
        /**
         * Кнопка на холсте редактора: клик редактирует подпись и не переходит по ссылке.
         * В плеере и публикации — всегда false, даже если платформа прислала isEditorMode.
         *
         * @return {boolean}
         */
        isEditingCanvas() {
            return this.getPlatformMode() === PlatformMode.EDITOR;
        },
        /** @return {boolean} */
        hasLink() {
            return classifyUrl(this.props.url).kind !== 'invalid';
        },
        isToggleActive() {
            const { btnIsToggle, btnToggleStoreVar, btnToggleActiveValue } = this.props;
            if (!btnIsToggle || !btnToggleStoreVar) return false;
            const storeVal = store.state[btnToggleStoreVar]?.value;
            const noValueSet = btnToggleActiveValue === '' || btnToggleActiveValue === null || btnToggleActiveValue === undefined;
            if (noValueSet) {
                return storeVal !== null && storeVal !== undefined && storeVal !== '';
            }
            return String(storeVal) === String(btnToggleActiveValue);
        },
        isDisabled() {
            const { btnDisableVar } = this.props;
            if (!btnDisableVar) return false;
            const val = store.state[btnDisableVar]?.value;
            return val === null || val === undefined || val === '';
        },
        buttonDynamicClass() {
            const { btnHoverEffect, btnIsGlass, btnShowText, btnIconLeft, btnIconRight, hasClassName } = this.props;
            return {
                [`elem-btn--hover-${btnHoverEffect}`]: btnHoverEffect && btnHoverEffect !== 'default',
                'elem-btn--loading': this.isLoading,
                'elem-btn--toggle-active': this.isToggleActive,
                'elem-btn--glass': btnIsGlass,
                'elem-btn--disabled': this.isDisabled,
                'elem-btn--icon-only': btnShowText === false && !this.isLoading && (btnIconLeft || btnIconRight),
                'elem-btn--editing': this.isEditingCanvas,
                [hasClassName]: !!(hasClassName && this.hasClassActive)
            };
        },
        buttonStyle() {
            const {
                btnBg, btnColor, btnBorderRadius, btnFontSize, btnFontWeight,
                btnFontFamily, btnLetterSpacing, btnTextTransform,
                btnPaddingV, btnPaddingH, btnShadow, btnBorderWidth, btnBorderColor,
                btnGradientTo, btnGradientAngle, btnCursor,
                btnToggleBg, btnToggleColor
            } = this.props;

            const resolvedBg = btnGradientTo
                ? `linear-gradient(${btnGradientAngle || '135deg'}, ${btnBg}, ${btnGradientTo})`
                : btnBg;

            const style = {
                '--btn-bg': resolvedBg,
                '--btn-color': btnColor,
                '--btn-border-radius': btnBorderRadius,
                '--btn-font-size': btnFontSize,
                '--btn-font-weight': btnFontWeight,
                '--btn-font-family': btnFontFamily || 'inherit',
                '--btn-letter-spacing': btnLetterSpacing || '0.02em',
                '--btn-text-transform': btnTextTransform || 'none',
                '--btn-padding-v': btnPaddingV,
                '--btn-padding-h': btnPaddingH,
                '--btn-shadow': btnShadow,
                '--btn-border-width': btnBorderWidth,
                '--btn-border-color': btnBorderColor,
                '--btn-cursor': btnCursor || 'pointer'
            };

            if (this.isToggleActive) {
                style['--btn-bg'] = btnToggleBg || '#1e293b';
                style['--btn-color'] = btnToggleColor || '#ffffff';
            }

            return style;
        },
        customCssContent() {
            const { btnCustomCss, btnHoverCss } = this.props;
            let css = '';
            if (btnCustomCss) css += `.elem-btn { ${btnCustomCss} }`;
            if (btnHoverCss) css += `.elem-btn:hover { ${btnHoverCss} }`;
            return css || null;
        },
        /** @return {string[]} */
        eventName() {
            return this.descriptor.props.eventName.getCompat(this.props.eventName);
        },
        /** @return {string[]} */
        cutParams() {
            return this.descriptor.props.cutParams.getCompat(this.props.cutParams);
        },
        canvasCurrentSize() {
            const v = this.props.btnPaddingV;
            if (v === '6px')  return 'S';
            if (v === '10px') return 'M';
            if (v === '14px') return 'L';
            if (v === '18px') return 'XL';
            return null;
        }
    },
    watch: {
        /**
         * Normalize btnText: strip HTML if platform's ui-input or any other
         * mechanism stored raw HTML (e.g. "<p></p>") instead of plain text.
         */
        'props.btnText'(val) {
            if (val && val.includes('<')) {
                const plain = val.replace(/<[^>]*>/g, '').trim();
                if (plain !== val) {
                    this.props.btnText = plain || 'Кнопка';
                    this.propChanged('btnText');
                }
            }
        }
    },
    methods: {
        handleClick(event) {
            // Холст редактора: обычный клик — редактирование; Ctrl/⌘ + клик — проверить ссылку в новой вкладке
            if (this.isEditingCanvas) {
                if (event && (event.ctrlKey || event.metaKey) && this.hasLink) {
                    event.preventDefault();
                    this.openLinkFromEditor();
                }
                return;
            }
            if (this.isDisabled || this.isLoading) return;
            if (this.props.isClickSelf && event && event.target !== event.currentTarget) return;
            this.onClick();
        },
        buildStateFromFilters(filters) {
            return filters.reduce((acc, { name, data, valueSource, fromVar }) => {
                if (valueSource !== 'var') {
                    return { ...acc, [name]: new ValueObject(data, store.state[name]?.meta) };
                }
                // «A = текущее значение B», source var not chosen yet — leave the target untouched
                if (fromVar == null || fromVar === '') {
                    return acc;
                }
                // B may be set earlier in the same list — its new value wins over the store
                const isSetInBatch = Object.prototype.hasOwnProperty.call(acc, fromVar);
                const value = (isSetInBatch ? acc[fromVar] : store.state[fromVar])?.value;
                // empty/cleared source clears the target (bare undefined, as applyCutParams)
                const isEmpty = [null, undefined, ''].includes(value) || (Array.isArray(value) && value.length === 0);
                if (isEmpty) {
                    return { ...acc, [name]: undefined };
                }
                return { ...acc, [name]: new ValueObject(cloneDeep(value), store.state[name]?.meta) };
            }, {});
        },
        applyCutParams() {
            const { cutParams } = this;
            if (cutParams.length > 0) {
                const state = cutParams.reduce((acc, val) => ({ ...acc, [val]: undefined }), {});
                store.commit(state, { context: this });
            }
        },
        applyStoreFilters() {
            const { filters } = this.props;
            if (filters.length > 0) {
                store.commit(this.buildStateFromFilters(filters), { context: this });
            }
        },
        applyToggle() {
            const { btnIsToggle, btnToggleStoreVar, btnToggleActiveValue } = this.props;
            if (!btnIsToggle || !btnToggleStoreVar) return;

            const currentVal = store.state[btnToggleStoreVar]?.value;
            const activeVal = btnToggleActiveValue || '1';
            const noValueSet = btnToggleActiveValue === '' || btnToggleActiveValue === null || btnToggleActiveValue === undefined;
            const isCurrentlyActive = noValueSet
                ? (currentVal !== null && currentVal !== undefined && currentVal !== '')
                : String(currentVal) === String(btnToggleActiveValue);

            if (isCurrentlyActive) {
                store.commit({ [btnToggleStoreVar]: undefined }, { context: this });
            } else {
                store.commit(
                    { [btnToggleStoreVar]: new ValueObject(activeVal, store.state[btnToggleStoreVar]?.meta) },
                    { context: this }
                );
            }
        },
        triggerCustomEvent() {
            this.eventName.forEach(this.$eventTrigger);
        },
        // ── Навигация ──────────────────────────────────────────────────
        // Правила (одинаковы для всех видов ссылок):
        //  - холст редактора: не переходим (клик редактирует кнопку), проверка ссылки — Ctrl/⌘ + клик или «↗»;
        //  - плеер / публикация / встроенный проект: переходим всегда, синхронно в обработчике клика,
        //    иначе браузер считает новую вкладку всплывающим окном и блокирует её.
        /** @return {string} */
        getPlatformMode() {
            if (typeof window === 'undefined') return PlatformMode.VIEWER;
            const pathnames = [window.location.pathname, getTopLocation(window).pathname];
            return detectPlatformMode({ isEditorMode: this.isEditorMode, pathnames });
        },

        /**
         * Итоговый адрес перехода или null, если ссылка не задана / недопустима.
         *
         * @param {Record<string, *>} query — параметры кнопки
         * @return {{ href: string, isRelative: boolean, route?: { path: string, query: object } }|null}
         */
        resolveNavigationTarget(query = {}) {
            const { kind, href } = classifyUrl(this.props.url);
            if (kind === 'invalid') return null;
            if (kind === 'absolute') return { href: appendQuery(href, query), isRelative: false };
            const { path, query: urlQuery } = splitRelativeUrl(href);
            return {
                href: buildViewerUrl(window.location, href, query),
                isRelative: true,
                route: { path, query: { ...urlQuery, ...query } }
            };
        },

        navigateUrl() {
            if (typeof window === 'undefined') return;
            if (this.getPlatformMode() === PlatformMode.EDITOR) return;
            const target = this.resolveNavigationTarget(this.buildNavigateQueryParams());
            if (target == null) return;

            // Новая вкладка — window.open строго синхронно в клике (иначе блокировщик всплывающих окон)
            if (this.props.isTargetBlank === true) {
                window.open(target.href, '_blank', 'noopener,noreferrer');
                return;
            }

            // Внешняя ссылка в этой вкладке
            if (target.isRelative === false) {
                window.location.assign(target.href);
                return;
            }

            // Страница проекта в этой вкладке.
            // Плеер и публикация работают на hash-роутинге (…/#/slug): меняем hash, платформа сама
            // переключает страницу без перезагрузки. $router здесь не используем — у виджета это может
            // быть роутер редактора (history, без маршрутов проекта), и push только портит адрес.
            const isHashRouted = isViewerPath(window.location.pathname)
                || window.location.hash !== ''
                || this.$router == null;
            if (isHashRouted || target.route.path === '') {
                window.location.assign(target.href);
                return;
            }
            // Проект без hash-роутинга (встроенный режим) — через роутер приложения
            this.$router.push(target.route).catch(() => {});
        },

        /** Редактор: открыть ссылку кнопки в новой вкладке, без изменения переменных */
        openLinkFromEditor() {
            if (typeof window === 'undefined') return;
            const query = this.buildNavigateQueryParams();
            const { kind, href } = classifyUrl(this.props.url);
            if (kind === 'invalid') return;
            const loc = getTopLocation(window);
            const targetHref = kind === 'absolute'
                ? appendQuery(href, query)
                : (buildEditorPreviewUrl(loc, href, query) ?? buildViewerUrl(loc, href, query));
            window.open(targetHref, '_blank', 'noopener,noreferrer');
        },
        saveUrlInStorage() {
            if (this.props.isSaveUrlForStore) {
                this.$storeCommit({ [Vars.ROUTE]: this.props.url });
            }
        },
        startLoading() {
            const { btnLoadingOnClick, btnLoadingDuration } = this.props;
            if (!btnLoadingOnClick) return;
            this.isLoading = true;
            setTimeout(() => { this.isLoading = false; }, btnLoadingDuration || 1500);
        },
        onClick() {
            const { isCopyStore, shouldCopyText, hasClassName } = this.props;

            if (hasClassName) this.hasClassActive = !this.hasClassActive;

            this.applyToggle();
            this.startLoading();

            const commonMethods = [
                this.applyCutParams,
                this.applyStoreFilters,
                this.triggerCustomEvent,
                this.addRouteQueryParams
            ];
            const executeMethods = this.props.isSaveUrlForStore
                ? [...commonMethods, this.saveUrlInStorage]
                : [...commonMethods, this.navigateUrl];

            if (isCopyStore) executeMethods.push(this.copySerializedStoreUrlToClipboard);
            if (shouldCopyText) executeMethods.push(this.copyTextToClipboard);

            // Ошибка одного шага (переменные, события) не должна отменять остальные, в т.ч. переход по ссылке
            executeMethods.forEach((handler) => {
                try {
                    handler.call(this);
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('[ElemButton]', handler.name, error);
                }
            });
        },
        copySerializedStoreUrlToClipboard() {
            const excludeKeys = (this.props.isCopyStoreExcludeVars || '')
                .split(',').map((s) => s.trim()).filter(Boolean);
            const url = buildSerializedStoreUrl(window.location.href, store.state, excludeKeys);
            navigator.clipboard.writeText(url).then(() => this.showPopup('Ссылка скопирована'));
        },
        copyTextToClipboard() {
            navigator.clipboard.writeText(this.props.textToCopy).then(() => this.showPopup('Текст скопирован'));
        },
        showPopup(text) {
            this.isPopupVisible = true;
            this.popupText = text;
            setTimeout(() => { this.isPopupVisible = false; }, POPUP_LIFETIME);
        },
        addRouteQueryParams() {
            const { routeQueryParamNames } = this.props;
            if (routeQueryParamNames.length === 0) return;
            const queryParams = routeQueryParamNames.reduce(
                (acc, param) => ({ ...acc, [param.label]: param.value }),
                {}
            );
            addRouteQueryParams(queryParams);
        },
        /** TiptapEditor change: extract plain text, never store raw HTML in btnText */
        onBtnLabelChange(html) {
            const plain = (html || '').replace(/<[^>]*>/g, '').trim();
            if (plain === this.props.btnText) return;
            this.props.btnText = plain;
            this.propChanged('btnText');
        },

        /** Canvas bar: set background color */
        setCanvasColor(color) {
            this.props.btnBg = color;
            this.propChanged('btnBg');
        },
        /** Canvas bar: set S/M/L/XL size */
        setCanvasSize(s) {
            this.props.btnPaddingV = s.paddingV; this.propChanged('btnPaddingV');
            this.props.btnPaddingH = s.paddingH; this.propChanged('btnPaddingH');
            this.props.btnFontSize = s.fontSize; this.propChanged('btnFontSize');
        },
        // Reads the CURRENT store (after cutParams/filters were applied in onClick):
        // cleared vars are empty and skipped, vars set by filters go with their new value.
        buildNavigateQueryParams() {
            const { urlFilters } = this.props;
            const { state } = store;
            return urlFilters.reduce((acc, { name, var: varName, source, data }) => {
                const key = name || varName;
                if (key == null || key === '') {
                    return acc;
                }
                const rawValue = source === 'value' ? data : state[varName || name]?.value;
                const value = toQueryValue(rawValue);
                return value === undefined ? acc : { ...acc, [key]: value };
            }, {});
        }
    }
};
</script>

<style scoped>
.elem-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-height: var(--btn-height, 40px);
    padding: var(--btn-padding-v, 10px) var(--btn-padding-h, 20px);
    border-radius: var(--btn-border-radius, 8px);
    background: var(--btn-bg, #4f6aff);
    color: var(--btn-color, #fff);
    font-size: var(--btn-font-size, 14px);
    font-weight: var(--btn-font-weight, 500);
    font-family: var(--btn-font-family, inherit);
    line-height: 1.4;
    letter-spacing: var(--btn-letter-spacing, 0.02em);
    text-transform: var(--btn-text-transform, none);
    border: var(--btn-border-width, 0px) solid var(--btn-border-color, transparent);
    box-shadow: var(--btn-shadow, 0 2px 12px rgba(79, 106, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1));
    cursor: var(--btn-cursor, pointer);
    user-select: none;
    transition: box-shadow 0.2s ease, transform 0.15s ease, background 0.2s ease, opacity 0.15s ease;
    -webkit-font-smoothing: antialiased;
    outline: none;
}

/* ── Default hover: brightness filter — clean on gradients, no color veil ── */
.elem-btn:not(.elem-btn--editing):hover { filter: brightness(0.9); }
.elem-btn:not(.elem-btn--editing):active { transform: translateY(1px) scale(0.98); filter: brightness(0.82); }

/* ── Hover: lift ────────────────────────────────────────────────── */
.elem-btn--hover-lift:not(.elem-btn--editing):hover {
    filter: none;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18), 0 3px 8px rgba(0, 0, 0, 0.1);
}
.elem-btn--hover-lift:not(.elem-btn--editing):active { transform: translateY(0) scale(0.98); }

/* ── Hover: glow ────────────────────────────────────────────────── */
.elem-btn--hover-glow:not(.elem-btn--editing):hover {
    filter: none;
    box-shadow: 0 0 0 3px rgba(79, 106, 255, 0.25), 0 0 24px rgba(79, 106, 255, 0.5);
    transform: none;
}

/* ── Hover: scale ───────────────────────────────────────────────── */
.elem-btn--hover-scale:not(.elem-btn--editing):hover { filter: none; transform: scale(1.05); }
.elem-btn--hover-scale:not(.elem-btn--editing):active { transform: scale(0.97); }

/* ── Hover: pulse (idle animation) ─────────────────────────────── */
.elem-btn--hover-pulse:not(.elem-btn--editing) { animation: elem-btn-pulse 2s ease-in-out infinite; }
.elem-btn--hover-pulse:not(.elem-btn--editing):hover { filter: none; animation: none; transform: scale(1.03); }

/* ── Hover: none ────────────────────────────────────────────────── */
.elem-btn--hover-none:not(.elem-btn--editing):hover,
.elem-btn--hover-none:not(.elem-btn--editing):active {
    filter: none;
    transform: none;
    box-shadow: var(--btn-shadow);
}

/* ── Editor mode: cursor reset ──────────────────────────────────── */
.elem-btn--editing { cursor: default; }

/* ── Editor mode: «открыть ссылку» — появляется при наведении ───── */
.elem-btn__open-link {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid #cbd5e1;
    border-radius: 50%;
    background: #ffffff;
    color: #4f6aff;
    font-size: 12px;
    line-height: 1;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease;
}
.elem-btn--editing:hover .elem-btn__open-link,
.elem-btn__open-link:focus-visible { opacity: 1; }
.elem-btn__open-link:hover { background: #eef2ff; }

/* ── Glass variant ──────────────────────────────────────────────── */
.elem-btn--glass {
    background: rgba(255, 255, 255, 0.12) !important;
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.22) !important;
}

/* ── Loading state ──────────────────────────────────────────────── */
.elem-btn--loading {
    cursor: wait;
    pointer-events: none;
    opacity: 0.8;
}

/* ── Disabled state ─────────────────────────────────────────────── */
.elem-btn--disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
}

/* ── Icons ──────────────────────────────────────────────────────── */
.elem-btn__icon {
    font-size: inherit;
    line-height: 1;
    flex-shrink: 0;
}
.elem-btn__icon--left { margin-right: 6px; }
.elem-btn__icon--right { margin-left: 6px; }
/* In icon-only mode (no text) remove directional margins so icon stays centred */
.elem-btn--icon-only .elem-btn__icon--left,
.elem-btn--icon-only .elem-btn__icon--right { margin: 0; }

/* ── Spinner ────────────────────────────────────────────────────── */
.elem-btn__spinner {
    display: inline-block;
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: elem-btn-spin 0.65s linear infinite;
    margin-right: 8px;
}

/* ── Toast ──────────────────────────────────────────────────────── */
.elem-btn__toast {
    padding: 4px 10px;
    font-size: 13px;
    white-space: nowrap;
    line-height: 1.4;
}

/* ── Keyframes ──────────────────────────────────────────────────── */
@keyframes elem-btn-spin {
    to { transform: rotate(360deg); }
}

@keyframes elem-btn-pulse {
    0%, 100% { box-shadow: var(--btn-shadow, 0 2px 12px rgba(79, 106, 255, 0.3)); }
    50% { box-shadow: 0 0 0 6px rgba(79, 106, 255, 0), 0 0 20px rgba(79, 106, 255, 0.5); }
}

/* ── Button props row inside Tiptap toolbar ─────────────────────── */
/* ::v-deep needed — slot content doesn't inherit this component's scope attr */

.elem-btn__label-editor ::v-deep .tiptap-toolbar__label {
    font-size: 10px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0 2px;
    white-space: nowrap;
}

/* Color dots */
.elem-btn__label-editor ::v-deep .cbar__dot {
    width: 16px;
    min-width: 16px;
    max-width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: transform 0.1s, border-color 0.1s;
    padding: 0;
    flex: 0 0 16px;
    box-sizing: border-box;
}
.elem-btn__label-editor ::v-deep .cbar__dot:hover {
    transform: scale(1.25);
    border-color: rgba(0, 0, 0, 0.4);
}
.elem-btn__label-editor ::v-deep .cbar__dot--active {
    border-color: #1976d2;
    transform: scale(1.15);
    outline: 2px solid #1976d2;
    outline-offset: 1px;
}

/* Size chips */
.elem-btn__label-editor ::v-deep .cbar__size {
    padding: 2px 7px;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: transparent;
    color: #555;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
    letter-spacing: 0.04em;
}
.elem-btn__label-editor ::v-deep .cbar__size:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #111;
    border-color: rgba(0, 0, 0, 0.3);
}
.elem-btn__label-editor ::v-deep .cbar__size--active {
    background: #1976d2;
    color: #fff;
    border-color: #1976d2;
}

/* ── Static button text (view mode) ─────────────────────────── */
.elem-btn__text {
    white-space: nowrap;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;

    /* Strip paragraph margin injected by TiptapEditor HTML */
    ::v-deep p { display: inline; margin: 0; padding: 0; }
}

/* ── TiptapEditor inside button (editor mode) ────────────────── */
.elem-btn__label-editor {
    /* Transparent, inherits button layout */
    display: contents;
}

.elem-btn__label-editor ::v-deep .tiptap-editor {
    background: transparent;
    display: contents;
}

.elem-btn__label-editor ::v-deep .ProseMirror {
    outline: none;
    padding: 0;
    margin: 0;
    min-width: 1ch;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    text-align: inherit;
    white-space: nowrap;
    background: transparent;

    /* Single-line look */
    p { display: inline; margin: 0; padding: 0; }
}

/* Toolbar floats above button (already position:absolute bottom:100% in TiptapEditor) */
.elem-btn__label-editor ::v-deep .tiptap-toolbar {
    left: 50%;
    transform: translateX(-50%);
}
</style>
