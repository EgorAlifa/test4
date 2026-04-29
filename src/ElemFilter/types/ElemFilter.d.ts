import { IDescriptorProps } from '@goodt-wcore/core';
import { IElemInstance } from '@goodt-wcore/elem';
import { IElemDatasetBaseMixinInstance } from '@goodt-common/data';
import { descriptor } from '../descriptor.js';

type Descriptor = IDescriptorProps<ReturnType<typeof descriptor>>;

type ComputedEditor = {
    embeddedSearchEditor: {
        prefix: string;
        isEnabled: boolean;
        placeholder: string;
    };
    selectedMetric: string | null;
    smartSearchDimensions: string[];
    isApplyMode: boolean;
    shouldShowTopButtons: boolean;
    isDeleteSmartSearchDims: boolean;
    shouldShowBottomButtons: boolean;
    buttonsInfo: Record<
        string,
        Descriptor['props']['btnCancel'] & {
            style: Record<string, string>;
            iconIsUsed: boolean;
        }
    >;
    isMenuAlwaysOpen: boolean;
    multiListClasses: { 'multi-list-wrapper--full-growth': boolean };
    buttonIconStyle: Record<string, string>;
};

export type TElemInstance = IElemInstance & Descriptor & ComputedEditor & IElemDatasetBaseMixinInstance;
