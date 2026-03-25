import { Url } from '@goodt-common/utils';
import { Query } from '@goodt-common/dremio';
import { TooltipFactory } from '../utils/constants';

export default {
    inject: ['cssStrToObj', '$widget'],
    props: {
        queryHelper: {
            type: Object,
            default: null,
            private: true
        },
        queryLoadData: {
            type: Function,
            default: () => {},
            private: true
        },
        drilldown: {
            type: Object
        },
        tooltip: {
            type: Object,
            default: () => TooltipFactory(),
            private: true
        },
        canSelect: {
            type: Object
        },
        canRowToggleItself: {
            type: Boolean,
            private: true
        },
        rowIndex: {
            type: Number,
            default: 0,
            private: true
        },
        queryOffset: {
            type: Number,
            default: 0,
            private: true
        }
    },
    computed: {
        $storeCommit() {
          return this.$widget.storeCommit;
        },
        $routeNavigate() {
          return this.$widget.routeNavigate;
        },
        $eventListen() {
            return this.$widget.eventListen;
        },
        $eventTrigger() {
            return this.$widget.eventTrigger;
        },
        $eventBus() {
          return this.$widget.eventBus;
        },
        canDrilldown() {
            const { drilldown } = this;
            return drilldown && this.isDimension(drilldown.name) && this.canGoNextDimension(drilldown.name);
        },
        canCollapseExpandRow() {
            return this.canSelect ? this.canSelect.value === true : false;
        },
        cellCssClass() {
            const obj = {};
            if (this.canDrilldown || this.canRowToggleItself || this.canCollapseExpandRow) {
                obj['cursor-pointer'] = true;
                obj['u-select-none'] = true;
            }
            return obj;
        },
        cellEventHandlers() {
            const { canDrilldown, drilldown } = this;
            const obj = { click: this.clickHandler };
            if (canDrilldown) {
                obj.click = () => {
                    this.goNextDimension(drilldown.name, drilldown.value);
                    this.clickHandler();
                };
            }
            return obj;
        },
        tooltipOpts() {
            const { position, hideDelay, offsetX, offsetY, appendToBody } = this.tooltip;
            return {
                position,
                positionOffset: [offsetX, offsetY],
                hideDelay,
                appendToBody
            };
        },
        tooltipStyle() {
            return this.cssStrToObj(this.tooltip.style);
        }
    },
    methods: {
        isDimension(value) {
            return this.queryHelper ? this.queryHelper.dimensionStateExists(value) : false;
        },
        canGoNextDimension(dimensionName) {
            return this.queryHelper ? !this.queryHelper.dimensionStateIsLast(dimensionName) : false;
        },
        goNextDimension(dimensionName, value) {
            if (!this.queryHelper || !this.queryLoadData) {
                return;
            }
            this.queryHelper.dimensionStateGoNext(dimensionName, [value], Query.FILTER_TYPE.EQ);
            this.queryLoadData();
        },
        onRowMouseEvent(e) {
            return true;
        },
        clickHandler() {
            if (this.canRowToggleItself || this.canCollapseExpandRow) {
                this.$emit('click');
            }
        },
        navigate({ path = '', query }, shouldOpenNewTab = false) {
            const [pathBeforeHash, pathAfterHash = ''] = path?.split('#');

            const options = pathAfterHash.startsWith('/')
                ? { hash: Url.create({ href: pathAfterHash, query }).toString() }
                : { hash: pathAfterHash, query };

            const url = Url.create({
                href: pathBeforeHash,
                ...options
            });

            // case '/some-path/#/route-path?id=1'
            if (url.isRelative && pathAfterHash.startsWith('/')) {
                // make url absolute
                url.host = window.location.host;
                url.protocol = window.location.protocol;
            }

            if (url.isAbsolute) {
                const target = shouldOpenNewTab === true ? '_blank' : '_self';
                const opened = window.open(url, target, 'noopener,noreferrer');
                // https://cwe.mitre.org/data/definitions/1022.html
                // https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration.html
                opened.opener = null;
                return;
            }

            this.$routeNavigate(url);
        }
    }
};
