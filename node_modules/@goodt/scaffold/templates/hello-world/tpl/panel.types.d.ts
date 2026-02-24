import { IDescriptorProps } from '@goodt-wcore/core';
import { IPanelInstance } from '@goodt-wcore/panel';
import { descriptor } from '../descriptor.js';

interface Computed extends IDescriptorProps<ReturnType<typeof descriptor>> {}

export type TInstance = IPanelInstance & Computed;
