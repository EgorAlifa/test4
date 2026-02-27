import { createFormatNumber } from '@goodt-common/utils-number';
import { UiNumberFormat } from '@goodt-wcore/panel-ui';
import { NUMBER_FORMAT_DEFAULT } from './const';

export const formatNumber = createFormatNumber({
    format: NUMBER_FORMAT_DEFAULT
});

export { NUMBER_FORMAT_DEFAULT };

export const bootstrap = () => {
    UiNumberFormat.setPropsDefault({
        formatDefault: NUMBER_FORMAT_DEFAULT.toString()
    });
};
