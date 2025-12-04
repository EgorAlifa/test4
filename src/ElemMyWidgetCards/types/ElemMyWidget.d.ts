import { IDescriptorProps } from '@goodt-wcore/core';
import { IElemInstance } from '@goodt-wcore/elem';
// eslint-disable-next-line import/extensions,import/no-unresolved
import { descriptor } from '../descriptor.js';
import { IElemDatasetMixinInstance } from '@goodt-common/data';

interface Computed extends IDescriptorProps<ReturnType<typeof descriptor>> {}
export type TInstance = IElemInstance
    & Computed
    & IElemDatasetMixinInstance;
