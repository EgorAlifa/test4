import { IDescriptorProps } from '@goodt-wcore/core';
import { IElemInstance } from '@goodt-wcore/elem';
import { descriptor } from '../descriptor';

interface Computed extends IDescriptorProps<ReturnType<typeof descriptor>> {}

export interface IInstance extends IElemInstance, Computed {}
export type TInstance = IInstance & Computed;
