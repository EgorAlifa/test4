<template>
    <div v-if="props.isClickSelf" class="btn" :class="cssClass" :style="cssStyle" @click.self="onClick">
        <slot>
            <code v-if="isEditorMode">default slot</code>
        </slot>
    </div>
    <div v-else class="btn" :class="cssClass" :style="cssStyle" @click="onClick">
        <slot>
            <code v-if="isEditorMode">default slot</code>
        </slot>
        <ui-popover v-bind="popoverOptions" :show.sync="isPopupVisible">
            <div class="tooltip">{{ popupText }}</div>
        </ui-popover>
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
        /**
         * @return {string[]}
         */
        eventName() {
            const {
                props: {
                    eventName: { getCompat }
                }
            } = this.descriptor;

            return getCompat(this.props.eventName);
        },
        /**
         * @return {string[]}
         */
        cutParams() {
            const {
                props: {
                    cutParams: { getCompat }
                }
            } = this.descriptor;

            return getCompat(this.props.cutParams);
        }
    },
    methods: {
        /**
         * @param {import('./descriptor').FilterItem[]} filters
         */
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

            if ([null, undefined, ''].includes(url)) {
                return;
            }

            const urlModel = Url.create(url);
            const urlProtocol = urlModel.protocol ?? '';
            const queryParams = this.buildNavigateQueryParams();
            // URL.protocol is a string including the final ":"
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
                {
                    url: urlModel.href,
                    route: {
                        path,
                        query: { ...query, ...queryParams }
                    }
                },
                { isNewWindow: isTargetBlank }
            );
        },
        saveUrlInStorage() {
            const { isSaveUrlForStore, url } = this.props;

            if (isSaveUrlForStore) {
                this.$storeCommit({
                    [Vars.ROUTE]: url
                });
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

            if (isCopyStore) {
                executeMethods.push(this.copySerializedStoreUrlToClipboard);
            }

            if (shouldCopyText) {
                executeMethods.push(this.copyTextToClipboard);
            }

            executeMethods.forEach((handler) => handler.call(this));
        },

        copySerializedStoreUrlToClipboard() {
            const url = buildSerializedStoreUrl(window.location.href, store.state);
            navigator.clipboard.writeText(url).then(() => {
                this.showPopup('Ссылка скопирована');
            });
        },

        copyTextToClipboard() {
            const { textToCopy } = this.props;

            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showPopup('Текст скопирован');
            });
        },

        showPopup(text) {
            this.isPopupVisible = true;
            this.popupText = text;
            setTimeout(() => {
                this.isPopupVisible = false;
            }, POPUP_LIFETIME);
        },

        addRouteQueryParams() {
            const { routeQueryParamNames } = this.props;

            if (routeQueryParamNames.length === 0) {
                return;
            }

            const queryParams = routeQueryParamNames.reduce(
                (acc, param) => ({ ...acc, [param.label]: param.value }),
                {}
            );

            addRouteQueryParams(queryParams);
        },

        buildNavigateQueryParams() {
            const { urlFilters } = this.props;

            if (urlFilters.length === 0) {
                return '';
            }

            const { state } = store;

            return urlFilters
                .filter(({ name }) => [null, undefined, ''].includes(state[name]?.value) === false)
                .reduce(
                    (acc, { name }) => ({
                        ...acc,
                        [name]: state[name].value
                    }),
                    {}
                );
        }
    }
};
</script>
