<template>
    <w-panel>
        <ui-container>
            <!-- Основные настройки данных -->
            <ui-fieldset label="Данные">
                <ui-select 
                    prop="metric" 
                    :options="metrics"
                    label="Метрика (количество товаров)"
                    required>
                    <template #help>
                        Выберите метрику для отображения количества товаров
                    </template>
                </ui-select>
                
                <ui-select 
                    prop="dimension" 
                    :options="dimensions"
                    label="Основное измерение (категория товаров)"
                    required>
                    <template #help>
                        Выберите измерение для группировки товаров
                    </template>
                </ui-select>
                
                <ui-select 
                    prop="drilldownName" 
                    :options="drilldowns"
                    label="Дриллдаун">
                    <template #help>
                        Настройка детализации при клике на карточку
                    </template>
                </ui-select>
            </ui-fieldset>

            <!-- Настройки карточек -->
            <ui-fieldset label="Настройки карточек">
                <ui-select 
                    prop="titleField" 
                    :options="dimensions"
                    label="Поле для названия товара">
                    <template #help>
                        Выберите измерение, которое будет использоваться как название товара
                    </template>
                </ui-select>
                
                <ui-select 
                    prop="imageField" 
                    :options="dimensions"
                    label="Поле для изображения">
                    <template #help>
                        Выберите измерение, содержащее URL изображений товаров
                    </template>
                </ui-select>
                
                <ui-select 
                    prop="priceField" 
                    :options="metrics"
                    label="Поле для цены">
                    <template #help>
                        Выберите метрику, которая будет отображаться как цена
                    </template>
                </ui-select>
                
                <ui-select 
                    prop="descriptionField" 
                    :options="dimensions"
                    label="Поле для описания">
                    <template #help>
                        Выберите измерение для краткого описания товара
                    </template>
                </ui-select>
            </ui-fieldset>

            <!-- Стилистика карточек -->
            <ui-fieldset label="Стилистика">
                <ui-select 
                    prop="cardStyle" 
                    :options="cardStyleOptions"
                    label="Стиль карточки">
                    <template #help>
                        Выберите стиль отображения карточек
                    </template>
                </ui-select>
                
                <ui-select 
                    prop="cardSize" 
                    :options="cardSizeOptions"
                    label="Размер карточки">
                    <template #help>
                        Выберите размер карточек
                    </template>
                </ui-select>
                
                <ui-select 
                    prop="colorScheme" 
                    :options="colorSchemeOptions"
                    label="Цветовая схема">
                    <template #help>
                        Выберите цветовую палитру для карточек
                    </template>
                </ui-select>
                
                <ui-checkbox 
                    prop="showBadges"
                    label="Показывать бейджи">
                    <template #help>
                        Отображать бейджи с дополнительной информацией
                    </template>
                </ui-checkbox>
                
                <ui-checkbox 
                    prop="showRatings"
                    label="Показывать рейтинги">
                    <template #help>
                        Отображать звездочки рейтинга
                    </template>
                </ui-checkbox>
            </ui-fieldset>

            <!-- Отображение -->
            <ui-fieldset label="Отображение">
                <ui-select 
                    prop="columnsCount" 
                    :options="columnsCountOptions"
                    label="Количество колонок">
                    <template #help>
                        Выберите количество колонок в сетке
                    </template>
                </ui-select>
                
                <ui-checkbox 
                    prop="showPagination"
                    label="Показывать пагинацию">
                    <template #help>
                        Отображать навигацию по страницам
                    </template>
                </ui-checkbox>
                
                <ui-checkbox 
                    prop="showSearch"
                    label="Показывать поиск">
                    <template #help>
                        Отображать поле поиска по товарам
                    </template>
                </ui-checkbox>
            </ui-fieldset>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    data: () => ({}),
    computed: {
        dimensionsMetricsOptions() {
            return this.buildOptions(this.dimensionsMetrics, { empty: true });
        },
        drilldownDimensionsOptions() {
            return this.$drilldown.getDimensions(this.props.drilldown).map((dimension, index) => ({
                label: dimension,
                value: index
            }));
        },
        
        // Опции для стилистики
        cardStyleOptions() {
            return [
                { label: 'Современный', value: 'modern' },
                { label: 'Классический', value: 'classic' },
                { label: 'Минималистичный', value: 'minimal' },
                { label: 'Карточный', value: 'card' },
                { label: 'Список', value: 'list' }
            ];
        },
        
        cardSizeOptions() {
            return [
                { label: 'Маленький', value: 'small' },
                { label: 'Средний', value: 'medium' },
                { label: 'Большой', value: 'large' },
                { label: 'Очень большой', value: 'xlarge' }
            ];
        },
        
        colorSchemeOptions() {
            return [
                { label: 'Синий', value: 'blue' },
                { label: 'Зеленый', value: 'green' },
                { label: 'Красный', value: 'red' },
                { label: 'Фиолетовый', value: 'purple' },
                { label: 'Оранжевый', value: 'orange' },
                { label: 'Серый', value: 'gray' }
            ];
        },
        
        columnsCountOptions() {
            return [
                { label: '1 колонка', value: 1 },
                { label: '2 колонки', value: 2 },
                { label: '3 колонки', value: 3 },
                { label: '4 колонки', value: 4 },
                { label: '5 колонок', value: 5 }
            ];
        }
    },
    watch: {
        dimensions: {
            handler(dimensions) {
                if (dimensions.includes(this.props.dimension) === false) {
                    this.props.dimension = dimensions[0] ?? '';
                    this.propChanged('dimension');
                }
            },
            immediate: true
        }
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }
};
</script>

