import { IDescriptorProps } from '@goodt-wcore/core';
import { IPanelInstance } from '@goodt-wcore/panel';
import { descriptor } from '../descriptor';

interface Computed extends IDescriptorProps<ReturnType<typeof descriptor>> {}

export interface IInstance extends IPanelInstance, Computed {}

export type TInstance = IInstance & Computed;
