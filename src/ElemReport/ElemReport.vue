<template>
    <w-elem :placeholder="$placeholder">
        <div v-if="isLoading" class="report-preloader"></div>
        <div v-else @[rootMouseEventName]="onRootClick">
            <slot>
                <code v-if="isEditorMode">default slot</code>
            </slot>
        </div>
    </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/core';
import { store, unwrapStoreValue } from '@goodt-wcore/managers';
import { ElemDatasetBaseMixinTypes } from '@goodt-common/data';
import { downloadBlobAsFile } from '@goodt-common/utils';
import { buildReportFilename } from './utils';
import { ApiMixins, ApiMixinsTypeDescriptor } from './api';
import { meta, Events } from './descriptor';
import { DatasetMixin } from './mixins';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    extends: Elem,
    meta,
    mixins: [...ApiMixins, DatasetMixin],
    hooks: {
        before(cancel) {
            cancel();
        }
    },
    data: () => ({
        isLoading: false,
        /** @public */
        watchStoreState: false
    }),
    computedEditor: {
        rootMouseEventName() {
            return this.isEditorMode ? 'dblclick' : 'click';
        }
    },
    subscribe: [
        {
            event: Events.RUN_REPORT,
            handler() {
                this.downloadReport();
            }
        }
    ],
    methods: {
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetBaseMixinTypes,
        ...ApiMixinsTypeDescriptor,
        onRootClick() {
            this.downloadReport();
        },
        convertFromStoreValues(value) {
            if (value == null) {
                return value;
            }

            const stringifyValue = JSON.stringify(value);
            const matches = stringifyValue.matchAll(/{{\s*(.*?)\s*}}/g);

            return JSON.parse(
                [...matches].reduce((acc, [match, key]) => {
                    const storeValue = unwrapStoreValue(store.state[key]);
                    return storeValue !== undefined ? acc.replace(match, storeValue) : acc;
                }, stringifyValue)
            );
        },
        /**
         * @return {{name:string, data:Record<string, any>, fieldMappings:Record<string,any>}[]}
         */
        buildReports() {
            return this.props.reportDatasets.map(({ name, datasetIndex }) => {
                /** @type {import('@goodt-common/data').Request} */
                const request = this.requests[datasetIndex];
                if (request == null) {
                    return {
                        name,
                        data: {},
                        fieldMappings: {}
                    };
                }
                // Use the live reactive query so export always matches what the visualization shows.
                // Previously request.query.raw was used, which retained stale platform/cookie
                // filters baked in at page-load time — causing export to diverge from visualization.
                const { query } = request;
                const dimensionsMetrics = [...query.metrics, ...query.dimensions];
                const { $fields, ...restQuery } = query.prepared;
                return {
                    name,
                    data: {
                        query: restQuery,
                        limit: request.limit
                    },
                    fieldMappings: dimensionsMetrics.reduce(
                        (acc, entityName) => ({ ...acc, [entityName]: entityName }),
                        {}
                    )
                };
            });
        },
        async downloadReport() {
            const {
                shouldDownloadInEditorMode,
                /**
                 * @type {string}
                 */
                reportTemplate: templateId,
                reportCustomName,
                shouldDownloadWithFolderName,
                shouldDownloadWithCurrentDate,
                shouldDownloadWithoutAuth,
                shouldShowPreloader,
                reportNameEntities,
                shouldFixRowHeights
            } = this.props;
            if (!shouldDownloadInEditorMode && this.isEditorMode) {
                return;
            }

            this.$eventTrigger(Events.START_RUNNING);
            this.isLoading = shouldShowPreloader;

            const { filename: basename, ext } = buildReportFilename(templateId, {
                customName: this.convertFromStoreValues(reportCustomName),
                withFolderName: shouldDownloadWithFolderName,
                withCurrentDate: shouldDownloadWithCurrentDate,
                entitiesNames: reportNameEntities
            });

            const { isError, result, error } = await this.reportService[
                shouldDownloadWithoutAuth ? 'createReportDatasetPublic' : 'createReportDataset'
            ]({
                templateId,
                templateType: ext,
                data: this.buildReports(),
                fixRowHeights: shouldFixRowHeights,
                fileName: [basename, ext].join('.')
            });

            if (isError) {
                this.handleError(error);
                this.isLoading = false;
                return;
            }

            downloadBlobAsFile(result, { filename: [basename, ext].join('.') });

            this.$eventTrigger(Events.END_RUNNING);
            this.isLoading = false;
        }
    },

    implicitCssModule: true
};
</script>
<style lang="pcss" module src="./style.pcss"></style>
