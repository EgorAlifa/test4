<template>
    <w-elem :placeholder="$placeholder">
        <div v-if="isLoading" class="preloader color-primary"></div>
        <slot v-else-if="isBeingPrepared">
            <span class="preloader color-primary"></span>
            <code v-if="isEditorMode">default slot</code>
        </slot>
        <div
            v-else
            :style="props.downloadXLSX.style"
            :class="props.downloadXLSX.buttonClass"
            @click="onClickDownloadBtn">
            <div v-if="props.downloadXLSX.iconLeft" class="icon">
                <i
                    :style="props.downloadXLSX.iconStyle"
                    class="mdi mdi-18px"
                    :class="'mdi-' + props.downloadXLSX.iconLeft"></i>
            </div>
            {{ props.downloadXLSX.buttonText }}
            <div v-if="props.downloadXLSX.iconRight" class="icon">
                <i
                    :style="props.downloadXLSX.iconStyle"
                    class="mdi mdi-18px"
                    :class="'mdi-' + props.downloadXLSX.iconRight"></i>
            </div>
        </div>
    </w-elem>
</template>
<script>
import XLSX from 'xlsx';
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin } from '@goodt-common/data';
import { meta } from './descriptor';
import { DEFAULT_BOOK_NAME, MAX_SHEET_NAME_LENGTH, Events, BookType } from './constants';
import { resolveCsv, downloadEncodedCsvAsFile } from './utils';
import { ElemInstanceTypeDescriptor } from './types';

const DatasetMixin = useElemDatasetMixin();

