<template>
    <div
        v-if="props.isClickSelf"
        class="elem-btn"
        :class="cssClass"
        :style="[cssStyle, buttonStyle]"
        @click.self="onClick">
        <slot />
        <component v-if="customCssContent" :is="'style'" v-html="customCssContent" />
    </div>
    <div
        v-else
        class="elem-btn"
        :class="cssClass"
        :style="[cssStyle, buttonStyle]"
        @click="onClick">
        <slot />
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
        ...ComponentInstanceTypeDescriptor
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
        buttonStyle() {
            const {
                btnBg, btnColor, btnBorderRadius, btnFontSize, btnFontWeight,
                btnPaddingV, btnPaddingH, btnShadow, btnBorderWidth, btnBorderColor
            } = this.props;
            return {
                '--btn-bg': btnBg,
                '--btn-color': btnColor,
                '--btn-border-radius': btnBorderRadius,
                '--btn-font-size': btnFontSize,
                '--btn-font-weight': btnFontWeight,
                '--btn-padding-v': btnPaddingV,
                '--btn-padding-h': btnPaddingH,
                '--btn-shadow': btnShadow,
                '--btn-border-width': btnBorderWidth,
                '--btn-border-color': btnBorderColor
            };
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
        }
    },
    methods: {
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
                navigate({ route: { path, query: { ...query, ...queryParams } } }, { isNewWindow: isTargetBlank });
                return;
            }

            if (urlModel.isAbsolute) {
                const target = isTargetBlank === true ? '_blank' : '_self';
                window.open(Url.create({ href: url, query: queryParams }), target);
                return;
            }

            const { path, query } = Url.create(urlModel.hash.replace('#', ''));
            urlModel.hash = '';
            navigate(
                { url: urlModel.href, route: { path, query: { ...query, ...queryParams } } },
                { isNewWindow: isTargetBlank }
            );
        },
        saveUrlInStorage() {
            if (this.props.isSaveUrlForStore) {
                this.$storeCommit({ [Vars.ROUTE]: this.props.url });
            }
        },
        onClick() {
            const { isCopyStore, shouldCopyText } = this.props;
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
    line-height: 1.4;
    letter-spacing: 0.02em;
    border: var(--btn-border-width, 0px) solid var(--btn-border-color, transparent);
    box-shadow: var(--btn-shadow, 0 2px 12px rgba(79, 106, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1));
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    transition: box-shadow 0.2s ease, transform 0.12s ease, background 0.15s ease;
    -webkit-font-smoothing: antialiased;
    outline: none;
}

.elem-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
}

.elem-btn:hover::before {
    opacity: 0.1;
}

.elem-btn:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: var(--btn-shadow, 0 1px 5px rgba(79, 106, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.08));
}

.elem-btn:active::before {
    opacity: 0.15;
}

.elem-btn__toast {
    padding: 4px 10px;
    font-size: 13px;
    white-space: nowrap;
    line-height: 1.4;
}
</style>
