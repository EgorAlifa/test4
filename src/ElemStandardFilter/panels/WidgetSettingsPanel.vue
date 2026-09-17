<template>
    <ui-panel-container>
        <ui-container>
            <ui-switch v-model="props.isGeneralPreview" @change="propChanged('isGeneralPreview')">
                <ui-hint>
                    <template #label>Общий предпросмотр</template>
                    Скрывает список значений до момента использования поиска -
                    <br />
                    при вводе символов появляются подходящие значения списка.
                </ui-hint>
            </ui-switch>

            <ui-switch v-model="props.filtrationMode" @change="propChanged('filtrationMode')">
                <ui-hint>
                    <template #label>Включить фильтрацию</template>
                    Активирует фильтрацию виджета при работе с хранилищем.
                </ui-hint>
            </ui-switch>

            <ui-switch v-model="props.firstValue" @change="propChanged('firstValue')">Первое значение списка</ui-switch>

            <ui-switch v-model="props.isAlwaysFirstValue" @change="propChanged('isAlwaysFirstValue')">
                <ui-hint>
                    <template #label>Выбирать первое значение всегда</template>
                    Осуществляет выбор первого значения списка при любых взаимодействиях,
                    <br />
                    в том числе при фильтрации списка.
                </ui-hint>
            </ui-switch>

            <ui-has-panel>
                <ui-checkbox v-model="props.isSmartSearch" @change="propChanged('isSmartSearch')">
                    <ui-hint>
                        <template #label>Умный поиск</template>
                        Преобразует виджет в поисковую систему на основе нескольких источников данных,
                        <br />
                        позволяя искать по вложенностям в слоте с помощью проверки соответствия строк,
                        <br />
                        настроенных в датасете измерений, с вводимым значением.
                    </ui-hint>
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки', slot: 'smartSearch' }]">
                        <template #smartSearch>
                            <ui-container>
                                <ui-select
                                    v-model="props.closingMode"
                                    :options="CloseOptions"
                                    @change="propChanged('closingMode')">
                                    Вариант закрытия
                                </ui-select>
                                <ui-switch v-model="props.isQuickInput" @change="propChanged('isQuickInput')">
                                    Быстрый поиск
                                </ui-switch>
                                <ui-switch v-model="props.isOpeningByEnter" @change="propChanged('isOpeningByEnter')">
                                    Открытие по enter
                                </ui-switch>
                                <ui-input v-model="props.headerPadding" @change="propChanged('headerPadding')">
                                    Padding заголовка
                                </ui-input>
                                <ui-input v-model="props.contentPadding" @change="propChanged('contentPadding')">
                                    Padding контента
                                </ui-input>
                                <ui-input v-model="props.contentBoxShadow" @change="propChanged('contentBoxShadow')">
                                    Тень контента
                                </ui-input>
                                <ui-switch v-model="props.isResizable" @change="propChanged('isResizable')">
                                    <ui-hint>
                                        <template #label>Изменяемый размер</template>
                                        Размер раскрытого списка определяется его содержимым.
                                    </ui-hint>
                                </ui-switch>
                                <ui-input-units prop="smartSearchHeight" :units="SizeUnits">
                                    Высота виджета
                                </ui-input-units>
                                <ui-input-units
                                    v-model="props.openWidth"
                                    :units="SizeUnits"
                                    @change="propChanged('openWidth')">
                                    Ширина при раскрытии
                                </ui-input-units>
                                <ui-switch
                                    v-model="props.isSmartSearchGeneralPreview"
                                    @change="propChanged('isSmartSearchGeneralPreview')">
                                    По умолчанию пусто
                                </ui-switch>
                                <ui-switch
                                    v-model="props.disableContentHiding"
                                    @change="propChanged('disableContentHiding')">
                                    Запрет на скрытие окна
                                </ui-switch>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox v-model="props.isSearchMode" @change="propChanged('isSearchMode')">
                    Режим поиска
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки', slot: 'searchMode' }]">
                        <template #searchMode>
                            <ui-container>
                                <ui-input
                                    v-model="props.searchModeInput.placeholder"
                                    @change="propChanged('searchModeInput')">
                                    Плейсхолдер
                                </ui-input>

                                <ui-input-units
                                    v-model="props.searchModeInput.marginLeft"
                                    :units="SizeUnits"
                                    @change="propChanged('searchModeInput')">
                                    Отступ от иконки префикса
                                </ui-input-units>

                                <ui-input
                                    v-model="props.searchModeInput.prefix"
                                    @change="propChanged('searchModeInput')">
                                    Префикс
                                </ui-input>

                                <ui-input-units
                                    v-model="props.searchModeInput.prefixMarginLeft"
                                    :units="SizeUnits"
                                    @change="propChanged('searchModeInput')">
                                    Отступ префикса
                                </ui-input-units>

                                <ui-input-units
                                    v-model="props.searchModeInput.prefixFontSize"
                                    :units="SizeUnits"
                                    @change="propChanged('searchModeInput')">
                                    Размер префикса
                                </ui-input-units>

                                <ui-input-cp
                                    v-model="props.searchModeInput.prefixColor"
                                    @input="propChanged('searchModeInput')">
                                    Цвет префикса
                                </ui-input-cp>

                                <ui-input-units
                                    v-model="props.searchModeInput.postfixMarginRight"
                                    :units="SizeUnits"
                                    @change="propChanged('searchModeInput')">
                                    Отступ постфикса
                                </ui-input-units>

                                <ui-input-units
                                    v-model="props.searchModeInput.postfixFontSize"
                                    :units="SizeUnits"
                                    @change="propChanged('searchModeInput')">
                                    Размер постфикса
                                </ui-input-units>

                                <ui-input-cp
                                    v-model="props.searchModeInput.postfixColor"
                                    @input="propChanged('searchModeInput')">
                                    Цвет постфикса
                                </ui-input-cp>

                                <ui-input-units
                                    v-model="props.searchModeInput.borderWidth"
                                    :units="SizeUnits"
                                    @change="propChanged('searchModeInput')">
                                    Толщина границ
                                </ui-input-units>

                                <ui-input-cp
                                    v-model="props.searchModeInput.borderColor"
                                    @change="propChanged('searchModeInput')">
                                    Цвет границ
                                </ui-input-cp>

                                <ui-input-units
                                    v-model="props.searchModeInput.borderRadius"
                                    :units="SizeUnits"
                                    @change="propChanged('searchModeInput')">
                                    Скругление границ
                                </ui-input-units>

                                <ui-switch prop="shouldClearEnteredValueAfterHardReloadEvent">
                                    <ui-hint>
                                        <template #label>Сброс поля поиска</template>
                                        При получении "события для обновления виджета"
                                        <br />
                                        произойдет сброс введенного пользователем текста в поле поиска
                                    </ui-hint>
                                </ui-switch>

                                <ui-input type="number" prop="minSearchingLength">
                                    Количество символов для начала поиска
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="useEmbeddedSearch">Встроенный поиск</ui-switch>

            <ui-has-panel>
                <ui-checkbox v-model="props.customEvent.enable" @change="propChanged('customEvent')">
                    Отправлять событие
                </ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Статическое', slot: 'static' },
                            { name: 'Динамическое', slot: 'dynamic' }
                        ]">
                        <template #static>
                            <ui-container>
                                <ui-input v-model="props.customEvent.onSelectName" @change="propChanged('customEvent')">
                                    Имя события при селекте
                                </ui-input>
                                <ui-input v-model="props.customEvent.onResetName" @change="propChanged('customEvent')">
                                    Имя события при сбросе
                                </ui-input>
                            </ui-container>
                        </template>
                        <template #dynamic>
                            <ui-container>
                                <ui-switch v-model="props.dynamicEvent.enable" @change="propChanged('dynamicEvent')">
                                    Динамическое имя события
                                </ui-switch>
                                <ui-select
                                    v-model="props.dynamicEvent.onSelectName"
                                    :options="dimensionMetricNames"
                                    @change="propChanged('dynamicEvent')">
                                    Имя события - значение поля
                                </ui-select>
                                <ui-input
                                    v-model="props.dynamicEvent.onResetName"
                                    @change="propChanged('dynamicEvent')">
                                    Имя события при сбросе
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input v-model="props.events[Events.HARD_RELOAD]" @change="propChanged('events')">
                Событие для обновления виджета
            </ui-input>

            <ui-switch v-model="props.noReset" @change="onResetOptionsChange">
                <ui-hint>
                    <template #label>Без полного сброса</template>
                    Отключает возможность сбрасывать выбранные значения в фильтре.
                </ui-hint>
            </ui-switch>

            <ui-switch v-model="props.isResetToDefault" @change="propChanged('isResetToDefault')">
                <ui-hint>
                    <template #label>Сброс до дефолта</template>
                    Если при первичной загрузке страницы в хранилище имеется параметр, который фильтр подхватывает по
                    умолчанию,
                    <br />
                    то при выборе других значений фильтра и их последующем сбросе - сброс произойдет до дефолтного
                    параметра.
                    <br />
                    Настройка предназначена для режима мультиселект.
                </ui-hint>
            </ui-switch>

            <div class="d-flex items-center">
                <div class="w-100 text-small form-label">
                    <ui-hint>
                        <template #label>Добавить значение</template>
                        Позволяет задать значения, которые будут выбраны по умолчанию.
                    </ui-hint>
                </div>
                <div class="btn btn-icon btn-small pull-right">
                    <div class="icon cursor-pointer flex-v-start" @click="addDefaultValue">
                        <i class="mdi mdi-plus mdi-18px"></i>
                    </div>
                </div>
            </div>

            <div
                v-for="(item, index) in props.defaultValues"
                :key="index"
                class="d-flex flex-v-end flex-h-space-between">
                <ui-input v-model="item.name" @change="propChanged('defaultValues')">Значение по умолчанию</ui-input>
                <div class="btn btn-icon btn-small">
                    <div class="icon cursor-pointer" @click="deleteDefaultValue(index)">
                        <i class="mdi mdi-close"></i>
                    </div>
                </div>
            </div>

            <ui-has-panel>
                <ui-checkbox :disabled="props.multiMode" prop="useRadioButton">Радиокнопки</ui-checkbox>
                <template #panel>
                    <ui-container>
                        <ui-input-cp prop="radioButtonSettings.backlight">Цвет подсветки</ui-input-cp>

                        <ui-input-units prop="radioButtonSettings.size" :units="SizeUnits">
                            Размер радиокнопки
                        </ui-input-units>
                    </ui-container>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="multiMode">Мультиселект</ui-checkbox>
                <template #panel>
                    <ui-container>
                        <ui-input-cp prop="backlight">Цвет подсветки</ui-input-cp>

                        <ui-input-units prop="checkBoxFontSize" :units="SizeUnits">Размер чекбокса</ui-input-units>

                        <ui-input-cp prop="multiModeHoverColor">Цвет при наведении</ui-input-cp>
                    </ui-container>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox v-model="props.multiCount" @change="propChanged('multiCount')">
                    Включить подсчет
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Редактирование плейсхолдера', slot: 'multicount' }]">
                        <template #multicount>
                            <ui-container>
                                <ui-input prop="textPlaceholderMultiCount.textPlaceholder">Текст плейсхолдера</ui-input>

                                <ui-input-units prop="textPlaceholderMultiCount.placeHolderFontSize" :units="SizeUnits">
                                    Размер плейсхолдера
                                </ui-input-units>

                                <ui-input-cp prop="fontColor">Цвет текста</ui-input-cp>

                                <ui-input prop="textUnit">Текст единиц измерений</ui-input>

                                <ui-input-units prop="sizeUnit" :units="SizeUnits">
                                    Размер единиц измерений
                                </ui-input-units>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Сброс -->

            <ui-has-panel>
                <ui-checkbox prop="clearEnable">Включить сброс</ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Сброс', slot: 'btnClear' },
                            { name: 'Применить', slot: 'btnDo' },
                            { name: 'Выделить всё', slot: 'btnSelectAll' }
                        ]">
                        <template #btnClear>
                            <ui-container>
                                <ui-switch v-model="isBtnClearShown">Отображать кнопку</ui-switch>
                                <ui-btn-settings
                                    v-model="props.btnClear"
                                    @change="propChanged('btnClear')"></ui-btn-settings>
                            </ui-container>
                        </template>
                        <template #btnDo>
                            <ui-container>
                                <ui-switch v-model="isBtnDoShown">Отображать кнопку</ui-switch>
                                <ui-btn-settings v-model="props.btnDo" @change="propChanged('btnDo')"></ui-btn-settings>
                            </ui-container>
                        </template>
                        <template #btnSelectAll>
                            <ui-container>
                                <ui-switch prop="btnSelectAllEnable">Отображать кнопку</ui-switch>
                                <ui-btn-settings
                                    v-model="props.btnSelectAll"
                                    @change="propChanged('btnSelectAll')"></ui-btn-settings>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox
                    :disabled="props.multiMode"
                    v-model="props.trimTheLine"
                    @change="propChanged('trimTheLine')">
                    Обрезать текст
                </ui-checkbox>
                <template #panel>
                    <ui-input
                        type="number"
                        v-model.number="props.cutStringLength"
                        @change="propChanged('cutStringLength')">
                        Количество символов
                    </ui-input>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <span class="text-small form-label">Плейсхолдер</span>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки плейсхолдера', slot: 'placeholder' }]">
                        <template #placeholder>
                            <ui-container>
                                <ui-input v-model="props.textPlaceholder" @change="propChanged('textPlaceholder')">
                                    Текст
                                </ui-input>

                                <ui-input-units
                                    v-model="props.placeHolderFontSize"
                                    :units="SizeUnits"
                                    @change="propChanged('placeHolderFontSize')">
                                    Размер
                                </ui-input-units>
                                <ui-select
                                    v-model="props.placeholderFontWeight"
                                    :options="FontWeightOptions"
                                    @change="propChanged('placeholderFontWeight')">
                                    Насыщенность
                                </ui-select>
                                <ui-input-cp v-model="props.placeHolderColor" @change="propChanged('placeHolderColor')">
                                    Цвет
                                </ui-input-cp>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input-units prop="sizeHeight" :units="SizeUnits">
                <ui-hint>
                    <template #label>Максимальная высота</template>
                    Позволяет регулировать высоту раскрываемого списка фильтра.
                </ui-hint>
            </ui-input-units>

            <ui-has-panel>
                <ui-checkbox
                    :disabled="props.multiMode"
                    v-model="props.isSingleSelectBacklight"
                    @change="propChanged('isSingleSelectBacklight')">
                    <ui-hint>
                        <template #label>Цвет подсветки</template>
                        Задает цвет для выбранного значения внутри списка значений фильтра. Не работает с
                        мультиселектом.
                    </ui-hint>
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройка подсветки', slot: 'searchMode' }]">
                        <template #searchMode>
                            <ui-input-cp
                                v-model="props.selectedDimensionBacklightColor"
                                @input="propChanged('selectedDimensionBacklightColor')">
                                Цвет
                            </ui-input-cp>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-input-units prop="iconFontSize" :units="SizeUnits">Размер иконки сворачивания</ui-input-units>
            <ui-input-units prop="searchFontSize" :units="SizeUnits">Размер шрифта поиска</ui-input-units>
            <ui-input-cp prop="inputBackgroundColor">Цвет поля поиска</ui-input-cp>
            <ui-input-cp prop="inputColor">Цвет текста поиска</ui-input-cp>
            <ui-input-units prop="dimensionsFontSize" :units="SizeUnits">Размер текста измерений</ui-input-units>
            <ui-select prop="dimensionsFontWeight" :options="FontWeightOptions">
                Насыщенность текста измерений
            </ui-select>
            <ui-input-cp prop="dimensionsColor">Цвет текста измерений</ui-input-cp>
            <ui-input-cp prop="widgetColor">Цвет виджета</ui-input-cp>
            <ui-input prop="borderRadius">Скругление границ</ui-input>
            <ui-input prop="shadow">Тень</ui-input>
            <ui-switch prop="isShowMenuByCursor">Раскрытие по наведению</ui-switch>
            <ui-has-panel>
                <ui-checkbox prop="isAwaitVariableMode">Ожидать фильтрацию из хранилища</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Параметры ожидания переменных', slot: 'default' }]">
                        <ui-select
                            v-model="props.awaitVariableModeSettings.variables"
                            :options="awaitModeVariableOptions"
                            multiple
                            @change="propChanged('awaitVariableModeSettings')">
                            Переменные
                        </ui-select>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="isListeningVar">Слушать переменную поиска</ui-switch>
            <ui-has-panel>
                <span class="text-small form-label">Фильтры хранилища</span>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Фильтры хранилища', slot: 'default' }]">
                        <div class="p" v-for="(filter, i) in props.filters" :key="i">
                            <div class="row row-collapse">
                                <div class="col">
                                    <ui-input v-model="filter.name" @change="onFilterChange(filter, i)">имя</ui-input>
                                </div>
                                <div class="col">
                                    <ui-input
                                        class="mar-left-3"
                                        :value="getFilterData(filter)"
                                        @input="(val) => setFilterData(filter, val)"
                                        @change="onFilterChange(filter, i)">
                                        значение
                                    </ui-input>
                                </div>
                                <div class="col col-auto col-vbot">
                                    <ui-button type="ghost" inline icon @click="onFilterDelete(filter)">
                                        <i class="mdi mdi-delete"></i>
                                    </ui-button>
                                </div>
                            </div>
                        </div>
                        <ui-button @click="onFilterAdd">Добавить</ui-button>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-select prop="excludedField" :options="dimensionMetricNames">
                <ui-hint>
                    <template #label>Полe для исключения</template>
                    При отправке значения, выбранного здесь поля, кастомной
                    <br />
                    переменной "exclude_filter_value" - значение будет исключено.
                </ui-hint>
            </ui-select>
        </ui-container>
    </ui-panel-container>
