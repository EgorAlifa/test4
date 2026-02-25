<template>
    <w-elem :placeholder="$placeholder">
        <div
            class="elem-btn"
            :class="buttonDynamicClass"
            :style="buttonStyle"
            @click="handleClick">
            <span v-if="isLoading" class="elem-btn__spinner" />
            <i
                v-if="props.btnIconLeft && !isLoading"
                :class="props.btnIconLeft"
                class="elem-btn__icon elem-btn__icon--left" />
            <slot>{{ props.btnShowText !== false ? props.btnText : '' }}</slot>
            <i
                v-if="props.btnIconRight"
                :class="props.btnIconRight"
                class="elem-btn__icon elem-btn__icon--right" />
            <ui-popover v-bind="popoverOptions" :show.sync="isPopupVisible">
                <div class="elem-btn__toast">{{ popupText }}</div>
            </ui-popover>
            <component v-if="customCssContent" :is="'style'" v-html="customCssContent" />

            <!-- ── Canvas quick-edit bar (editor only) ──────────────────── -->
            <div v-if="isEditorMode" class="elem-btn__canvas-bar" @click.stop @mousedown.stop>
                <div class="cbar__section">
                    <button
                        v-for="color in canvasQuickColors"
                        :key="color"
                        class="cbar__dot"
                        :class="{ 'cbar__dot--active': props.btnBg === color }"
                        :style="{ background: color }"
                        :title="color"
                        @click="setCanvasColor(color)" />
                </div>
                <div class="cbar__sep" />
                <div class="cbar__section">
                    <button
                        v-for="s in canvasSizes"
                        :key="s.key"
                        class="cbar__size"
                        :class="{ 'cbar__size--active': canvasCurrentSize === s.key }"
                        @click="setCanvasSize(s)">
                        {{ s.key }}
                    </button>
                </div>
            </div>
        </div>
    </w-elem>
</template>

<script>
/**
 * @typedef {import('./ElemButton').IComponentOptions} IComponentOptions
 * @typedef {import('./ElemButton').IInstance} IInstance
 */
import { Elem, Managers } from 'goodt-wcore';
import { Url } from '@goodt-common/utils';
import { useRouteQueryManager, useNavigate } from '@goodt-wcore/utils';
import { Popover } from 'goodteditor-ui';
import { POPUP_LIFETIME } from './constants';
import { buildSerializedStoreUrl } from './utils';
import { meta, Vars } from './descriptor';

const { store, ValueObject } = Managers.StoreManager;
const { addRouteQueryParams } = useRouteQueryManager();
const { navigate } = useNavigate();

/**
 * @typedef {import('./types').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;

export default {
    extends: Elem,
    meta,
    components: { UiPopover: Popover },
    data: () => ({
        isPopupVisible: false,
        popupText: '',
        isLoading: false,
        ...ComponentInstanceTypeDescriptor,
        canvasQuickColors: ['#4f6aff', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#0f172a', '#ffffff'],
        canvasSizes: [
            { key: 'S', paddingV: '6px',  paddingH: '14px', fontSize: '12px' },
            { key: 'M', paddingV: '10px', paddingH: '20px', fontSize: '14px' },
            { key: 'L', paddingV: '14px', paddingH: '28px', fontSize: '16px' }
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
            const { btnHoverEffect, btnIsGlass, btnShowText, btnIconLeft, btnIconRight } = this.props;
            return {
                [`elem-btn--hover-${btnHoverEffect}`]: btnHoverEffect && btnHoverEffect !== 'default',
                'elem-btn--loading': this.isLoading,
                'elem-btn--toggle-active': this.isToggleActive,
                'elem-btn--glass': btnIsGlass,
                'elem-btn--disabled': this.isDisabled,
                'elem-btn--icon-only': btnShowText === false && !this.isLoading && (btnIconLeft || btnIconRight)
            };
        },
        buttonStyle() {
            const {
                btnBg, btnColor, btnBorderRadius, btnFontSize, btnFontWeight,
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
            if (v === '6px') return 'S';
            if (v === '14px') return 'L';
            return 'M';
        }
    },
    methods: {
        handleClick(event) {
            if (this.isDisabled || this.isLoading) return;
            if (this.props.isClickSelf && event.target !== event.currentTarget) return;
            this.onClick();
        },
        buildStateFromFilters(filters) {
            return filters.reduce(
                (acc, { name, data }) => ({ ...acc, [name]: new ValueObject(data, store.state[name]?.meta) }),
                {}
            );
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
        navigateUrl() {
            const allowedProtocols = ['http', 'https'];
            const { url, isTargetBlank } = this.props;

            if ([null, undefined, ''].includes(url)) return;

            const urlModel = Url.create(url);
            const urlProtocol = urlModel.protocol ?? '';
            const queryParams = this.buildNavigateQueryParams();

            if (
                allowedProtocols.some((protocol) => urlProtocol.includes(protocol)) === false &&
                !urlModel.isRelative
            ) {
                return;
            }

            if (urlModel.isRelative && urlModel.hash === '') {
                const { path, query } = urlModel;
                if (Managers.RouteManager?.instance?.route?.path === path) return;
                // Preserve the full base URL by changing only the hash portion.
                // navigate() may resolve paths relative to router base (/#/…) which
                // strips the real page base (e.g. /insight-dev/editor/player/3417/).
                if (isTargetBlank) {
                    const base = window.location.href.split('#')[0];
                    window.open(`${base}#${path}`, '_blank');
                } else {
                    window.location.hash = path;
                }
                return;
            }

            if (urlModel.isAbsolute) {
                const target = isTargetBlank === true ? '_blank' : '_self';
                window.open(Url.create({ href: url, query: queryParams }), target);
                return;
            }

            const { path, query } = Url.create(urlModel.hash.replace('#', ''));
            urlModel.hash = '';
            if (Managers.RouteManager?.instance?.route?.path !== path) {
                navigate(
                    { url: urlModel.href, route: { path, query: { ...query, ...queryParams } } },
                    { isNewWindow: isTargetBlank }
                );
            }
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
            const { isCopyStore, shouldCopyText } = this.props;

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

            executeMethods.forEach((handler) => handler.call(this));
        },
        copySerializedStoreUrlToClipboard() {
            const url = buildSerializedStoreUrl(window.location.href, store.state);
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
        /** Canvas bar: set background color */
        setCanvasColor(color) {
            this.props.btnBg = color;
        },
        /** Canvas bar: set S/M/L size */
        setCanvasSize(s) {
            this.props.btnPaddingV = s.paddingV;
            this.props.btnPaddingH = s.paddingH;
            this.props.btnFontSize = s.fontSize;
        },
        buildNavigateQueryParams() {
            const { urlFilters } = this.props;
            if (urlFilters.length === 0) return '';
            const { state } = store;
            return urlFilters
                .filter(({ name }) => [null, undefined, ''].includes(state[name]?.value) === false)
                .reduce((acc, { name }) => ({ ...acc, [name]: state[name].value }), {});
        }
    }
};
</script>

