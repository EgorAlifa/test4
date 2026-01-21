<template>
    <ui-container>
        <ui-collapse>
            <template #header>Файлы</template>
            <div class="p" v-for="(geoJson, idx) in geoJsonLayer.files" :key="idx">
                <ui-input-browse class="p" v-model="geoJson.url" @change="updateModel"></ui-input-browse>
                <div class="d-flex">
                    <div class="w-75">
                        <ui-input class="p" v-model="geoJson.region" @change="updateModel">Регион</ui-input>
                    </div>
                    <div class="w-25 pad-left-3">
                        <div class="form-label text-truncate form-label-xsmall">Удалить</div>
                        <ui-button icon @click="removeGeoJsonFile(idx)">
                            <i class="mdi mdi-delete"></i>
                        </ui-button>
                    </div>
                </div>
            </div>
            <ui-button class="p" @click="addGeoJsonFile">Добавить geojson</ui-button>
            <ui-button @click="addMultiGeoFiles">Добавить файлы</ui-button>
        </ui-collapse>
        <ui-input v-model="geoJsonLayer.metricJSON" @change="updateModel">Идентификатор объекта в слое</ui-input>
        <ui-select v-model="geoJsonLayer.metricFilter" :options="dimensionsMetricsOptions" @change="updateModel">
            Идентификатор объекта в источнике
        </ui-select>

        <ui-has-panel v-if="!isSecondLevel">
            <span class="form-label text-truncate form-label-small">Настройка дриллдауна</span>
            <template #panel>
                <ui-panel :groups="[{ slot: 'default', name: 'Настройка дриллдауна' }]">
                    <ui-select
                        class="p"
                        v-model="geoJsonLayer.drillDownLayer"
                        :options="secondLevelLayers"
                        @change="updateModel">
                        Слой для проваливания
                    </ui-select>
                    <ui-input v-model="geoJsonLayer.drillDownMetricJSON" @change="updateModel">
                        Идентификатор объекта в слое
                    </ui-input>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-two-columns>
            <template #left>
                <ui-input type="number" step="any" v-model.number="geoJsonLayer.zoomFrom" @change="updateModel">
                    Масштаб от
                </ui-input>
            </template>
            <template #right>
                <ui-input type="number" step="any" v-model.number="geoJsonLayer.zoomTo" @change="updateModel">
                    Масштаб до
                </ui-input>
            </template>
        </ui-has-two-columns>

        <ui-input-cp v-model="geoJsonLayer.fillColor" @change="updateModel">Цвет заливки</ui-input-cp>

        <ui-has-two-columns>
            <template #left>
                <ui-input
                    type="number"
                    step="any"
                    min="0"
                    v-model.number="geoJsonLayer.borderWidth"
                    @change="updateModel">
                    Толщина границы
                </ui-input>
            </template>
            <template #right>
                <ui-input-cp v-model="geoJsonLayer.borderColor" @change="updateModel">Цвет границы</ui-input-cp>
            </template>
        </ui-has-two-columns>

        <ui-has-panel>
            <ui-checkbox v-model="geoJsonLayer.shouldUseCustomColors" @change="updateModel">
                Заливка по условию
            </ui-checkbox>
            <template #panel>
                <p>Настройки заливки</p>
                <ui-panel
                    :groups="[
                        { slot: 'byRule', name: 'По условию' },
                        { slot: 'gradient', name: 'Градиент' }
                    ]">
                    <template #byRule>
                        <ui-select
                            class="p"
                            v-model="geoJsonLayer.colorMetric"
                            :options="dimensionsMetricsOptions"
                            @change="updateModel">
                            Измерение/метрика
                        </ui-select>
                        <ui-button class="p" @click="addRule">Добавить условие</ui-button>
                        <ui-collapse class="p" v-for="(rule, idx) in geoJsonLayer.colorRules" :key="'color-' + idx">
                            <template #header>
                                <div class="d-flex flex-v-center flex-h-space-between">
                                    <span>Условие {{ idx + 1 }}</span>
                                    <ui-button class="min-height-18" type="ghost" @click.stop="removeRule(idx)">
                                        <i class="mdi mdi-delete color-red" />
                                    </ui-button>
                                </div>
                            </template>
                            <ui-has-two-columns class="p">
                                <template #left>
                                    <ui-input type="number" step="any" v-model.number="rule.from" @change="updateModel">
                                        Значение от
                                    </ui-input>
                                </template>
                                <template #right>
                                    <ui-input type="number" step="any" v-model.number="rule.to" @change="updateModel">
                                        Значение до
                                    </ui-input>
                                </template>
                            </ui-has-two-columns>
                            <ui-input-cp class="p" v-model="rule.fillColor" @change="updateModel">
                                Цвет заливки
                            </ui-input-cp>
                            <ui-input-cp class="p" v-model="rule.color" @change="updateModel">Цвет границы</ui-input-cp>
                        </ui-collapse>
                    </template>
                    <template #gradient>
                        <ui-switch
                            class="p"
                            v-model="geoJsonLayer.gradient.useGradientColor"
                            :disabled="geoJsonLayer.colorMetric == null"
                            @change="updateModel">
                            Использовать градиент
                        </ui-switch>
                        <template v-if="geoJsonLayer.gradient.useGradientColor && geoJsonLayer.colorMetric != null">
                            <ui-input-cp
                                class="p"
                                v-model="geoJsonLayer.gradient.gradientColorMax"
                                @change="updateModel">
                                Цвет мин
                            </ui-input-cp>
                            <ui-input-cp
                                class="p"
                                v-model="geoJsonLayer.gradient.gradientColorMin"
                                @change="updateModel">
                                Цвет макс
                            </ui-input-cp>
                            <ui-input
                                type="number"
                                step="1"
                                min="2"
                                v-model.number="geoJsonLayer.gradient.gradientSmoothing"
                                @change="updateModel">
                                <ui-hint>
                                    <template #label>Сглаживание</template>
                                    Определяет количество промежуточных оттенков между цветом минимума и цветом
                                    максимума.
                                </ui-hint>
                            </ui-input>
                        </template>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel>
            <ui-checkbox v-model="geoJsonLayer.legend.shouldShowLegend" @change="updateModel">Легенда</ui-checkbox>
            <template #panel>
                <p>Настройки легенды</p>
                <ui-panel
                    :groups="[
                        { slot: 'title', name: 'Заголовок' },
                        { slot: 'values', name: 'Значения' }
                    ]"
                    @click="updateModel">
                    <template #title>
                        <ui-input class="p" v-model="geoJsonLayer.legend.title" @change="updateModel">
                            Заголовок легенды
                        </ui-input>
                        <ui-input-cp class="p" v-model="geoJsonLayer.legend.styleTitle.color" @change="updateModel">
                            Цвет заголовка
                        </ui-input-cp>
                        <ui-input-units
                            class="p"
                            v-model="geoJsonLayer.legend.styleTitle.fontSize"
                            :units="SizeUnits"
                            @change="updateModel">
                            Размер заголовка
                        </ui-input-units>
                        <ui-input class="p" v-model="geoJsonLayer.legend.styleTitle.fontFamily" @change="updateModel">
                            Шрифт
                        </ui-input>
                        <ui-input-units
                            class="p"
                            v-model="geoJsonLayer.legend.styleTitle.marginBottom"
                            :units="SizeUnits"
                            @change="updateModel">
                            Отступ
                        </ui-input-units>
                        <ui-select
                            v-model="geoJsonLayer.legend.styleTitle.textAlign"
                            :options="TextAlignOptions"
                            @change="updateModel">
                            Расположение
                        </ui-select>
                    </template>
                    <template #values>
                        <ui-input-cp class="p" v-model="geoJsonLayer.legend.styleValues.color" @change="updateModel">
                            Цвет значений
                        </ui-input-cp>
                        <ui-input-units
                            class="p"
                            v-model="geoJsonLayer.legend.styleValues.fontSize"
                            :units="SizeUnits"
                            @change="updateModel">
                            Размер значений
                        </ui-input-units>

                        <ui-input class="p" v-model="geoJsonLayer.legend.styleValues.fontFamily" @change="updateModel">
                            Шрифт значений
                        </ui-input>
                        <ui-input-units
                            class="p"
                            v-model="geoJsonLayer.legend.styleValues.padding"
                            :units="SizeUnits"
                            @change="updateModel">
                            Отступ значений
                        </ui-input-units>

                        <ui-select
                            class="p"
                            v-model="geoJsonLayer.legend.styleValues.textAlign"
                            :options="TextAlignOptions"
                            @change="updateModel">
                            Расположение
                        </ui-select>
                        <ui-input-units
                            class="p"
                            v-model="geoJsonLayer.legend.styleValues.size"
                            :units="SizeUnits"
                            @change="updateModel">
                            Размер цветовых элементов
                        </ui-input-units>
                        <ui-number-format v-model="geoJsonLayer.legend.format" @change="updateModel">
                            Формат числа
                        </ui-number-format>
                    </template>
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-has-panel>
            <ui-checkbox v-model="geoJsonLayer.labels.isVisible" @change="updateModel">Вывод подписей</ui-checkbox>
            <template #panel>
                <ui-panel :groups="[{ slot: 'default', name: 'Настройка вывода подписей' }]">
                    <ui-switch class="p" v-model="geoJsonLayer.labels.shouldShowWhenHover" @change="updateModel">
                        Отображать при наведении
                    </ui-switch>
                    <w-labels
                        v-model="geoJsonLayer.labels.settings"
                        :dimensions-metrics-options="dimensionsMetricsOptions"
                        @change="updateModel" />
                </ui-panel>
            </template>
        </ui-has-panel>

        <ui-select v-model="geoJsonLayer.metricEvent" :options="dimensionsMetricsOptions" @change="updateModel">
            Событие при нажатии
        </ui-select>

        <ui-input-auto v-model="geoJsonLayer.path" @change="updateModel">Переход по ссылке</ui-input-auto>
    </ui-container>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { FileManager } from '@goodt-wcore/managers';