export default {
    extends: Elem,
    mixins: [DatasetMixin],
    meta,
    hooks: {
        before(cancel) {
            if (this.isButtonClicked === false) {
                cancel();
            }
        },
        async then() {
            await this.downloadData();
            this.isBeingPrepared = false;
        }
    },
    data: (/* vm */) => ({
        isBeingPrepared: false,
        isButtonClicked: false,
        ...ElemInstanceTypeDescriptor
    }),
    computed: {
        dremioResultRows() {
            return this.result?.rows ?? [];
        },
        classicRowHeaderItems() {
            if (!this.hasDataset) {
                return [];
            }
            const { excludedDataFields } = this.props;

            return [...this.dimensions, ...this.metrics].filter(
                (fieldName) => excludedDataFields.includes(fieldName) === false
            );
        },
        summaryRows() {
            return this.isTransposedMode ? this.transposedResult : this.classicResult;
        },
        summaryRowHeader() {
            return this.isTransposedMode ? this.transposedSortHeader : this.classicSortHeader;
        },
        classicResult() {
            return this.isClassicMode ? this.dremioResultRows.map(this.buildClassicRow) : [];
        },
        classicSortHeader() {
            if (this.isClassicMode === false) {
                return [];
            }

            const { datasetTitles } = this.props;
            return [...this.classicRowHeaderItems]
                .sort(this.calcColSortOrderByReferenceList)
                .map((name) => datasetTitles[name] ?? name);
        },
        transposedResult() {
            if (this.isTransposedMode === false) {
                return [];
            }

            const {
                transposedSettings: {
                    firstDimensionAlias,
                    firstDimensionTitle,
                    secondDimensionAlias,
                    metricAlias,
                    additionalMetricAliases
                },
                emptyCellPlaceholder,
                datasetTitles
            } = this.props;

            const metricAliasName = this.takeMetricAliasName(metricAlias);
            const titlesMap = Object.entries(datasetTitles);
            const transposedTable = this.dremioResultRows.reduce((table, row) => {
                const formattedRow = Object.fromEntries(
                    Object.entries(row).map(([key, value]) => [
                        key,
                        Number.isNaN(Number(value)) ? value : Number(value)
                    ])
                );
                const existingFirstDimValueRow = table.find(
                    (transposedRow) => transposedRow[firstDimensionTitle] === formattedRow[firstDimensionAlias]
                );

                if (existingFirstDimValueRow != null) {
                    existingFirstDimValueRow[formattedRow[secondDimensionAlias]] = formattedRow[metricAliasName];
                } else {
                    table.push({
                        ...this.buildAdditionalMetric({
                            row: formattedRow,
                            metrics: additionalMetricAliases,
                            titlesMap
                        }),
                        [firstDimensionTitle]: formattedRow[firstDimensionAlias],
                        [formattedRow[secondDimensionAlias]]: formattedRow[metricAliasName] ?? emptyCellPlaceholder
                    });
                }

                return table;
            }, []);

            const uniqueSecondDimensions = transposedTable.reduce((secondDims, row) => {
                secondDims.push(
                    ...Object.keys(row).filter((key) => key !== firstDimensionTitle && !secondDims.includes(key))
                );
                return secondDims;
            }, []);

            transposedTable.forEach((row) => {
                const notPresentedSecondDims = uniqueSecondDimensions.filter(
                    (secDim) => !Object.keys(row).includes(secDim)
                );

                if (notPresentedSecondDims.length > 0) {
                    notPresentedSecondDims.forEach((secDim) => {
                        row[secDim] = emptyCellPlaceholder;
                    });
                }
            });

            return transposedTable;
        },
        transposedSortHeader() {
            if (this.isTransposedMode === false) {
                return [];
            }

            const {
                transposedSettings: { firstDimensionTitle, secondDimensionAlias }
            } = this.props;

            return [
                ...new Set([
                    firstDimensionTitle,
                    ...this.resolveSortedMetricNames,
                    ...this.dremioResultRows.map((row) => row[secondDimensionAlias])
                ])
            ];
        }
    },
    computedEditor: {
        isTransposedMode() {
            return this.props.isTransposed;
        },
        isClassicMode() {
            return this.isTransposedMode === false;
        },
        resolveSortedMetricNames() {
            const {
                transposedSettings: { additionalMetricAliases }
            } = this.props;

            if (additionalMetricAliases == null || additionalMetricAliases.length === 0) {
                return [];
            }
            const filteredCols = Object.entries(this.props.datasetTitles).filter(([key]) =>
                additionalMetricAliases.includes(key)
            );

            const sortedCols = filteredCols.sort(([nameA], [nameB]) =>
                this.calcColSortOrderByReferenceList(nameA, nameB)
            );

            return sortedCols.map(([, value]) => value);
        }
    },
    subscribe: [
        {
            event: Events.REFRESH,
            handler() {
                this.loadData();
            }
        }
    ],
    methods: {
        buildAdditionalMetric({ row, metrics, titlesMap }) {
            if (metrics != null && metrics.length > 0) {
                const selectedMetrics = titlesMap.filter(([key]) => metrics.includes(key));
                return selectedMetrics.reduce((res, [key, value]) => ({ ...res, [value]: row[key] }), {});
            }
            return {};
        },
        takeMetricAliasName(metricAliases) {
            return (Array.isArray(metricAliases) ? metricAliases[0] : metricAliases) ?? '';
        },
        calcColSortOrderByReferenceList(nameA, nameB) {
            const foundNameAIndex = this.props.datasetMapped.indexOf(nameA);
            const foundNameBIndex = this.props.datasetMapped.indexOf(nameB);
            return foundNameAIndex - foundNameBIndex;
        },
        buildClassicRow(row) {
            const { datasetTitles, emptyCellPlaceholder } = this.props;
            const { classicRowHeaderItems } = this;
            return classicRowHeaderItems.reduce((acc, name) => {
                const value = row[name] ?? emptyCellPlaceholder;
                return {
                    ...acc,
                    [datasetTitles[name] ?? name]: Number.isNaN(Number(value)) ? value : Number(value)
                };
            }, {});
        },
        async downloadXlsx() {
            const {
                bookType,
                downloadXLSX: { bookName },
                sheetName
            } = this.props;
            const workbook = XLSX.utils.book_new();
            const worksheet = Object.fromEntries(
                Object.entries(
                    XLSX.utils.json_to_sheet(this.summaryRows, {
                        header: this.summaryRowHeader
                    })
                ).map(([key, value]) => {
                    if (value?.t === 'n') {
                        value.z = '0.00';
                    }
                    return [key, value];
                })
            );

            const fileName = bookName || DEFAULT_BOOK_NAME;
            const workSheetName = (sheetName || fileName).slice(0, MAX_SHEET_NAME_LENGTH);

            XLSX.utils.book_append_sheet(workbook, worksheet, workSheetName);

            return XLSX.writeFile(workbook, `${fileName}.${bookType}`);
        },
        downloadCsv() {
            const {
                csvDelimiter,
                bookType,
                downloadXLSX: { bookName }
            } = this.props;

            const fileName = bookName || DEFAULT_BOOK_NAME;

            const csvFormat = resolveCsv({
                csvDelimiter,
                csvRows: this.summaryRows,
                csvHeaders: this.summaryRowHeader
            });

            return downloadEncodedCsvAsFile(csvFormat, { filename: `${fileName}.${bookType}` });
        },
        async downloadData() {
            const { isCsvOtherDelimiter, bookType } = this.props;

            try {
                if (isCsvOtherDelimiter && bookType === BookType.CSV) {
                    this.downloadCsv();
                } else {
                    await this.downloadXlsx();
                }
            } catch (e) {
                console.error('[ElemCnpXlsxBtn] export failed', e);
            }
        },
        onClickDownloadBtn() {
            this.isButtonClicked = true;
            this.loadData();
            this.isBeingPrepared = true;
            this.isButtonClicked = false;
        }
    }
};
</script>
