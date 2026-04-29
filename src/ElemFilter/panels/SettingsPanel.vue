<template>
    <ui-panel-container>
        <ui-container>
            <ui-switch prop="loadDataOnOpen"></ui-switch>
            <ui-switch prop="isMenuAlwaysOpen">Раскрыт всегда в редакторе</ui-switch>

            <ui-has-panel>
                <div class="form-label form-label-small">Стилизация</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки', slot: 'default' }]">
                        <ui-container>
                            <ui-has-panel>
                                <ui-label label-size="small">Плейсхолдер</ui-label>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Плейсхолдер', slot: 'default' }]">
                                        <template>
                                            <ui-container>
                                                <ui-input prop="textPlaceholder">Текст</ui-input>
                                                <ui-switch prop="isMetricTextPlaceholder">Название измерения</ui-switch>
                                                <ui-complex-font v-model="placeholderSettingsFont"></ui-complex-font>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-label label-size="small">Список</ui-label>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Список', slot: 'default' }]">
                                        <template>
                                            <ui-container>
                                                <ui-complex-font v-model="dimensionsSettingsFont"></ui-complex-font>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-label label-size="small">Тень</ui-label>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Тень', slot: 'default' }]">
                                        <template>
                                            <ui-container>
                                                <ui-complex-shadow v-model="shadowSettings"></ui-complex-shadow>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-label label-size="small">Граница</ui-label>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Граница', slot: 'default' }]">
                                        <template>
                                            <ui-container>
                                                <ui-complex-border-radius
                                                    v-model="borderRadiusSettings"
                                                    :units="SizeUnits"></ui-complex-border-radius>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-label label-size="small">Тултип</ui-label>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Тултип', slot: 'default' }]">
                                        <template>
                                            <ui-container>
                                                <ui-complex-font
                                                    v-model="tooltipSettingsFont"
                                                    :units="SizeUnits"></ui-complex-font>
                                                <ui-input-cp prop="tooltip.background">Цвет фона</ui-input-cp>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox prop="optionHover.isEnabled">Ховер</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Ховер', slot: 'default' }]">
                                        <template>
                                            <ui-container>
                                                <ui-input-cp prop="optionHover.background">Фон</ui-input-cp>
                                                <ui-input-cp prop="optionHover.color">Текст</ui-input-cp>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox :disabled="props.isMultiMode" prop="isSingleSelectBacklight">
                                    Цвет подсветки
                                    <template #hint>
                                        Задает цвет для выбранного значения внутри списка значений фильтра. Не работает
                                        с мультиселектом.
                                    </template>
                                </ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Настройка подсветки', slot: 'searchMode' }]">
                                        <template #searchMode>
                                            <ui-input-cp
                                                prop="selectedDimensionBacklightColor"
                                                @input="propChanged('selectedDimensionBacklightColor')">
                                                Цвет
                                            </ui-input-cp>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-input-cp prop="widgetColor">Цвет виджета</ui-input-cp>

                            <ui-input-units prop="iconFontSize" :units="SizeUnits">
                                Размер иконки сворачивания
                            </ui-input-units>

                            <ui-input-units prop="sizeHeight" :units="SizeUnits">
                                Максимальная высота
                                <template #hint>Позволяет регулировать высоту раскрываемого списка фильтра.</template>
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="shouldMuteFiltrationRows">
                Индикация отфильтрованного
                <template #hint>Значения остаются в списке, но блокируются для любого взаимодействия</template>
            </ui-switch>

            <ui-has-panel>
                <ui-checkbox :disabled="props.isMultiMode" prop="shouldShowRadioButton">Радиокнопки</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Радиокнопки', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="radioButtonSettings.backlight">Цвет подсветки</ui-input-cp>

                            <ui-input-units prop="radioButtonSettings.size" :units="SizeUnits">
                                Размер радиокнопки
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox :disabled="props.shouldShowRadioButton" prop="isMultiMode">Мультиселект</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Мультиселект', slot: 'default' }]">
                        <ui-container>
                            <ui-input-cp prop="backlight">Цвет подсветки</ui-input-cp>

                            <ui-input-units prop="checkboxFontSize" :units="SizeUnits">Размер чекбокса</ui-input-units>

                            <ui-switch prop="isResetToDefault">
                                Сброс до дефолта
                                <template #hint>
                                    Если при первичной загрузке страницы в хранилище имеется параметр, который фильтр
                                    подхватывает по умолчанию,
                                    <br />
                                    то при выборе других значений фильтра и их последующем сбросе - сброс произойдет до
                                    дефолтного параметра.
                                    <br />
                                    Настройка предназначена для режима мультиселект.
                                </template>
                            </ui-switch>

                            <ui-has-panel>
                                <ui-checkbox prop="isMultiCount">Подсчет</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Подсчет', slot: 'default' }]">
                                        <template>
                                            <ui-container>
                                                <ui-input prop="textPlaceholderMultiCount.text">
                                                    Текст плейсхолдера
                                                </ui-input>

                                                <ui-complex-font
                                                    v-model="textPlaceholderSettingsFont"></ui-complex-font>

                                                <ui-input prop="multiCountTextUnit">Текст единиц измерений</ui-input>

                                                <ui-input-units prop="multiCountSizeUnit" :units="SizeUnits">
                                                    Размер единиц измерений
                                                </ui-input-units>
                                            </ui-container>
                                        </template>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="isClearEnable" :disabled="!props.isMultiMode">Кнопки действий</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Кнопки действий', slot: 'default' }]">
                        <ui-container>
                            <ui-has-panel>
                                <ui-checkbox prop="shouldShowBtnSelectAll">Выбрать все</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Выбрать все', slot: 'default' }]">
                                        <ui-container>
                                            <ui-btn-settings prop="btnSelectAll"></ui-btn-settings>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox v-model="isBtnClearShown">Сбросить все</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Сбросить все', slot: 'default' }]">
                                        <ui-container>
                                            <ui-btn-settings prop="btnClear"></ui-btn-settings>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox v-model="isBtnCancelShown" :disabled="!isBtnDoShown">Отменить</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Отменить', slot: 'default' }]">
                                        <ui-container>
                                            <ui-btn-settings prop="btnCancel"></ui-btn-settings>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox v-model="isBtnDoShown">Применить</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Применить', slot: 'default' }]">
                                        <ui-container>
                                            <ui-btn-settings prop="btnDo"></ui-btn-settings>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox v-model="isBtnPasteFromClipboardShown">Вставка из буфера</ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Вставка из буфера', slot: 'default' }]">
                                        <ui-container>
                                            <ui-btn-settings prop="btnPasteFromClipboard"></ui-btn-settings>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="sort.isEnabled">Сортировка</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Сортировка', slot: 'default' }]">
                        <ui-container>
                            <ui-complex-font v-model="sortSettingsFont"></ui-complex-font>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="isSearchMode">Режим поиска</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Режим поиска', slot: 'default' }]">
                        <ui-container>
                            <ui-has-panel>
                                <div class="form-label form-label-small">Плейсхолдер</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Плейсхолдер', slot: 'default' }]">
                                        <ui-container>
                                            <ui-input prop="searchModeInput.placeholder">Текст</ui-input>
                                            <ui-switch prop="searchModeInput.isMetricTextPlaceholder">
                                                Название измерения
                                            </ui-switch>
                                            <ui-complex-font v-model="searchModeInputSettingsFont"></ui-complex-font>
                                            <ui-input-cp prop="inputBackgroundColor">Цвет поля поиска</ui-input-cp>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <div class="form-label form-label-small">Префикс</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Префикс', slot: 'default' }]">
                                        <ui-container>
                                            <ui-input-units prop="searchModeInput.marginLeft" :units="SizeUnits">
                                                Отступ от иконки префикса
                                            </ui-input-units>

                                            <ui-input prop="searchModeInput.prefix">Префикс</ui-input>

                                            <ui-input-units prop="searchModeInput.prefixMarginLeft" :units="SizeUnits">
                                                Отступ префикса
                                            </ui-input-units>

                                            <ui-input-units prop="searchModeInput.prefixFontSize" :units="SizeUnits">
                                                Размер префикса
                                            </ui-input-units>

                                            <ui-input-cp
                                                prop="searchModeInput.prefixColor"
                                                @input="propChanged('searchModeInput')">
                                                Цвет префикса
                                            </ui-input-cp>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <div class="form-label form-label-small">Постфикс</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Постфикс', slot: 'default' }]">
                                        <ui-container>
                                            <ui-input-units
                                                prop="searchModeInput.postfixMarginRight"
                                                :units="SizeUnits">
                                                Отступ постфикса
                                            </ui-input-units>

                                            <ui-input-units prop="searchModeInput.postfixFontSize" :units="SizeUnits">
                                                Размер постфикса
                                            </ui-input-units>

                                            <ui-input-cp
                                                prop="searchModeInput.postfixColor"
                                                @input="propChanged('searchModeInput')">
                                                Цвет постфикса
                                            </ui-input-cp>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <div class="form-label form-label-small">Граница</div>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Граница', slot: 'default' }]">
                                        <ui-container>
                                            <ui-input-units prop="searchModeInput.borderWidth" :units="SizeUnits">
                                                Толщина границ
                                            </ui-input-units>

                                            <ui-input-cp prop="searchModeInput.borderColor">Цвет границ</ui-input-cp>

                                            <ui-input-units prop="searchModeInput.borderRadius" :units="SizeUnits">
                                                Скругление границ
                                            </ui-input-units>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-has-panel>
                                <ui-checkbox prop="isSmartSearch">
                                    Умный поиск
                                    <template #hint>
                                        Преобразует виджет в поисковую систему на основе нескольких источников данных,
                                        <br />
                                        позволяя искать по вложенностям в слоте с помощью проверки соответствия строк,
                                        <br />
                                        настроенных в датасете измерений, с вводимым значением.
                                    </template>
                                </ui-checkbox>
                                <template #panel>
                                    <ui-panel :groups="[{ name: 'Умный поиск', slot: 'default' }]">
                                        <ui-container>
                                            <ui-select prop="closingMode" :options="CloseOptions">
                                                Вариант закрытия
                                            </ui-select>
                                            <ui-switch prop="isQuickInput">Быстрый поиск</ui-switch>
                                            <ui-switch prop="isOpeningByEnter">Открытие по enter</ui-switch>
                                            <ui-input prop="headerPadding">Padding заголовка</ui-input>
                                            <ui-input prop="contentPadding">Padding контента</ui-input>
                                            <ui-input prop="contentBoxShadow">Тень контента</ui-input>
                                            <ui-switch prop="isResizable">
                                                Изменяемый размер
                                                <template #hint>
                                                    Размер раскрытого списка определяется его содержимым.
                                                </template>
                                            </ui-switch>
                                            <ui-input-units prop="smartSearchHeight" :units="SizeUnits">
                                                Высота виджета
                                            </ui-input-units>
                                            <ui-input-units prop="openWidth" :units="SizeUnits">
                                                Ширина при раскрытии
                                            </ui-input-units>
                                            <ui-switch prop="isSmartSearchGeneralPreview">По умолчанию пусто</ui-switch>
                                            <ui-switch prop="shouldDisableContentHiding">
                                                Запрет на скрытие окна
                                            </ui-switch>

                                            <ui-switch prop="isListeningVar">Слушать переменную поиска</ui-switch>
                                        </ui-container>
                                    </ui-panel>
                                </template>
                            </ui-has-panel>

                            <ui-switch prop="shouldClearSearchValueOnFetchDataEvent">
                                Сброс поля поиска
                                <template #hint>
                                    При получении "события для обновления виджета"
                                    <br />
                                    произойдет сброс введенного пользователем текста в поле поиска
                                </template>
                            </ui-switch>

                            <ui-input type="number" prop="minSearchingLength">
                                Количество символов для начала поиска
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox :disabled="props.isSearchMode" prop="embeddedSearch.isEnabled">
                    Встроенный поиск
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Встроенный поиск', slot: 'default' }]">
                        <ui-container>
                            <ui-switch prop="embeddedSearch.isMetricTextPlaceholder">Название измерения</ui-switch>
                            <ui-complex-font v-model="embeddedPlaceholderSettingsFont"></ui-complex-font>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="isGeneralPreview">
                Общий предпросмотр
                <template #hint>
                    Скрывает список значений до момента использования поиска -
                    <br />
                    при вводе символов появляются подходящие значения списка.
                </template>
            </ui-switch>

            <ui-has-panel>
                <ui-checkbox prop="shouldSelectFirstValue">Первое значение списка</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Первое значение списка', slot: 'default' }]">
                        <ui-container>
                            <ui-switch :disabled="!props.shouldSelectFirstValue" prop="isAlwaysFirstValue">
                                При фильтрации списка
                                <template #hint>
                                    Осуществляет выбор первого значения списка при любых взаимодействиях,
                                    <br />
                                    в том числе при фильтрации списка.
                                </template>
                            </ui-switch>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="customEvent.enable">События</ui-checkbox>
                <template #panel>
                    <ui-panel
                        :groups="[
                            { name: 'Статическое', slot: 'static' },
                            { name: 'Динамическое', slot: 'dynamic' }
                        ]">
                        <template #static>
                            <ui-container>
                                <ui-input prop="customEvent.onSelectName">Имя события при селекте</ui-input>
                                <ui-input prop="customEvent.onResetName">Имя события при сбросе</ui-input>
                            </ui-container>
                        </template>
                        <template #dynamic>
                            <ui-container>
                                <ui-switch prop="dynamicEvent.enable">Динамическое имя события</ui-switch>
                                <ui-select prop="dynamicEvent.onSelectName" :options="dimensionMetricOptions">
                                    Имя события - значение поля
                                </ui-select>
                                <ui-input prop="dynamicEvent.onResetName">Имя события при сбросе</ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox :disabled="props.isMultiMode" prop="isTrimTheLine">Обрезать текст</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Обрезать текст', slot: 'default' }]">
                        <ui-input type="number" prop="cutStringLength">Количество символов</ui-input>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="isAwaitVariableMode">Ожидать фильтрацию из хранилища</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Параметры ожидания переменных', slot: 'default' }]">
                        <ui-select
                            prop="awaitVariableModeSettings.variables"
                            :options="awaitModeVariableOptions"
                            multiple>
                            Переменные
                        </ui-select>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="isShowMenuByCursor">Раскрытие по наведению</ui-switch>

            <ui-switch prop="isNoFullReset" @change="onResetOptionsChange">
                Без полного сброса
                <template #hint>Отключает возможность сбрасывать выбранные значения в фильтре.</template>
            </ui-switch>

            <ui-has-panel>
                <div class="text-small form-label">Переменные при сбросе</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Переменные при сбросе', slot: 'default' }]">
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
                class="default-value-item d-flex flex-h-space-between">
                <ui-input v-model="item.name" @change="propChanged('defaultValues')">Значение по умолчанию</ui-input>
                <div class="btn btn-icon btn-small">
                    <div class="icon cursor-pointer" @click="deleteDefaultValue(index)">
                        <i class="mdi mdi-close"></i>
                    </div>
                </div>
            </div>

            <ui-select prop="excludedField" :options="dimensionMetricOptions">
                Полe для исключения
                <template #hint>
                    При отправке значения, выбранного здесь поля, кастомной
                    <br />
                    переменной "exclude_filter_value" - значение будет исключено.
                </template>
            </ui-select>
            <ui-switch prop="isChangeCategoryResetValues" />
            <ui-switch prop="isQueryFilterOperatorLike"></ui-switch>
            <ui-switch prop="moveSelectedValue"></ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { UiComplexFont, UiComplexShadow, UiComplexBorderRadius } from '@goodt-wcore/panel-ui';
