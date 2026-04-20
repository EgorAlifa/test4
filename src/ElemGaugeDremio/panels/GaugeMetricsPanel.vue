<template>
    <w-panel>
        <ui-collapse class="p" v-for="(level, idx) in props.levels" :key="'key' + idx">
            <template #header>Набор метрик {{ idx + 1 }}</template>

            <ui-collapse class="p">
                <template #header>Лимит</template>
                <ui-select class="p" v-model="level.limit" :options="metricsOptions" @change="onLevelLimitChange(idx)">
                    Метрика
                </ui-select>
                <ui-input class="p" type="text" v-model="level.nameLimit" @change="updateLevels">
                    Наименование метрики
                </ui-input>
                <ui-input-cp class="p" v-model="level.limitColor" @change="updateLevels">Цвет линии</ui-input-cp>
                <ui-input type="number" colSize="6-12" v-model.number="level.limitWidth" @change="updateLevels">
                    Толщина линии
                </ui-input>
            </ui-collapse>

            <ui-collapse class="p">
                <template #header>Значение</template>
                <ui-select class="p" v-model="level.value" :options="metricsOptions" @change="onLevelValueChange(idx)">
                    Метрика
                </ui-select>
                <ui-input class="p" type="text" v-model="level.nameValue" @change="updateLevels">
                    Наименование метрики
                </ui-input>
                <ui-input-cp class="p" v-model="level.valueColor" @change="updateLevels">Цвет линии</ui-input-cp>
                <ui-input type="number" colSize="6-12" v-model.number="level.valueWidth" @change="updateLevels">
                    Толщина линии
                </ui-input>
            </ui-collapse>

            <ui-select
                class="p"
                colSize="6-12"
                :options="NumberFormatOptions"
                v-model="level.format"
                @change="updateLevels">
                Тип отображения
            </ui-select>

            <ui-switch class="p" type="checkbox" v-model="level.rounded" @change="updateLevels">Скругление</ui-switch>

            <ui-input class="p" type="number" colSize="6-12" v-model.number="level.indent" @change="updateLevels">
                Отступ
            </ui-input>

            <ui-has-panel class="p">
                <ui-checkbox v-model="level.dashed" @change="updateLevels">Пунктир</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка пунктира', slot: 'level-dashed' }]">
                        <template #level-dashed>
                            <div class="text-xsmall">Массив</div>
                            <div class="p input-range-block">
                                <input
                                    class="input-range"
                                    type="range"
                                    v-model="level.dasharray"
                                    min="0"
                                    :max="level.indent * 3"
                                    @change="updateLevels" />
                            </div>

                            <div class="text-xsmall">Смещение</div>
                            <div class="p input-range-block">
                                <input
                                    class="input-range"
                                    type="range"
                                    v-model="level.dashoffset"
                                    min="0"
                                    :max="level.indent * 6"
                                    @change="updateLevels" />
                            </div>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input class="p" v-model="level.dropShadow" @change="updateLevels">Тень</ui-input>

            <ui-button type="error" @click="removeLevel(idx)">Удалить метрику</ui-button>
        </ui-collapse>
        <ui-button type="primary" class="w-100" @click="addLevel">Добавить метрику</ui-button>
    </w-panel>
</template>
<style scoped>
.input-range-block {
    line-height: 0;
    padding: 0.25rem;
    border: 0.0625rem solid #dcdcdc;
    border-radius: 0.25rem;
}

.input-range {
    display: inline-block;
    width: 100%;
}
</style>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { DatasetPanelMixin as MetricsPanelMixin } from './DatasetPanelMixin';
import { NumberFormatOptions } from '../utils/constants';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin(), MetricsPanelMixin],

    meta: { name: 'Метрики', icon: 'gauge' },

    static: {
        NumberFormatOptions
    },
    computed: {
        metricsOptions() {
            return this.metrics.map((metric, index) => ({ label: metric, value: index }));
        }
    },
    methods: {
        ...PanelDatasetMixinTypes,
        addLevel() {
            this.createLevel();
            this.updateLevels();
        },
        removeLevel(index) {
            this.props.levels.splice(index, 1);
            this.updateLevels();
        },
        updateLevels() {
            this.propChanged('levels');
        },
        onLevelLimitChange(levelIndex) {
            const level = this.props.levels[levelIndex];
            level.nameLimit = this.metrics[level.limit];
            this.updateLevels();
        },
        onLevelValueChange(levelIndex) {
            const level = this.props.levels[levelIndex];
            level.nameValue = this.metrics[level.value];
            this.updateLevels();
        }
    }
};
</script>
