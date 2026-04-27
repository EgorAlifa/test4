<template>
    <ui-panel-container>
        <ui-container>
            <ui-file-selector @change="onCreateTemplate">
                <ui-button class="w-100">Добавить шаблон</ui-button>
            </ui-file-selector>
            <template v-if="reportTemplates.length > 0">
                <ui-input :value="searchReportTemplateValue" @input="onReportTemplateSearch">
                    Поиск по шаблонам
                </ui-input>
                <ui-select
                    v-model="props.reportTemplate"
                    v-bind="{ options: searchedReportTemplates, valueField: 'id', labelField: 'id' }"
                    @change="onReportTemplateChange">
                    Шаблон
                </ui-select>
            </template>

            <div>
                <ui-label v-if="reportData.length > 0" label-size="small">Именованные области</ui-label>
                <ui-draggable v-model="reportData" v-bind="dragOptions">
                    <ui-collapse class="p" v-for="(item, i) in props.reportDatasets" :key="i">
                        <template #header>
                            <div class="drag-handle">
                                <span class="cursor-move">{{ item.name }}</span>
                                <i class="mdi mdi-database mar-left-3" v-if="item.datasetIndex" />
                            </div>
                        </template>
                        <ui-select
                            v-model="item.datasetIndex"
                            :options="datasetsOptions"
                            @change="propChanged('reportDatasets')">
                            Источник
                        </ui-select>
                    </ui-collapse>
                </ui-draggable>
            </div>

            <template v-if="props.reportTemplate">
                <ui-input prop="reportCustomName"></ui-input>
                <ui-switch
                    prop="shouldDownloadWithFolderName"
                    :disabled="props.reportCustomName.length > 0"></ui-switch>
                <ui-select
                    prop="reportNameEntities"
                    :options="dimensionsMetrics"
                    multiple
                    :disabled="props.reportCustomName.length > 0"></ui-select>
                <ui-switch prop="shouldDownloadWithCurrentDate"></ui-switch>
                <ui-switch prop="shouldFixRowHeights"></ui-switch>
                <ui-button @click="onDownloadTemplate">Скачать шаблон</ui-button>
                <ui-button type="error" @click="onShowDeletePopup(true)">Удалить шаблон</ui-button>
            </template>

            <ui-switch prop="shouldDownloadInEditorMode"></ui-switch>
            <ui-switch prop="shouldDownloadWithoutAuth"></ui-switch>

            <div class="alert alert-success" v-if="alert.isVisible">
                <div class="alert-body whitespace-pre-wrap">
                    {{ alert.message }}
                </div>
            </div>
        </ui-container>

        <w-confirm-popup
            v-if="shouldShowDeletePopup"
            cancel-btn-text="Нет, я передумал"
            confirm-btn-text="Да, я хочу удалить"
            @cancel="onShowDeletePopup(false)"
            @confirm="onDeleteTemplate">
            <template #main>
                <div>Вы уверены, что хотите удалить шаблон?</div>
                <div>Это действие нельзя отменить.</div>
            </template>
        </w-confirm-popup>

        <w-confirm-popup
            v-if="shouldShowCloneTemplatePopup"
            cancel-btn-text="Нет, отменить загрузку"
            confirm-btn-text="Да, я хочу заменить"
            @cancel="onShowCloneTemplatePopup(false)"
            @confirm="onCreateCloneTemplate">
            <template #main>
                <div>Шаблон с таким именем уже существует</div>
                <div>Вы хотите заменить его?</div>
            </template>
        </w-confirm-popup>
    </ui-panel-container>
</template>
<script>
import { debounce } from 'lodash';
import { FileSelector as UiFileSelector } from 'goodteditor-ui';
import UiDraggable from 'vuedraggable';
import { Panel } from '@goodt-wcore/panel';
import { downloadBlobAsFile } from '@goodt-common/utils';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { buildReportFilename } from '../utils';
import { PanelInstanceTypeDescriptor } from '../types';
import WConfirmPopup from './components/ConfirmPopup.vue';

const DatasetMixin = usePanelDatasetMixin();

/**
 * @typedef {import('../descriptor').ReportData} ReportData
 */
