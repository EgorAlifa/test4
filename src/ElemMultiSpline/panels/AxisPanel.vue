<template>
    <ui-container>
        <div v-for="(axis, index) in props.axis" :key="index">
            <w-axis-settings
                v-bind="{ axis, index, id: findID(index), metricNames, datasetNames }"
                @change-axis="changeAxis"
                @delete-axis="deleteAxis" />
        </div>
        <ui-button type="ghost" @click="addAxis">Добавить ось</ui-button>
    </ui-container>
</template>

<script>
/**
 * @typedef {import('./OptionsPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./OptionsPanel').IInstance} IInstance
 */
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { cloneDeep } from 'lodash';
import WAxisSettings from './components/Axis.vue';
import { AxisTemplate } from '../utils/constants';
/**
 * @type {IComponentOptions}
 */

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    components: { WAxisSettings },

    meta: { name: 'Настройки осей', icon: 'axis-arrow' },

    data() {
        return {
            ids: [],
            currentIDx: 0,
            currentIDy: 0,
            ...PanelDatasetMixinTypes
        };
    },
    computed: {
        /**
         * @return {object[]}
         */
        metricNames() {
            const { metricNames, deviationMeta } = this.props;
            if (this.deviations.length > 0) {
                return metricNames.concat(this.deviations);
            }
            return metricNames;
        },
        datasetNames() {
            return this.datasetRequests.map(({ name }, index) => ({
                value: `${index}`,
                label: `${name} [${index}]`
            }));
        }
    },
    watch: {
        'props.axis': {
            handler(axis, oldAxis) {
                if (oldAxis != null && axis.length !== oldAxis.length) {
                    this.checkIDs();
                }
            },
            immediate: true
        }
    },
    methods: {
        /**
         *
         */
        addAxis() {
            const newAxis = AxisTemplate();
            this.props.axis.push(newAxis);
            this.checkIDs();
            this.propChanged('axis');
        },
        /**
         * @param {object} axis - settings of changed axis
         * @param {number} index - index of changed axis
         */
        changeAxis(axis, index) {
            this.$set(this.props.axis, index, cloneDeep(axis));
            this.propChanged('axis');
        },
        /**
         * @param {number} index - index of axis
         */
        deleteAxis(index) {
            this.deleteIDs();
            this.props.axis.splice(index, 1);
            this.checkIDs();
            this.propChanged('axis');
        },
        /**
         *
         */
        deleteIDs() {
            this.ids = [];
            this.currentIDy = 0;
            this.currentIDx = 0;
        },
        /**
         *
         */
        checkIDs() {
            this.deleteIDs();
            this.props.axis.forEach((item, index) => {
                if (item.typeAxis === 'x') {
                    this.ids.push({
                        type: 'x',
                        position: index,
                        id: this.currentIDx
                    });
                    item.id = this.currentIDx;
                    this.currentIDx += 1;
                } else {
                    this.ids.push({
                        type: 'y',
                        position: index,
                        id: this.currentIDy
                    });
                    item.id = this.currentIDy;
                    this.currentIDy += 1;
                }
            });
        },
        /**
         * @param {number} index - index of axis
         * @return {number} - id of axis
         */
        findID(index) {
            const id = this.ids.find((item) => item.position === index);
            return id ? id.id : 0;
        }
    }
};
</script>
