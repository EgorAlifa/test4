import { useReportApiServiceMixin } from '@goodt-widgets-insight/api';

/**
 * Миксин для использования ReportApiService вместе с компонентом
 * @type {import('@goodt-common/api').IApiServiceMixin}
 */
const reportApiServiceMixin = useReportApiServiceMixin({ apiBaseURL: 'props.reportApplicationApiUrl' });

/**
 * @type {{ reportApiService: import('@goodt-widgets-insight/api').ReportApiService }}
 */
export const ReportApiServiceMixinTypeDescriptor = undefined;

export const ApiMixins = [reportApiServiceMixin];

export const ApiMixinsTypeDescriptor = {
    ...ReportApiServiceMixinTypeDescriptor
};