export default {
    extends: Panel,
    components: {
        UiDraggable,
        WConfirmPopup,
        UiFileSelector
    },
    mixins: [DatasetMixin],
    meta: { name: 'Настройки отчета', icon: 'file-document-edit-outline' },

    data: () => ({
        searchReportTemplateValue: '',
        reportTemplates: [],
        reportTemplateNamespaces: [],
        shouldShowDeletePopup: false,
        shouldShowCloneTemplatePopup: false,
        matchedTemplate: null,
        alert: {
            isVisible: false,
            message: ''
        }
    }),
    static: {
        dragOptions: {
            // eslint-disable-next-line no-magic-numbers
            animation: 200,
            handle: '.drag-handle'
        }
    },
    computed: {
        reportService() {
            return this.elementInstance?.reportService ?? null;
        },
        datasetsOptions() {
            return [
                { label: '-', value: '' },
                ...this.datasetRequests.map(({ name }, index) => ({
                    label: `[${index}]: ${name}`,
                    value: index
                }))
            ];
        },
        reportData: {
            /**
             * @param {ReportData[]} val
             */
            set(val) {
                this.props.reportDatasets = val;
                this.saveReport();
            },
            /**
             * @return {ReportData[]}
             */
            get() {
                return this.props.reportDatasets;
            }
        },
        reportTemplateData() {
            const { reportTemplate } = this.props;

            return this.getTemplateData(reportTemplate);
        },
        searchedReportTemplates() {
            const { searchReportTemplateValue } = this;
            return this.reportTemplates.filter(({ id }) =>
                id.toLowerCase().includes(searchReportTemplateValue.toLowerCase())
            );
        }
    },
    created() {
        this.fetchReportTemplates();
        this.fetchReportTemplateNamespaces();
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes,
        saveReport() {
            this.propChanged();
        },
        getTemplateData(data) {
            const [folder, fileName] = data.split('/');
            return { data, folder, fileName };
        },
        async fetchReportTemplates() {
            const { isSuccess, result } = await this.reportService.getTemplateList();
            if (isSuccess) {
                this.reportTemplates = result;
            }
        },
        async fetchReportTemplateNamespaces() {
            const { reportTemplate } = this.props;
            if (reportTemplate === '' || reportTemplate == null) {
                return;
            }
            const { isSuccess, result } = await this.reportService.getTemplateNamespaces(reportTemplate);

            if (isSuccess) {
                this.reportTemplateNamespaces = result.sort((a, b) => String(a.name).localeCompare(b.name));
            }
        },
        fillReportWithBlankData() {
            this.props.reportDatasets = this.reportTemplateNamespaces.reduce(
                (acc, { name }) => [...acc, { name, datasetIndex: '' }],
                []
            );
        },
        async onReportTemplateChange() {
            await this.fetchReportTemplateNamespaces();
            this.fillReportWithBlankData();
            this.saveReport();
        },
        onReportTemplateSearch: debounce(function (query) {
            this.searchReportTemplateValue = query;
        }, 500),
        async onCreateCloneTemplate() {
            const { folder, fileName } = this.getTemplateData(this.matchedTemplate.template.id);

            const {
                isError,
                result: { result: isTemplateDeleted },
                error
            } = await this.reportService.deleteTemplate({ folder, fileName });

            if (isError) {
                this.handleError(error);
                return;
            }

            if (isTemplateDeleted === true) {
                this.onSendTemplateForCreate(this.matchedTemplate.file);
                this.shouldShowCloneTemplatePopup = false;
            }
        },
        onCreateTemplate(files) {
            const file = files[0];

            if (file == null) {
                return;
            }

            const matchedTemplate = this.reportTemplates.find((template) => {
                const [, templateFileName] = template.id.split('/');
                return file.name === templateFileName;
            });

            this.matchedTemplate = {
                template: matchedTemplate,
                file
            };

            if (matchedTemplate != null) {
                this.onShowCloneTemplatePopup(true);
                return;
            }
            this.onSendTemplateForCreate(file);
        },
        async onSendTemplateForCreate(file) {
            const formData = new FormData();

            formData.append('template', file);

            const { isError, error } = await this.reportService.createTemplate({
                data: formData
            });

            if (isError) {
                this.handleError(error);
                return;
            }

            this.fetchReportTemplates();
            this.notify('Шаблон был успешно загружен');
        },
        async onDownloadTemplate() {
            const { shouldDownloadWithFolderName, shouldDownloadWithCurrentDate } = this.props;
            const { data: filePathname, folder, fileName } = this.reportTemplateData;

            const { isError, result, error } = await this.reportService.downloadTemplate({
                folder,
                fileName
            });

            if (isError) {
                this.handleError(error);
                return;
            }

            const { filename, ext } = buildReportFilename(filePathname, {
                withCurrentDate: shouldDownloadWithCurrentDate,
                withFolderName: shouldDownloadWithFolderName
            });

            downloadBlobAsFile(result, { filename: [filename, ext].join('.') }, { URL, document });
        },
        async onDeleteTemplate() {
            const { folder, fileName } = this.reportTemplateData;

            const {
                isError,
                result: { result: isTemplateDeleted },
                error
            } = await this.reportService.deleteTemplate({
                folder,
                fileName
            });

            if (isError) {
                this.handleError(error);
                return;
            }

            if (isTemplateDeleted === true) {
                this.fetchReportTemplates();
                this.props.reportTemplate = '';
                this.props.reportDatasets = [];
                this.saveReport();
                this.shouldShowDeletePopup = false;
            }
        },
        onShowDeletePopup(value) {
            this.shouldShowDeletePopup = value;
        },
        onShowCloneTemplatePopup(value) {
            this.shouldShowCloneTemplatePopup = value;
        },
        notify(message) {
            this.alert.isVisible = true;
            this.alert.message = message;

            setTimeout(() => {
                this.alert.isVisible = false;
            }, 2000);
        }
    }
};
</script>
