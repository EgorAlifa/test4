import { Query } from '@goodt-common/dremio';
import { ColumnParamFormatTypes } from './constants';
import {
    ValueRender,
    ValueImageRender,
    LinkRender,
    ListRender,
    BenchmarkRender,
    EmployeeRender,
    ProgressRender,
    ProgressWithPhotoRender,
    DrilldownLinkRender,
    EventBusListRender,
    DateRangeRender,
    StatusRender
} from '../renders';

export const sortIconClassesMap = {
    [Query.SORT_TYPE.ASC]: new Map([
        [ColumnParamFormatTypes.NUM, 'mdi-sort-descending'],
        [ColumnParamFormatTypes.DATE, 'mdi-sort-calendar-descending'],
        [null, 'mdi-sort-alphabetical-descending'],
        [undefined, 'mdi-chevron-down']
    ]),
    [Query.SORT_TYPE.DESC]: new Map([
        [ColumnParamFormatTypes.NUM, 'mdi-sort-ascending'],
        [ColumnParamFormatTypes.DATE, 'mdi-sort-calendar-ascending'],
        [null, 'mdi-sort-alphabetical-ascending'],
        [undefined, 'mdi-chevron-up']
    ])
};

export const RenderTypes = {
    VALUE: 'VALUE',
    VALUE_IMG: 'VALUE_IMG',
    LIST: 'LIST',
    LINK: 'LINK',
    BENCHMARK: 'BENCHMARK',
    EMPLOYEE: 'EMPLOYEE',
    PROGRESS: 'PROGRESS',
    PROGRESS_WITH_PHOTO: 'PROGRESS_WITH_PHOTO',
    DRILLDOWN_LINK: 'DRILLDOWN_LINK',
    EVENT_BUS_LIST: 'EVENT_BUS_LIST',
    DATE_RANGE: 'DATE_RANGE',
    STATUS: 'STATUS'
};

export const ColumnRenders = {
    [RenderTypes.VALUE]: {
        name: 'значение',
        component: ValueRender
    },
    [RenderTypes.VALUE_IMG]: {
        name: 'значение картинка',
        component: ValueImageRender
    },
    [RenderTypes.LIST]: {
        name: 'список',
        component: ListRender
    },
    [RenderTypes.LINK]: {
        name: 'ссылка',
        component: LinkRender
    },
    [RenderTypes.BENCHMARK]: {
        name: 'бенчмарк',
        component: BenchmarkRender
    },
    [RenderTypes.EMPLOYEE]: {
        name: 'сотрудник',
        component: EmployeeRender
    },
    [RenderTypes.PROGRESS]: {
        name: 'прогресс',
        component: ProgressRender
    },
    [RenderTypes.PROGRESS_WITH_PHOTO]: {
        name: 'прогресс с фото',
        component: ProgressWithPhotoRender
    },
    [RenderTypes.DRILLDOWN_LINK]: {
        name: 'раскрытие и ссылка',
        component: DrilldownLinkRender
    },
    [RenderTypes.EVENT_BUS_LIST]: {
        name: 'список + ивент',
        component: EventBusListRender
    },
    [RenderTypes.DATE_RANGE]: {
        name: 'диапазон дат',
        component: DateRangeRender
    },
    [RenderTypes.STATUS]: {
        name: 'статус',
        component: StatusRender
    }
};

export const DRAG_ANIMATION_TIME = 200;
