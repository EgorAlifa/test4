import { merge, isEqual } from 'lodash';
import { hasFieldNumberType } from '@goodt-widgets-insight/table-common';
import { descriptor as ElemHeaderDescriptor } from '../ElemHeader/descriptor';
import { descriptor as ElemValueDescriptor } from '../ElemValue/descriptor';
import { descriptor as ElemRowDescriptor } from '../ElemRow/descriptor';
import { descriptor as ElemPaginatorDescriptor } from '../ElemPaginator/descriptor';
import { AREA, WidgetType, FRACTION, GAP, COLUMN_WIDTH, TableSlot } from './constants';

/**
 * @typedef {import('@goodt-wcore/core').IElemInstance} ElemInstance
 */

/**
 * @param {(Object) => ElemInstance} createEntity
 * @param {string[]} dataFields
 * @param {Record<string, any>[]} schema
 * @return {ElemInstance[]}
 */
export const buildTableChildren = (createEntity, dataFields, schema) => {
    const buildPropsDefault = (props) =>
        Object.fromEntries(
            Object.entries(props).map(([key, value]) =>
                typeof value.default === 'function' ? [key, value.default()] : [key, value.default]
            )
        );
    const headerPropsDefault = buildPropsDefault(ElemHeaderDescriptor().props);
    const rowPropsDefault = buildPropsDefault(ElemRowDescriptor().props);
    const cellPropsDefault = buildPropsDefault(ElemValueDescriptor().props);
    const paginatorPropsDefault = buildPropsDefault(ElemPaginatorDescriptor().props);

    const tableHeadersFactory = () =>
        dataFields.map((dataField, idx) => {
            const slot = `${AREA}-${idx}`;
            const [{ type: fieldType }] = schema.filter(({ name }) => name === dataField);

            return createEntity({
                type: WidgetType.TABLE_HEADER,
                props: merge({}, headerPropsDefault, {
                    slot,
                    dataField,
                    header: {
                        fontSize: 'var(--font-size-smaller)',
                        sort: {
                            field: dataField
                        }
                    },
                    cssClass: hasFieldNumberType(fieldType) ? ['d-flex', 'flex-h-end'] : ['d-flex'],
                    cssStyle: {
                        padding: '0.375rem'
                    }
                })
            });
        });

    const tableCellsFactory = () =>
        dataFields.map((dataField, idx) =>
            createEntity({
                type: WidgetType.TABLE_CELL,
                props: merge({}, cellPropsDefault, {
                    slot: `${AREA}-${idx}`,
                    dataField,
                    style: {
                        fontSize: 'var(--font-size-smaller)',
                        fontWeight: '400'
                    },
                    cssStyle: {
                        padding: '0.375rem'
                    }
                })
            })
        );

    const gridLayoutFactory = ({ slot = '', children }) =>
        createEntity({
            type: WidgetType.GRID_LAYOUT,
            props: {
                slot,
                grid: {
                    areas: [dataFields.map((_, idx) => `${AREA}-${idx}`)],
                    rows: [FRACTION],
                    cols: new Array(dataFields.length).fill(COLUMN_WIDTH),
                    gap: {
                        row: GAP,
                        col: GAP
                    }
                }
            },
            children
        });

    return [
        gridLayoutFactory({
            slot: TableSlot.HEADER,
            children: tableHeadersFactory()
        }),
        createEntity({
            type: WidgetType.TABLE_ROW,
            props: merge({}, rowPropsDefault, {
                style: {
                    select: {
                        bgColor: 'rgba(245, 252, 255, 1)'
                    }
                },
                border: {
                    isDisplayed: true,
                    color: 'rgba(226, 226, 226, 1)'
                }
            }),
            children: [
                gridLayoutFactory({
                    children: tableCellsFactory()
                })
            ]
        }),
        createEntity({
            type: WidgetType.TABLE_PAGINATOR,
            props: merge({}, paginatorPropsDefault, {
                slot: TableSlot.FOOTER,
                style: {
                    fontSize: 'var(--font-size-smaller)',
                    height: 'var(--font-size-smaller)',
                    width: '0rem'
                }
            })
        })
    ];
};

/**
 * @param {any[]} arr
 * @param {any} value
 * @param {boolean} [mayContainMultiple]
 * @param {boolean} [shouldFilterSingleValue=true]
 * @return {any[]}
 */
export const filterOrExtendWith = (arr, value, mayContainMultiple, shouldFilterSingleValue = true) => {
    const hasValue = arr.some((item) => isEqual(item, value));

    if (mayContainMultiple) {
        return hasValue ? arr.filter((item) => isEqual(item, value) === false) : [...arr, value];
    }
    return hasValue && shouldFilterSingleValue ? [] : [value];
};
