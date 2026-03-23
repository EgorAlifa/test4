<template>
    <w-panel>
        <ui-container>
            <ui-has-panel>
                <div class="text-small">{{ getPropLabel('labels') }}</div>
                <template #panel>
                    <ui-panel :groups="[{ name: getPropLabel('labels'), slot: 'default' }]">
                        <template>
                            <ui-container>
                                <ui-input prop="labels.username"></ui-input>
                                <ui-input prop="labels.password"></ui-input>
                                <ui-input prop="labels.submit"></ui-input>
                                <ui-input prop="labels.error"></ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <div class="text-small">{{ getPropLabel('layout') }}</div>
                <template #panel>
                    <ui-panel :groups="[{ name: getPropLabel('layout'), slot: 'default' }]">
                        <template>
                            <ui-container>
                                <ui-select
                                    prop="layout.direction"
                                    :options="getPropOpts('layout.direction')"></ui-select>
                                <ui-input-units prop="layout.gap" :units="SizeUnits"></ui-input-units>
                                <ui-select prop="layout.btnAlign" :options="getPropOpts('layout.btnAlign')"></ui-select>
                                <ui-checkbox prop="layout.btnIcon"></ui-checkbox>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-input prop="successPath"></ui-input>
        </ui-container>
    </w-panel>
</template>
<script>
import { SizeUnits } from '@goodt-wcore/panels';
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'cog' },
    static: {
        SizeUnits
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        /**
         * @param {string} path
         * @return {string}
         */
        getPropLabel(path) {
            const prop = path.split('.')[0];
            return this.descriptor.props[prop]?.label[path] ?? '';
        },
        /**
         * @param prop
         * @return {{ label:string, value:any }[]}
         */
        getPropOpts(path) {
            const prop = path.split('.')[0];
            return this.descriptor.props[prop]?.options[path] ?? [];
        }
    }
};
</script>
