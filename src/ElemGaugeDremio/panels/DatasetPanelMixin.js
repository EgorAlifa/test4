import { cloneDeep, isEqual } from 'lodash';
import { LevelFactory } from '../utils/constants';

export const DatasetPanelMixin = {
    computed: {
        availableMetrics() {
            const { levels } = this.props;
            return this.metrics
                .map((name, index) => [name, index])
                .filter(([_, index]) => levels.find(({ value, limit }) => [value, limit].includes(index)) == null);
        },
        invalidLevels() {
            const { metrics, props } = this;
            const { levels } = props;
            return levels
                .map((level, index) => [level, index])
                .filter(([{ limit, value }]) => metrics[limit] == null || metrics[value] == null);
        }
    },
    watch: {
        metrics: {
            handler(metrics) {
                this.changeMetric(metrics);
            },
            immediate: true
        }
    },
    methods: {
        /** @param {string[]} metrics */
        changeMetric(metrics) {
            const { levels } = this.props;
            if (levels.length === 0) {
                while (this.availableMetrics.length > 0 && this.availableMetrics.length % 2 === 0) {
                    this.createLevel();
                }
                this.propChanged();
                return;
            }

            const levelsCloned = cloneDeep(levels);
            const normalizeEntityProp = (prop) => (typeof prop === 'string' ? metrics.indexOf(prop) : prop);

            levels.forEach((level) => {
                level.limit = normalizeEntityProp(level.limit);
                level.value = normalizeEntityProp(level.value);
            });

            const invalidLevelsBefore = cloneDeep(this.invalidLevels);

            invalidLevelsBefore.forEach(([_, index]) => {
                levels.splice(index, 1);
            });

            if (isEqual(levelsCloned, levels) === false) {
                this.propChanged();
            }
        },
        createLevel() {
            const [metricOne = [], metricTwo = []] = this.availableMetrics;
            const [[nameLimit, limit], [nameValue, value]] = [metricOne, metricTwo];
            const level = LevelFactory({ nameLimit, limit, nameValue, value });
            this.props.levels.push(level);
        }
    }
};
