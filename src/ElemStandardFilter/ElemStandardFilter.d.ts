import { IDescriptorProps } from '@goodt-wcore/core';
import Elem, { IElemComponentOptions, IElemInstance } from '@goodt-wcore/core/Elem';
import { IDremioMixinInstance } from '@goodt-wcore/core/mixins';
import { descriptor } from './descriptor';

interface Data {}
interface Methods {}
interface Props {}
interface Computed extends IDescriptorProps<ReturnType<typeof descriptor>> {}

export interface IInstance extends IElemInstance, IDremioMixinInstance, Data, Methods, Computed, Props {}
export interface IComponentOptions extends IElemComponentOptions<IInstance, Data, Methods, Computed, Props> {
    extends: typeof Elem;
}
