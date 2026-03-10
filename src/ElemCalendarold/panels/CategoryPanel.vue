<template>
    <ui-panel-container>
        <ui-container>
            <ui-select prop="dimension" :options="dimensions">Измерение</ui-select>

            <ui-select prop="metric" :options="metrics">Метрика</ui-select>

            <ui-has-panel>
                <ui-checkbox v-model="props.showLocalPopup" @change="propChanged('showLocalPopup')">
                    <ui-hint>
                        <template #label>Показывать локальный попап</template>
                        Показывает встроенный попап при взаимодействии с датами из категорий
                    </ui-hint>
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Стиль локального попапа', slot: 'localPopup' }]">
                        <template #localPopup>
                            <ui-select
                                v-model="props.moduleName"
                                :options="metrics"
                                class="p"
                                @change="propChanged('moduleName')">
                                Название модуля у курса
                            </ui-select>

                            <ui-select
                                v-model="props.moduleDescription"
                                :options="metrics"
                                class="p"
                                @change="propChanged('moduleDescription')">
                                Описание модуля
                            </ui-select>

                            <ui-select
                                v-model="props.courseName"
                                :options="metrics"
                                class="p"
                                @change="propChanged('courseName')">
                                Название курса
                            </ui-select>

                            <ui-select
                                v-model="props.educationForm"
                                :options="metrics"
                                @change="propChanged('educationForm')">
                                Форма обучения
                            </ui-select>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-collapse>
                <template #header>Стили категорий</template>
                <template v-if="props.range.active !== true">
                    <ui-select v-model="selectedCategory" :options="dimensionValues" :class="{ p: selectedCategory }">
                        Категория даты
                    </ui-select>

                    <ui-has-panel v-if="selectedCategory !== ''">
                        <div class="form-label form-label-small">Стиль категории</div>
                        <template #panel>
                            <ui-panel :groups="[{ name: 'Стиль категории', slot: 'category' }]">
                                <template v-if="selectedCategory !== ''" #category>
                                    <ui-input
                                        v-model="(props.dateCategories[categoryIdx] || {}).fontWeight"
                                        class="p"
                                        @change="propChanged('dateCategories')">
                                        Плотность шрифта
                                    </ui-input>
                                    <ui-input-cp
                                        v-model="props.dateCategories[categoryIdx].color"
                                        class="p"
                                        @change="propChanged('dateCategories')">
                                        Цвет шрифта
                                    </ui-input-cp>
                                    <ui-input-cp
                                        v-model="props.dateCategories[categoryIdx].backgroundColor"
                                        class="p"
                                        @change="propChanged('dateCategories')">
                                        Цвет заливки
                                    </ui-input-cp>

                                    <ui-select
                                        v-model="props.dateCategories[categoryIdx].borderStyle"
                                        :options="BorderStyleOptions"
                                        class="p"
                                        @change="propChanged('dateCategories')">
                                        Стиль границы
                                    </ui-select>

                                    <ui-input-cp
                                        v-model="props.dateCategories[categoryIdx].borderColor"
                                        class="p"
                                        @change="propChanged('dateCategories')">
                                        Цвет границы
                                    </ui-input-cp>

                                    <ui-has-two-columns class="p">
                                        <template #left>
                                            <ui-input-units
                                                v-model="props.dateCategories[categoryIdx].borderWidth"
                                                :units="BorderWidthUnits"
                                                @change="propChanged('dateCategories')">
                                                Толщина границы
                                            </ui-input-units>
                                        </template>
                                        <template #right>
                                            <ui-input-units
                                                v-model="props.dateCategories[categoryIdx].borderRadius"
                                                :units="SizeUnits"
                                                @change="propChanged('dateCategories')">
                                                Скругление углов
                                            </ui-input-units>
                                        </template>
                                    </ui-has-two-columns>

                                    <ui-has-panel>
                                        <ui-checkbox v-model="props.mark.show" @change="propChanged('mark')">
                                            Выводить отметку в дату
                                        </ui-checkbox>
                                        <template #panel>
                                            <ui-panel :groups="[{ name: 'Стиль отметки', slot: 'mark' }]">
                                                <template #mark>
                                                    <ui-has-two-columns class="p">
                                                        <template #left>
                                                            <ui-input
                                                                v-model="
                                                                    props.mark.dimValues[selectedCategory].mdiClass
                                                                "
                                                                @change="propChanged('mark')">
                                                                Класс mdi
                                                            </ui-input>
                                                        </template>
                                                        <template #right>
                                                            <ui-input-units
                                                                v-model="
                                                                    props.mark.dimValues[selectedCategory].style[
                                                                        'font-size'
                                                                    ]
                                                                "
                                                                :units="SizeUnits"
                                                                @change="propChanged('mark')">
                                                                Размер иконки
                                                            </ui-input-units>
                                                        </template>
                                                    </ui-has-two-columns>

                                                    <ui-input-cp
                                                        v-model="props.mark.dimValues[selectedCategory].style.color"
                                                        class="p"
                                                        @change="propChanged('mark')">
                                                        Цвет иконки
                                                    </ui-input-cp>

                                                    <ui-select
                                                        v-model="props.mark.dimValues[selectedCategory].classPosition"
                                                        :options="MarkPositionOptions"
                                                        @change="propChanged('mark')">
                                                        Местоположение
                                                    </ui-select>
                                                </template>
                                            </ui-panel>
                                        </template>
                                    </ui-has-panel>
                                </template>
                            </ui-panel>
                        </template>
                    </ui-has-panel>
                </template>
                <template v-else>
                    <span class="form-label form-label-small">
                        Необходимо выключить "Режим выбора диапазона" для настройки стилей
                    </span>
                </template>
            </ui-collapse>

            <ui-has-panel>
                <ui-checkbox v-model="props.indexes.isShow" @change="propChanged('indexes')">
                    <ui-hint>
                        <template #label>Выводить индекс</template>
                        Работает для категорий, отображая числовые индексы рядом с датами из
                        <br />
                        категорий, в соответствии с заданными условиями сравнения в настройках
                    </ui-hint>
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройка индексов' }]">
                        <ui-container>
                            <ui-select
                                v-model="props.indexes.metric"
                                :options="metrics"
                                @change="propChanged('indexes')">
                                Метрика
                            </ui-select>
                            <ui-collapse v-for="(condition, idx) in props.conditions" :key="idx">
                                <template #header>
                                    <div class="row row-collapse">
                                        <div class="col col-vmid">Условие {{ idx + 1 }}</div>
                                        <div class="col col-auto col-vmid">
                                            <div class="icon w-auto pull-left">
                                                <i
                                                    class="color-red mdi mdi-delete"
                                                    @click="(event) => deleteCondition(event, idx)" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <ui-container>
                                    <ui-select
                                        v-model="condition.type"
                                        :options="['Метрика/Измерение', 'Значение']"
                                        @change="propChanged('conditions')">
                                        Условие
                                    </ui-select>
                                    <ui-has-two-columns>
                                        <template #left>
                                            <ui-select
                                                v-model="condition.condition"
                                                :options="RulesOptions"
                                                @change="propChanged('conditions')">
                                                Условие
                                            </ui-select>
                                        </template>
                                        <template #right>
                                            <ui-input
                                                v-if="condition.type === 'Значение'"
                                                v-model="condition.value"
                                                @change="propChanged('conditions')">
                                                Значение
                                            </ui-input>
                                            <ui-select
                                                v-else
                                                v-model="condition.value"
                                                :options="metrics"
                                                @change="propChanged('conditions')">
                                                Значение
                                            </ui-select>
                                        </template>
                                    </ui-has-two-columns>
                                </ui-container>
                            </ui-collapse>
                            <ui-button @click="addCondition">Добавить условие</ui-button>

                            <ui-select
                                v-model="props.indexes.position"
                                :options="IndexPositionOptions"
                                @change="propChanged('indexes')">
                                Позиция
                            </ui-select>
                            <ui-select
                                v-model="props.indexes.location"
                                :options="IndexLocationsOptions"
                                @change="propChanged('indexes')">
                                Расположение
                            </ui-select>
                            <ui-input-units
                                v-model="props.indexes.paddingVertical"
                                :units="SizeUnits"
                                @change="propChanged('indexes')">
                                Вертикальное расстояние между индексом и числом даты
                            </ui-input-units>
                            <ui-input-units
                                v-model="props.indexes.paddingHorizontal"
                                :units="SizeUnits"
                                @change="propChanged('indexes')">
                                Горизонтальное расстояние между индексом и числом даты
                            </ui-input-units>
                            <ui-input-cp v-model="props.indexes.color" @change="propChanged('indexes')">
                                Цвет индекса
                            </ui-input-cp>
                            <ui-input-units
                                v-model="props.indexes.fontSize"
                                :units="SizeUnits"
                                @change="propChanged('indexes')">
                                Размер индекса
                            </ui-input-units>
                            <ui-input v-model.number="props.indexes.fontFamily" @change="propChanged('indexes')">
                                Шрифт индекса
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { SizeUnits, BorderStyleOptions, BorderWidthUnits } from '@goodt-wcore/panels';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { IndexLocationsOptions, IndexPositionOptions, MarkPositionOptions, RulesOptions } from './constants';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Категории', icon: 'calendar-multiselect' },
    data() {
        return {
            selectedCategory: '',
            ...PanelDatasetMixinTypes,
            ...PanelInstanceTypeDescriptor
        };
    },
    static: {
        SizeUnits,
        BorderWidthUnits,
        BorderStyleOptions,
        MarkPositionOptions,
        IndexPositionOptions,
        IndexLocationsOptions,
        RulesOptions
    },

    computed: {
        dimensionValues() {
            return this.elementInstance?.dimensionValues || [];
        },
        categoryIdx() {
            return this.props.dateCategories.findIndex(({ name }) => name === this.selectedCategory);
        }
    },

    watch: {
        dimensionValues: {
            handler(newDimensions) {
                const { dimValues: dimsFromMark } = this.props.mark;
                Object.keys(dimsFromMark)
                    .filter((el) => !newDimensions.includes(el))
                    .forEach((key) => delete dimsFromMark[key]); // remove unnecessary keys from props.mark

                newDimensions.forEach((dimEtalon) => {
                    if (dimsFromMark[dimEtalon] == null) {
                        dimsFromMark[dimEtalon] = {
                            mdiClass: '',
                            style: { color: '', 'font-size': '' }
                        };
                    }
                });
                this.propChanged('mark');

                const findCategories = [];
                newDimensions.forEach((dimensionName) => {
                    const record = this.props.dateCategories.find(({ name }) => name === dimensionName) || {
                        name: dimensionName,
                        color: '',
                        backgroundColor: '',
                        fontWeight: '',
                        borderStyle: '',
                        borderColor: '',
                        borderWidth: '',
                        borderRadius: ''
                    };
                    findCategories.push(record);
                });
                this.props.dateCategories = findCategories; // remove unnecessary elems from props.dateCategories
                this.propChanged('dateCategories');
            },
            immediate: true
        }
    },
    methods: {
        addCondition() {
            this.props.conditions.push({
                type: '',
                condition: '',
                value: ''
            });
            this.propChanged('conditions');
        },
        deleteCondition(event, idx) {
            event.stopPropagation();
            this.props.conditions.splice(idx, 1);
            this.propChanged('conditions');
        }
    }
};
</script>
