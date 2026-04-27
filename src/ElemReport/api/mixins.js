import { useReportApiServiceMixin } from '@goodt-widgets-insight/api';

/**
 * Миксин для использования ReportApiService вместе с компонентом
 * @type {import('@goodt-common/mixins').IApiServiceMixin}
 */
const reportApiServiceMixin = useReportApiServiceMixin(
    { apiBaseURL: 'props.reportServiceUrl' },
    { name: 'reportService' }
);

/**
 * @type {{ reportApiService: import('@goodt-widgets-insight/api').ReportApiService }}
 */
export const ReportApiServiceMixinTypeDescriptor = undefined;

export const ApiMixins = [reportApiServiceMixin];

export const ApiMixinsTypeDescriptor = {
    ...ReportApiServiceMixinTypeDescriptor
};
