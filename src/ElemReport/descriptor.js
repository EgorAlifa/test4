import panels from './panels';

/**
 * @typedef {object} ReportData
 * @property {string} name                      name
 * @property {string|number} datasetIndex       dataset index
 */
/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({});

export const Events = Object.freeze({
    RUN_REPORT: 'runReport',
    START_RUNNING: 'startRunning',
    END_RUNNING: 'endRunning'
});

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        reportTemplate: {
            type: String,
            default: ''
        },
        reportCustomName: {
            type: String,
            default: '',
            label: 'Пользовательское название отчета'
        },
        reportDatasets: {
            type: Array,
            default: () => []
        },
        reportServiceUrl: {
            type: String,
            default: '%report%'
        },
        events: {
            type: Object,
            default() {
                return {
                    [Events.RUN_REPORT]: 'report/run',
                    [Events.START_RUNNING]: 'report/start',
                    [Events.END_RUNNING]: 'report/end'
                };
            }
        },
        shouldShowPreloader: {
            type: Boolean,
            default: true,
            label: 'Прелоадер при загрузке'
        },
        shouldDownloadInEditorMode: {
            type: Boolean,
            default: true,
            label: 'Скачивать в режиме редактора'
        },
        shouldDownloadWithoutAuth: {
            type: Boolean,
            default: false,
            label: 'Скачивать без авторизации'
        },
        shouldDownloadWithFolderName: {
            type: Boolean,
            default: true,
            label: 'Скачивать с названием папки'
        },
        shouldDownloadWithCurrentDate: {
            type: Boolean,
            default: false,
            label: 'Добавить в название дату скачивания'
        },
        shouldFixRowHeights: {
            type: Boolean,
            default: false,
            label: 'Фиксировать высоту строк'
        },
        reportNameEntities: {
            type: Array,
            default: () => [],
            label: 'Измерения/метрики в названии отчета'
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    events: {
        [Events.RUN_REPORT]: {
            listen: `events[${Events.RUN_REPORT}]`
        },
        [Events.START_RUNNING]: {
            trigger: `events[${Events.START_RUNNING}]`
        },
        [Events.END_RUNNING]: {
            trigger: `events[${Events.END_RUNNING}]`
        }
    },
    cssVars: {}
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: true,
    slotNames: ['default']
};

export default descriptor;
