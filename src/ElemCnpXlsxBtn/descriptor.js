/* eslint-disable no-restricted-syntax */
import panels from './panels';
import { BookType, Events } from './constants';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({});

export const descriptor = () => ({
    props: {
        downloadXLSX: {
            type: Object,
            default() {
                return {
                    bookName: 'Goodt table data',
                    buttonClass: ['btn', 'btn-primary', 'btn-small', 'bg-orange'],
                    style: '',
                    iconStyle: '',
                    iconLeft: '',
                    iconRight: 'file-excel',
                    buttonText: 'Выгрузить',
                    sheetName: ''
                };
            }
        },
        isTransposed: {
            type: Boolean,
            default: false
        },
        transposedSettings: {
            type: Object,
            default: () => ({
                firstDimensionAlias: '',
                firstDimensionTitle: '',
                secondDimensionAlias: '',
                metricAlias: '',
                additionalMetricAliases: []
            })
        },
        emptyCellPlaceholder: {
            type: String,
            default: '-'
        },
        datasetTitles: {
            type: Object,
            default: () => ({})
        },
        datasetMapped: {
            type: Array,
            default: () => []
        },
        bookType: {
            type: String,
            default: BookType.XLSX
        },
        events: {
            type: Object,
            default: () => ({
                [Events.REFRESH]: 'refresh'
            })
        },
        isCsvOtherDelimiter: {
            type: Boolean,
            default: false
        },
        csvDelimiter: {
            type: String,
            default: ','
        },
        excludedDataFields: {
            type: Array,
            default: () => []
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    events: {
        [Events.REFRESH]: {
            listen: `events['${Events.REFRESH}']`
        }
    }
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: true,
    slotNames: ['default']
};