</template>
<script>
/**
 * @typedef {import('./DimensionPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./DimensionPanel').IInstance} IInstance
 */
import { Panel, Dremio } from 'goodt-wcore';
import { FontWeightOptions, SizeUnits } from '@goodt-wcore/panels';
import { CloseOptions } from '../config';
// eslint-disable-next-line import/no-cycle
import { Events } from '../descriptor';
import { UiBtnSettings } from './components';

const { Query } = Dremio;

/**
 * @type {IComponentOptions}
 */
export default {
    extends: Panel,
    components: { UiBtnSettings },
    static: {
        CloseOptions,
        Events,
        SizeUnits,
        FontWeightOptions: [{ label: 'Наследуемый', value: 'inherit' }, ...FontWeightOptions]
    },
    data: () => ({
        /** @public */
        $meta: { name: 'Настройки виджета', icon: 'widgets' }
    }),
    computed: {
        /**
         * @return {array}
         */
        dimensionMetricNames() {
            let metricDimensionList = this.props.dremio.reduce((acc, dataset) => {
                const { query, dimensionList } = dataset;

                return [...acc, ...Query.queryMetricNames(query), ...Object.keys(dimensionList)];
            }, []);
            metricDimensionList.sort((prev, next) => prev.localeCompare(next));
            metricDimensionList = metricDimensionList.map((value) => ({ label: value, value }));
            return [{ label: '-', value: null }, ...metricDimensionList];
        },
        isBtnClearShown: {
            get() {
                const { btnClear } = this.props;
                return btnClear.isShown ?? true;
            },
            set(val) {
                const { btnClear } = this.props;
                btnClear.isShown = val;
                this.propChanged('btnClear');
            }
        },
        isBtnDoShown: {
            get() {
                const { btnDo } = this.props;
                return btnDo.isShown ?? true;
            },
            set(val) {
                const { btnDo } = this.props;
                btnDo.isShown = val;
                this.propChanged('btnDo');
            }
        },
        awaitModeVariableOptions() {
            return Object.keys({
                ...this.descriptor.vars,
                ...this.elementInstance?.descriptor.vars
            }).sort();
        }
    },
    created() {
        if (!Array.isArray(this.props.dremio)) {
            this.props.dremio = this.props.dremio == null ? [] : [this.props.dremio];
        }
    },
    methods: {
        addDefaultValue() {
            this.props.defaultValues.push({ name: '' });
            this.propChanged('defaultValues');
        },
        deleteDefaultValue(i) {
            this.props.defaultValues = this.props.defaultValues.filter((item, index) => index !== i);
            this.propChanged('defaultValues');
        },
        onResetOptionsChange() {
            this.props.multiMode = false;
            this.props.multiCount = false;
            this.propChanged(['multiMode', 'multiCount', 'noReset']);
        },
        /**
         * @param {import('../descriptor').FilterItem}
         * @param {string} data
         */
        setFilterData(filter, data) {
            try {
                filter.data = JSON.parse(data);
            } catch (e) {
                // noop
            }
        },
        /**
         * @param {import('../descriptor').FilterItem}
         * @param {string} data
         */
        getFilterData({ data }) {
            try {
                return JSON.stringify(data);
            } catch (e) {
                return String(data);
            }
        },
        saveFilters() {
            const { filters } = this.props;
            this.props.filters = filters.filter(({ name }) => name.length > 0);
            this.propChanged('filters');
        },
        /**
         * @param {import('../descriptor').FilterItem} filter
         * @param {number} index
         */
        onFilterChange({ name }, index) {
            if (name == null || name.length === 0) {
                return;
            }
            const { filters } = this.props;
            const foundIndex = filters.findIndex((el) => el.name === name);
            if (foundIndex !== index && foundIndex >= 0) {
                filters.splice(foundIndex, 1);
            }
            this.saveFilters();
        },
        /**
         * @param {import('../descriptor').FilterItem} filter
         */
        onFilterDelete(filter) {
            this.props.filters = this.props.filters.filter((el) => el !== filter);
            this.saveFilters();
        },
        onFilterAdd() {
            const { filters } = this.descriptor.props;
            this.props.filters.push(filters.factory());
            this.propChanged('filters');
        }
    }
};
</script>
