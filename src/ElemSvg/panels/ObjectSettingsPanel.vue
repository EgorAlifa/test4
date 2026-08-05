<template>
    <ui-panel-container>
        <ui-container>
            <ui-input-browse type="file" v-model="props.svg" @change="propChanged('svg')">SVG</ui-input-browse>
            <ui-select v-model="currentObject" :options="nodesOptions">Объект</ui-select>
            <ui-has-panel v-if="props.nodes.length > 0">
                <ui-checkbox v-model="props.nodes[currentObject].shouldChangeId" @change="propChanged('nodes')">
                    Изменить имя объекта
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Имя объекта' }]">
                        <ui-input v-model="props.nodes[currentObject].newId" @change="propChanged('nodes')">
                            Имя
                        </ui-input>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel v-if="props.labelsSettings.length > 0">
                <ui-checkbox
                    v-model="props.labelsSettings[currentObject].useCustomLabelSettings"
                    @change="propChanged('labelsSettings')">
                    Отступы подписей объекта
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройка отступов' }]">
                        <ui-input
                            class="p"
                            type="number"
                            v-model.number="props.labelsSettings[currentObject].labelOffsetY"
                            @change="propChanged('labelsSettings')">
                            Отступ подписей сверху
                        </ui-input>
                        <ui-input
                            class="p"
                            type="number"
                            v-model.number="props.labelsSettings[currentObject].labelOffsetX"
                            @change="propChanged('labelsSettings')">
                            Отступ подписей слева
                        </ui-input>
                        <ui-input
                            class="p"
                            type="number"
                            v-model.number="props.labelsSettings[currentObject].labelOffsetRight"
                            @change="propChanged('labelsSettings')">
                            Отступ подписей справа
                        </ui-input>
                        <ui-input
                            class="p"
                            type="number"
                            v-model.number="props.labelsSettings[currentObject].offsetBetweenLabels"
                            @change="propChanged('labelsSettings')">
                            Отступ между подписями
                        </ui-input>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel v-if="props.limitSettings.length > 0">
                <ui-checkbox
                    v-model="props.limitSettings[currentObject].isEnabled"
                    :disabled="!props.shouldDrawForeignObject"
                    @change="propChanged('limitSettings')">
                    <ui-hint>
                        <template #label>Ограничить вывод подписей</template>
                        Данная настройка работает при другом способе отрисовки подписей,
                        <br />
                        включаемом в "Измерениях/метриках"
                    </ui-hint>
                </ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройка ограничений' }]">
                        <ui-input
                            type="number"
                            v-model.number="props.limitSettings[currentObject].countRows"
                            @change="propChanged('limitSettings')">
                            Количество строк
                        </ui-input>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-switch
                v-if="props.nodes.length > 0"
                v-model="props.nodes[currentObject].isVisible"
                @change="propChanged('nodes')">
                Отображать объект
            </ui-switch>
        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/core';
import { PanelInstanceTypeDescriptor } from '../types';
import { createLimitSettings, createLabelsSettings, createNode } from '../config';

export default {
    extends: Panel,

    meta: { name: 'Настройки объектов', icon: 'arrange-bring-to-front', id: 'ObjectSettingsPanel' },
    data: () => ({
        currentObject: 0,
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        nodesOptions() {
            return this.elementInstance.nodesOptions;
        }
    },
    watch: {
        nodesOptions: {
            handler(nodes) {
                this.buildNodes(nodes);
                this.buildLabelsSettings(nodes);
                this.buildLabelsLimitSettings(nodes);
            },
            immediate: true
        }
    },
    methods: {
        buildNodes(nodes) {
            const { length } = this.props.nodes;
            if ((length > 0 && length === nodes.length) || nodes.length === 0) {
                return;
            }

            this.props.nodes = nodes.map(({ label: id }) => createNode(id));
            this.propChanged('nodes');
        },
        buildLabelsSettings(nodes) {
            const { length } = this.props.labelsSettings;
            if ((length > 0 && length === nodes.length) || nodes.length === 0) {
                return;
            }

            this.props.labelsSettings = nodes.map(({ label: id }) => createLabelsSettings(id));
            this.propChanged('labelsSettings');
        },
        buildLabelsLimitSettings(nodes) {
            const { length } = this.props.limitSettings;
            if ((length > 0 && length === nodes.length) || nodes.length === 0) {
                return;
            }

            this.props.limitSettings = nodes.map(({ label: id }) => createLimitSettings(id));
            this.propChanged('limitSettings');
        }
    }
};
</script>

<style lang="pcss" scoped>
.svg {
    height: 0;
    width: 0;
    opacity: 0;
    padding: 0;
    margin: 0;
}
</style>
