/* eslint-disable no-restricted-syntax */
import { StoreOperation } from '@goodt-wcore/elem';
import panels from './panels';
import {
    createCellSettings,
    createSubtotalSettings,
    TotalPositions,
    VerticalAligns,
    TableDrawTypes,
    MetricsPosition
} from './utils/constants';
import { cssVars } from './styles/css-vars';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({
    SETTINGS: 'settings'
});

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        reportApplicationApiUrl: {
            type: String,
            default: '%report%'
        },
        height: {
            type: String,
            default: '100'
        },
        rows: {
            type: Array,
            default: () => []
        },
        baseRowsSettings: {
            type: Object,
            default: () =>
                createCellSettings({
                    spaceBackgroundColor: '#DCDFE4',
                    fontSize: '1rem',
                    width: '150px'
                })
        },
        columns: {
            type: Array,
            default: () => []
        },
        baseColumnsSettings: {
            type: Object,
            default: () => createCellSettings({ fontSize: '1rem', width: '150px' })
        },
        values: {
            type: Array,
            default: () => []
        },

        baseValuesSettings: {
            type: Object,
            default: () =>
                createCellSettings({
                    verticalAlign: VerticalAligns.RIGHT
                })
        },
        rowsHeight: {
            type: Number,
            // eslint-disable-next-line no-magic-numbers
            default: 48
        },
        titleHeight: {
            type: Number,
            // eslint-disable-next-line no-magic-numbers
            default: 48
        },
        cellWidth: {
            type: String,
            // eslint-disable-next-line no-magic-numbers
            default: '150px'
        },
        columnsWidth: {
            type: String,
            // eslint-disable-next-line no-magic-numbers
            default: '150px'
        },
        indexesHeight: {
            type: Number,
            // eslint-disable-next-line no-magic-numbers
            default: 32
        },
        isUsedCollapse: {
            type: Boolean,
            default: true,
            label: 'Дриллдаун'
        },
        isUncollapsedAll: {
            type: Boolean,
            default: false,
            label: 'Развернуть все'
        },
        isUsedIndexes: {
            type: Boolean,
            default: true,
            label: 'Нумерация'
        },
        baseIndexesSettings: {
            type: Object,
            default: () => createCellSettings({ backgroundColor: '#F7F8F9' })
        },
        isShownColumnsTotal: {
            type: Boolean,
            default: true
        },
        columnsTotalPosition: {
            type: String,
            default: TotalPositions.START
        },
        columnsTotalSettings: {
            type: Object,
            default: () =>
                createCellSettings({
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    fontWeight: '900',
                    verticalAlign: VerticalAligns.RIGHT,
                    titleSettings: {
                        verticalAlign: VerticalAligns.RIGHT
                    }
                })
        },
        isShownRowTotal: {
            type: Boolean,
            default: true
        },
        rowTotalPosition: {
            type: String,
            default: TotalPositions.START
        },
        rowTotalSettings: {
            type: Object,
            default: () =>
                createCellSettings({
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'rgba(44, 44, 44, 1)',
                    fontWeight: '900',
                    verticalAlign: VerticalAligns.RIGHT
                })
        },
        isDuplicateDimensions: {
            type: Boolean,
            default: true,
            label: 'Дублирование измерений'
        },
        shouldBeFixedHeader: {
            type: Boolean,
            default: true,
            label: 'Закрепить заголовок'
        },
        cssClass: {
            type: Array,
            default: ['bg-white']
        },
        filters: {
            type: Object,
            default: () => ({})
        },
        filtersData: {
            type: Array,
            default: () => []
        },
        toolboxButtonBackground: {
            type: String,
            default: ''
        },
        toolboxButtonFontColor: {
            type: String,
            default: '#8590A2'
        },
        toolboxButtonIconColor: {
            type: String,
            default: '#8590A2'
        },
        toolboxButtonBackgroundHover: {
            type: String,
            default: ''
        },
        toolboxButtonFontColorHover: {
            type: String,
            default: '#0788FF'
        },
        toolboxButtonIconColorHover: {
            type: String,
            default: '#0788FF'
        },
        tableBorderColor: {
            type: String,
            default: '#DCDFE4'
        },
        tableBorderWeight: {
            type: String,
            default: ''
        },
        useFastSearch: {
            type: Boolean,
            default: true,
            label: 'Мгновенный поиск'
        },
        useZebra: {
            type: Boolean,
            default: false,
            label: 'Режим "Зебра"'
        },
        zebraSettings: {
            type: Object,
            default: () =>
                createCellSettings({
                    verticalAlign: '',
                    horizontalAlign: '',
                    backgroundColor: '#fafafa'
                })
        },
        subtotal: {
            type: Object,
            default: createSubtotalSettings()
        },
        xlsxFilename: {
            type: String,
            default: 'Сводная таблица'
        },
        xlsxBlankName: {
            type: String,
            default: 'Лист1'
        },
        xlsxAddDate: {
            type: Boolean,
            default: false
        },
        tableType: {
            type: String,
            default: ''
        },
        canCommitVars: {
            type: Boolean,
            default: true,
            label: 'Триггер переменной'
        },
        canCommitMultiVars: {
            type: Boolean,
            default: true,
            label: 'Мультиселект'
        },
        isReplacingEmptyFields: {
            type: Boolean,
            default: false,
            label: 'Замена пустых ячеек измерений'
        },
        replacingVoidValue: {
            type: String,
            default: '(пусто)',
            label: 'Замена пустот'
        },
        replacingNullValue: {
            type: String,
            default: '(пусто)',
            label: 'Замена null'
        },
        tableDrawType: {
            type: String,
            default: TableDrawTypes.TABLE,
            label: 'Тип отображения'
        },
        metricsPosition: {
            type: String,
            default: MetricsPosition.COLUMNS,
            label: 'Позиция метрик'
        },
        canDropFiltersAfterStoreChange: {
            type: Boolean,
            default: false,
            label: 'Обновлять фильтры хранилищем'
        },
        shouldFilterFiltersOnStoreChange: {
            type: Boolean,
            default: false,
            label: 'Обновлять список фильтров хранилищем'
        },
        isPagination: {
            type: Boolean,
            default: true,
            label: 'Пагинация'
        },
        playerConditions: {
            type: Array,
            default: () => []
        },
        shouldShowFieldActions: {
            type: Boolean,
            default: false,
            label: 'Выбор/сброс полей'
        },
        shouldShowAggregateNames: {
            type: Boolean,
            default: true,
            label: 'Отображать названия агрегаций'
        },
        shouldShowFieldSearch: {
            type: Boolean,
            default: false,
            label: 'Поиск по полям'
        },
        isHiddenFiltrationEnabled: {
            type: Boolean,
            default: false,
            label: 'Скрытая фильтрация'
        },
        isDatasetTotalAggregation: {
            type: Boolean,
            default: false,
            label: 'Агрегация источника для итогов'
        },
        shouldHideFilters: {
            type: Boolean,
            default: false,
            label: 'Отключить фильтры'
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    dataset: {
        vars: {
            dimension: {
                operation: StoreOperation.ALL
            }
        }
    }
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: false,
    cssVars
};

export default descriptor;
