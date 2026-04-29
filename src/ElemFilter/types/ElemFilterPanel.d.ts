
import { IDescriptorProps } from '@goodt-wcore/core';
import { IPanelInstance } from '@goodt-wcore/panel';
import { descriptor } from '../descriptor.js';
import SettingsPanel from '../panels/SettingsPanel.vue';

interface Computed extends IDescriptorProps<ReturnType<typeof descriptor>> {}

export type TPanelInstance = IPanelInstance
    & Computed
    & typeof SettingsPanel['static'];
