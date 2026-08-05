<template>
    <w-elem :placeholder="$placeholder">
        <div class="svg-container">
            <div v-if="isBusy" class="text-center">
                <div class="preloader"></div>
            </div>
            <div v-else-if="svgError && isEditorMode === false" class="alert d-flex flex-center w-100 h-100">
                <div class="alert-body d-flex flex-col flex-center gap-2">
                    <div class="icon">
                        <i class="mdi mdi-36px mdi-alert-circle-outline"></i>
                    </div>
                    <div class="text-xl font-medium mar-top-l2">SVG недоступен</div>
                    <div class="w-f4 text-center">
                        <div>{{ svgError.message }}</div>
                        <div>"{{ props.svg }}"</div>
                    </div>
                </div>
            </div>
            <w-tooltip :is-shown.sync="tooltip.isShown" v-bind="tooltip.options">
                <template #target>
                    <div
                        ref="svg-container"
                        class="pos-abs w-100 h-100 transition-none"
                        :class="!isBusy ? 'opacity-100' : 'opacity-0'"></div>
                </template>
                <template #tooltip>
                    <div
                        v-if="props.customTooltip.isSlotShown"
                        data-slot="tooltip"
                        @mouseenter="tooltip.options.isShown = true">
                        <slot name="tooltip">
                            <div class="radius-1 pad-l1 bg-muted">
                                <code class="text-small">Tooltip slot</code>
                            </div>
                        </slot>
                    </div>
                </template>
            </w-tooltip>
        </div>
    </w-elem>
</template>
<script>
import { throttle, isEmpty } from 'lodash';
import { Elem, ElemPlaceholderReasonType } from '@goodt-wcore/elem';
import { widget } from '@goodt-wcore/utils';
import { useElemDatasetMixin, ElemDatasetMixinTypes, ElemDatasetPlaceholderDefinition } from '@goodt-common/data';
import { Tooltip as WTooltip } from '@goodt-wcore/components';
import { Events, meta, Vars } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { SvgViewModel } from './application';
import { REQUEST_ANIMATION_TIMEOUT } from './constants';

/**
 * @param {string} svgText
 */
const validateSvg = (svgText) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        throw new Error('Содержимое не является SVG-изображением');
    }
};