import { cloneDeep } from 'lodash';
import { SizeUnits } from '@goodt-wcore/panels';

import { TextAlignOptions } from '../config';

import WLabels from './Labels.vue';

export default {
    components: { ...PanelUi, WLabels },
    static: { SizeUnits, TextAlignOptions },
    props: {
        value: { type: Object, required: true },
        dimensionsMetricsOptions: { type: Array, default: () => [] },
        secondLevelLayers: { type: Array, default: () => [] },
        isSecondLevel: { type: Boolean, default: false }
    },
    data: () => ({
        geoJsonLayer: null
    }),
    watch: {
        value: {
            handler(value) {
                this.geoJsonLayer = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        updateModel() {
            this.$emit('input', this.geoJsonLayer);
            this.$emit('change');
        },
        addGeoJsonFile(infoFile = {}) {
            this.geoJsonLayer.files.push({
                name: '',
                region: '',
                ...infoFile
            });
            this.updateModel();
        },
        async addMultiGeoFiles() {
            const { instance } = FileManager;
            const informationAboutFiles = await instance.browse({ selectMultiple: true });
            this.fillInformation(informationAboutFiles);
        },
        fillInformation(infoFiles) {
            infoFiles.forEach((file) => {
                const { url, name } = file;
                const [fileName] = name.split('.');

                this.addGeoJsonFile({
                    region: fileName,
                    url
                });
            });
        },
        removeGeoJsonFile(idx) {
            this.geoJsonLayer.files.splice(idx, 1);
            this.updateModel();
        },
        addRule() {
            this.geoJsonLayer.colorRules.push({
                from: null,
                to: null,
                fillColor: '#0000ff',
                color: '#000000'
            });
            this.updateModel();
        },
        removeRule(idx) {
            this.geoJsonLayer.colorRules.splice(idx, 1);
            this.updateModel();
        }
    }
};
</script>
<style lang="pcss" scoped src="../defaultPanelStyles.pcss" />