<style scoped>
.elem-btn {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: var(--btn-height, 40px);
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: var(--btn-padding-v, 10px) var(--btn-padding-h, 20px);
    border-radius: var(--btn-border-radius, 8px);
    background: var(--btn-bg, #4f6aff);
    color: var(--btn-color, #fff);
    font-size: var(--btn-font-size, 14px);
    font-weight: var(--btn-font-weight, 500);
    line-height: 1.4;
    letter-spacing: 0.02em;
    border: var(--btn-border-width, 0px) solid var(--btn-border-color, transparent);
    box-shadow: var(--btn-shadow, 0 2px 12px rgba(79, 106, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1));
    cursor: var(--btn-cursor, pointer);
    user-select: none;
    transition: box-shadow 0.2s ease, transform 0.15s ease, background 0.2s ease, opacity 0.15s ease;
    -webkit-font-smoothing: antialiased;
    outline: none;
}

/* ── Default hover: brightness filter — clean on gradients, no color veil ── */
.elem-btn:hover { filter: brightness(0.9); }
.elem-btn:active { transform: translateY(1px) scale(0.98); filter: brightness(0.82); }

/* ── Hover: lift ────────────────────────────────────────────────── */
.elem-btn--hover-lift:hover {
    filter: none;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18), 0 3px 8px rgba(0, 0, 0, 0.1);
}
.elem-btn--hover-lift:active { transform: translateY(0) scale(0.98); }

/* ── Hover: glow ────────────────────────────────────────────────── */
.elem-btn--hover-glow:hover {
    filter: none;
    box-shadow: 0 0 0 3px rgba(79, 106, 255, 0.25), 0 0 24px rgba(79, 106, 255, 0.5);
    transform: none;
}

/* ── Hover: scale ───────────────────────────────────────────────── */
.elem-btn--hover-scale:hover { filter: none; transform: scale(1.05); }
.elem-btn--hover-scale:active { transform: scale(0.97); }

/* ── Hover: pulse (idle animation) ─────────────────────────────── */
.elem-btn--hover-pulse { animation: elem-btn-pulse 2s ease-in-out infinite; }
.elem-btn--hover-pulse:hover { filter: none; animation: none; transform: scale(1.03); }

/* ── Hover: none ────────────────────────────────────────────────── */
.elem-btn--hover-none:hover,
.elem-btn--hover-none:active {
    filter: none;
    transform: none;
    box-shadow: var(--btn-shadow);
}

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

/* ── Canvas quick-edit bar ──────────────────────────────────────── */

/* Bridge the gap so cursor doesn't lose hover moving button→bar */
.elem-btn::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    height: 16px;
    pointer-events: none;
}
.elem-btn:hover::after {
    pointer-events: auto;
}

.elem-btn__canvas-bar {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    background: #1e293b;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease, transform 0.18s ease;
    z-index: 9999;
    white-space: nowrap;
}

.elem-btn:hover .elem-btn__canvas-bar,
.elem-btn__canvas-bar:hover {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
}

.cbar__section {
    display: flex;
    align-items: center;
    gap: 4px;
}

.cbar__sep {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
    margin: 0 2px;
}

/* Color dots */
.cbar__dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: transform 0.1s, border-color 0.1s;
    padding: 0;
    flex-shrink: 0;
}
.cbar__dot:hover { transform: scale(1.25); border-color: rgba(255, 255, 255, 0.6); }
.cbar__dot--active { border-color: #fff; transform: scale(1.15); }

/* Size chips */
.cbar__size {
    padding: 2px 7px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
    letter-spacing: 0.04em;
}
.cbar__size:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.4);
}
.cbar__size--active {
    background: #4f6aff;
    color: #fff;
    border-color: #4f6aff;
}
</style>