export default {
    meta,
    extends: Elem,
    components: { WTooltip },
    mixins: [useElemDatasetMixin()],
    static: { isEmpty },
    data: () => ({
        svgViewModel: null,
        svgElement: null,
        nodesOptions: [],
        isSvgLoading: false,
        tooltip: {
            options: {
                appendToBody: false,
                data: null,
                coordinates: [0, 0],
                isFixed: false
            },
            isShown: false
        },
        svgError: null,
        /* Vetur HACK */
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes
    }),
    computedEditor: {
        $placeholder() {
            const {
                props: { svg },
                hasDataset,
                svgError
            } = this;

            if (!hasDataset) {
                return ElemDatasetPlaceholderDefinition;
            }
            if (isEmpty(svg) || svgError != null) {
                return {
                    toggle: true,
                    show: true,
                    content: svgError == null ? 'Добавьте SVG' : 'SVG недоступен',
                    reason: {
                        type: ElemPlaceholderReasonType.CUSTOM,
                        description:
                            svgError == null
                                ? 'Задайте SVG через панель "Настройки объектов"'
                                : `${svgError.message}: "${svg}"`,
                        actions: [
                            {
                                title: svgError == null ? 'Добавить SVG' : 'Изменить SVG',
                                icon: 'arrange-bring-to-front',
                                panel: 'ObjectSettingsPanel'
                            }
                        ]
                    }
                };
            }
            return false;
        }
    },
    computed: {
        isBusy() {
            return this.isLoading || this.isSvgLoading;
        }
    },
    watchEditor: {
        props: {
            handler() {
                this.updateSVG();
            },
            deep: true
        },
        'props.svg': {
            handler(svgUrl, oldSvgUrl) {
                if (svgUrl !== oldSvgUrl) {
                    this.fetchSvgUrl();
                }
            }
        }
    },
    watch: {
        result: {
            handler() {
                this.updateSVG();
            }
        }
    },
    watchStore: [
        {
            vars: [Vars.SELECT_OBJECT_BY_ID],
            handler([objectId]) {
                if (this.svgElement == null) {
                    return;
                }

                if (objectId == null) {
                    this.svgViewModel.resetSelectedNode();
                    return;
                }

                const foundElement = this.svgElement.querySelector(`[data-id='${objectId}']`);
                if (foundElement != null) {
                    foundElement.dispatchEvent(new Event('select'));
                }
            }
        }
    ],
    mounted() {
        this.fetchSvgUrl();
    },
    beforeDestroy() {
        this.reset();
    },
    methods: {
        async fetchSvgUrl() {
            const { props } = this;

            this.reset();
            if (isEmpty(props.svg)) {
                return;
            }

            this.isSvgLoading = true;

            try {
                const response = await fetch(props.svg);
                if (response.ok !== true) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const svgText = await response.text();
                this.svgError = this.validateSvg(svgText);
                if (this.svgError == null) {
                    this.onLoaded(svgText);
                }
            } catch (error) {
                this.handleError(error);
                this.svgError = new Error(`Ошибка загрузки SVG-источника`);
            } finally {
                this.isSvgLoading = false;
            }
        },
        updateSVG() {
            const { svgViewModel, result } = this;
            if (isEmpty(result) || svgViewModel == null) {
                return;
            }
            this.isSvgLoading = true;
            svgViewModel.setWidget(widget(this));
            svgViewModel.updateSvg(result);
            this.addEventsListeners();
            this.isSvgLoading = false;
        },
        reset() {
            this.svgError = null;
            this.nodesOptions = [];
            const {
                svgElement,
                svgViewModel,
                props: { nodes }
            } = this;
            if (svgElement?.getElementById != null) {
                nodes.forEach(({ id }) => {
                    const element = svgElement.getElementById(id);
                    if (element == null) {
                        return;
                    }

                    element.remove();
                });
            }

            if (svgViewModel != null) {
                svgViewModel.textNodes.forEach((element) => {
                    element.remove();
                });
            }

            const { 'svg-container': svgContainer } = this.$refs;
            if (svgContainer != null) {
                svgContainer.innerHTML = '';
            }
        },
        /**
         * @param {string} svgText
         * @return {Error|null}
         */
        validateSvg(svgText) {
            try {
                validateSvg(svgText);
                return null;
            } catch (error) {
                return error;
            }
        },
        /**
         * @param {string} svgText
         */
        onLoaded(svgText) {
            const { 'svg-container': svgContainer } = this.$refs;
            svgContainer.innerHTML = svgText;
            this.svgElement = svgContainer.firstElementChild;
            this.svgElement.setAttribute('width', '100%');
            this.svgElement.setAttribute('height', '100%');
            this.svgViewModel = new SvgViewModel({ svgElement: this.svgElement, widget: widget(this) });
            this.nodesOptions = this.svgViewModel.buildNodeOptions();

            if (isEmpty(this.result)) {
                return;
            }

            this.svgViewModel.updateSvg(this.result);
            this.addEventsListeners();
        },
        addEventsListeners() {
            const { svgElement, svgViewModel, result, props } = this;
            const { nodes, fields } = props;
            const { metricId } = fields;
            nodes.forEach(({ id, isVisible }) => {
                const element = svgElement?.getElementById(id);
                if (element == null || element.style == null || !isVisible) {
                    return;
                }

                const row = result.rows.find(({ [metricId]: rowId }) => rowId === element.getAttribute('data-id'));
                this.addEventListeners({ target: element, element, row });
                const textNode = svgViewModel.textNodes.find((node) => node.id === element.getAttribute('data-id'));
                if (textNode == null) {
                    return;
                }

                this.addEventListeners({ target: textNode, element, row });
            });
        },
        addEventListeners({ target, element, row }) {
            target.addEventListener('mouseenter', () => {
                this.onElementEnter({ element, row });
            });
            target.addEventListener('mouseleave', () => {
                this.onElementLeave({ row, shouldChangeStyle: false });
            });
            target.addEventListener('select', () => {
                this.onElementClick({ row, element, withNavigate: false, withoutHover: true });
            });
            target.addEventListener('click', () => {
                this.onElementClick({ row, element });
            });

            this.addTooltipListeners({ target, row });
        },
        addTooltipListeners({ target, row }) {
            const { isEnabled, shouldFollowPointer } = this.props.customTooltip;
            if (row == null || isEnabled === false) {
                return;
            }

            target.addEventListener('mouseover', (event) => {
                this.onMouseOver({ event, row });
            });
            target.addEventListener('mouseout', this.onMouseOut);
            if (shouldFollowPointer === false) {
                return;
            }

            const onMouseMoveThrottled = throttle(this.onMouseMove, REQUEST_ANIMATION_TIMEOUT);
            target.addEventListener('mousemove', onMouseMoveThrottled);
        },
        onMouseMove(event) {
            const { options } = this.tooltip;

            if (options.isFixed) {
                return;
            }

            const { clientX, clientY } = event;
            this.tooltip.options = {
                ...options,
                coordinates: [clientX, clientY]
            };
        },
        onMouseOut(event) {
            const { isFixed } = this.tooltip.options;

            if (isFixed) {
                return;
            }

            const { shouldRespondToPointerEvents } = this.props.customTooltip;

            if (shouldRespondToPointerEvents === false) {
                this.tooltip.isShown = false;
                return;
            }

            const { relatedTarget } = event;

            if (relatedTarget == null) {
                this.tooltip.isShown = false;
            }
        },
        onMouseOver({ event, row }) {
            const {
                tooltip: { options, isShown }
            } = this;
            if (options.isFixed && isShown) {
                return;
            }
            const { clientX, clientY } = event;
            this.tooltip.options = {
                ...options,
                coordinates: [clientX, clientY],
                data: row
            };
            this.tooltip.isShown = true;
        },
        onElementClick({ row, element, withNavigate = true, withoutHover = false }) {
            const { isEnabled } = this.props.selectSettings;
            if (isEnabled) {
                this.setSelectedNode({ row, element, withoutHover });
            }

            if (row == null) {
                return;
            }

            const {
                fields: { metricByClick },
                resetStoreVariables,
                routeUrl
            } = this.props;
            const eventName = row[metricByClick];
            const store =
                this.svgViewModel.selectedNode == null && isEnabled && resetStoreVariables
                    ? Object.keys(row).reduce((acc, key) => ({ ...acc, [key]: null }), {})
                    : row;

            this.$storeCommit(store);

            if (eventName != null && this.svgViewModel.selectedNode != null) {
                this.$eventTrigger(row[metricByClick]);
            }

            if (this.svgViewModel.selectedNode == null) {
                this.$eventTrigger(Events.UNSELECT_OBJECT);
            }

            if (routeUrl !== '' && withNavigate) {
                this.$routeNavigate({ path: routeUrl });
            }
        },

        onElementEnter({ row, element, shouldChangeStyle = false }) {
            const { shouldHoverAllElements, shouldUseSettings } = this.props.hoverSettings;
            if (
                (!shouldHoverAllElements && row == null) ||
                !shouldUseSettings ||
                (this.svgViewModel.selectedNode != null && !shouldChangeStyle)
            ) {
                return;
            }

            this.svgViewModel.onElementEnter({ element, settings: this.props.hoverSettings });
        },
        onElementLeave({ row, shouldChangeStyle = false }) {
            const { shouldHoverAllElements, shouldUseSettings } = this.props.hoverSettings;
            if (
                (!shouldHoverAllElements && row == null) ||
                !shouldUseSettings ||
                (this.svgViewModel.selectedNode != null && !shouldChangeStyle)
            ) {
                return;
            }

            this.svgViewModel.onElementLeave();
        },
        setSelectedNode({ row, element, withoutHover = false }) {
            const { shouldSelectAllElements } = this.props.selectSettings;
            if (!shouldSelectAllElements && row == null) {
                return;
            }

            if (this.svgViewModel.selectedNode != null && this.svgViewModel.selectedNode === element.id) {
                this.svgViewModel.resetSelectedNode();
                return;
            }

            if (this.svgViewModel.selectedNode != null && !withoutHover) {
                this.onElementLeave({ row, shouldChangeStyle: true });
                this.onElementEnter({ row, element, shouldChangeStyle: true });
            }

            this.svgViewModel.selectNewNode({ element, settings: this.props.selectSettings });
        }
    },
    implicitCssModule: true
};
</script>

<style module src="./style.pcss" lang="pcss"></style>