// eslint-disable-next-line no-restricted-syntax
import { createFont, createShadow, createBorderRadius } from '@goodt-wcore/panel-ui/utils';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { FontWeightOptions, SizeUnits } from '@goodt-wcore/panels';
import { CloseOptions } from '../config';
import { PanelInstanceTypeDescriptor } from '../types';

// eslint-disable-next-line import/no-cycle
import { Events } from '../descriptor';
import { UiBtnSettings } from './components';

export default {
    extends: Panel,
    components: { UiBtnSettings, UiComplexFont, UiComplexShadow, UiComplexBorderRadius },
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    static: {
        CloseOptions,
        Events,
        SizeUnits,
        FontWeightOptions: [{ label: 'Наследуемый', value: 'inherit' }, ...FontWeightOptions]
    },
    computed: {
        searchModeInputSettingsFont: {
            get() {
                return createFont(this.props.searchModeInput);
            },
            set(value) {
                this.props.searchModeInput = {
                    ...this.props.searchModeInput,
                    ...value
                };
                this.propChanged('searchModeInput');
            }
        },
        sortSettingsFont: {
            get() {
                return createFont(this.props.sort);
            },
            set(value) {
                this.props.sort = {
                    ...this.props.sort,
                    ...value
                };
                this.propChanged('sort');
            }
        },
        embeddedPlaceholderSettingsFont: {
            get() {
                return createFont(this.props.embeddedSearch);
            },
            set(value) {
                this.props.embeddedSearch = {
                    ...this.props.embeddedSearch,
                    ...value
                };
                this.propChanged('embeddedSearch');
            }
        },
        placeholderSettingsFont: {
            get() {
                return createFont(this.props.placeholderStyles);
            },
            set(value) {
                this.props.placeholderStyles = {
                    ...this.props.placeholderStyles,
                    ...value
                };
                this.propChanged('placeholderStyles');
            }
        },
        dimensionsSettingsFont: {
            get() {
                return createFont(this.props.dimensionsStyles);
            },
            set(value) {
                this.props.dimensionsStyles = {
                    ...this.props.dimensionsStyles,
                    ...value
                };
                this.propChanged('dimensionsStyles');
            }
        },
        shadowSettings: {
            get() {
                return createShadow(this.props.shadowStyles);
            },
            set(value) {
                this.props.shadowStyles = {
                    ...this.props.shadowStyles,
                    ...value
                };
                this.propChanged('shadowStyles');
            }
        },
        borderRadiusSettings: {
            get() {
                return createBorderRadius(this.props.borderRadius);
            },
            set(value) {
                this.props.borderRadius = {
                    ...this.props.borderRadius,
                    ...value
                };
                this.propChanged('borderRadius');
            }
        },
        textPlaceholderSettingsFont: {
            get() {
                return createFont(this.props.textPlaceholderMultiCount);
            },
            set(value) {
                this.props.textPlaceholderMultiCount = {
                    ...this.props.textPlaceholderMultiCount,
                    ...value
                };
                this.propChanged('textPlaceholderMultiCount');
            }
        },
        tooltipSettingsFont: {
            get() {
                return createFont(this.props.tooltip);
            },
            set(value) {
                this.props.tooltip = {
                    ...this.props.tooltip,
                    ...value
                };
                this.propChanged('tooltip');
            }
        },
        /**
         * @return {array}
         */
        dimensionMetricOptions() {
            return this.buildOptions(this.dimensionsMetrics, { empty: true });
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
                if (val === false) {
                    this.isBtnCancelShown = false;
                }
                this.propChanged('btnDo');
            }
        },
        isBtnPasteFromClipboardShown: {
            get() {
                const { btnPasteFromClipboard } = this.props;
                return btnPasteFromClipboard.isShown ?? true;
            },
            set(val) {
                const { btnPasteFromClipboard } = this.props;
                btnPasteFromClipboard.isShown = val;
                this.propChanged('btnPasteFromClipboard');
            }
        },
        isBtnCancelShown: {
            get() {
                const { btnCancel } = this.props;
                return btnCancel.isShown ?? true;
            },
            set(val) {
                const { btnCancel } = this.props;
                btnCancel.isShown = val;
                this.propChanged('btnCancel');
            }
        },
        awaitModeVariableOptions() {
            return Object.keys({
                ...this.descriptor.vars,
                ...this.elementInstance?.descriptor.vars
            }).sort();
        }
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes,

        addDefaultValue() {
            this.props.defaultValues.push({ name: '' });
            this.propChanged('defaultValues');
        },
        deleteDefaultValue(i) {
            this.props.defaultValues = this.props.defaultValues.filter((item, index) => index !== i);
            this.propChanged('defaultValues');
        },
        onResetOptionsChange() {
            this.props.isMultiMode = false;
            this.props.isMultiCount = false;
            this.propChanged(['isMultiMode', 'isMultiCount']);
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
<style scoped>
.default-value-item {
    align-items: flex-end;
}
</style>
