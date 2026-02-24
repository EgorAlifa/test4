import { IDescriptorProps } from '@goodt-wcore/core';
import { IPanelInstance } from '@goodt-wcore/panel';
// eslint-disable-next-line import/extensions,import/no-unresolved
import { descriptor } from '../descriptor.js';

interface Computed extends IDescriptorProps<ReturnType<typeof descriptor>> {}
export type TInstance = IPanelInstance & Computed;
