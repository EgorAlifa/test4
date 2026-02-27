<template>
    <ui-container>
        <ui-switch v-model="iconSettings.shouldUseRules" @change="updateSettingsModel">Иконка по условию</ui-switch>
        <template v-if="!iconSettings.shouldUseRules">
            <ui-panel
                :groups="[
                    { name: 'Прирост', slot: 'icon-up' },
                    { name: 'Снижение', slot: 'icon-down' }
                ]">
                <template #icon-up>
                    <ui-input class="p" v-model="indicatorIconModel.iconUp.name" @change="updateIndicatorIconModel">
                        Название
                    </ui-input>
                    <ui-input-units
                        class="p"
                        v-model="indicatorIconModel.iconUp.fontSize"
                        :units="SizeUnits"
                        @change="updateIndicatorIconModel">
                        Размер
                    </ui-input-units>
                    <ui-input-cp v-model="indicatorIconModel.iconUp.color" @change="updateIndicatorIconModel">
                        Цвет
                    </ui-input-cp>
                </template>
                <template #icon-down>
                    <ui-input class="p" v-model="indicatorIconModel.iconDown.name" @change="updateIndicatorIconModel">
                        Название
                    </ui-input>
                    <ui-input-units
                        class="p"
                        v-model="indicatorIconModel.iconDown.fontSize"
                        :units="SizeUnits"
                        @change="updateIndicatorIconModel">
                        Размер
                    </ui-input-units>
                    <ui-input-cp v-model="indicatorIconModel.iconDown.color" @change="updateIndicatorIconModel">
                        Цвет
                    </ui-input-cp>
                </template>
            </ui-panel>
        </template>
        <template v-else>
            <ui-input-units class="p" v-model="iconSettings.fontSize" :units="SizeUnits" @change="updateSettingsModel">
                Размер
            </ui-input-units>
            <ui-collapse class="p" v-for="(rule, idx) in iconSettings.rules" :key="idx">
                <template #header>Условие {{ idx + 1 }}</template>
                <ui-select
                    class="p"
                    v-model="rule.dataType"
                    :options="RuleDataTypeOptions"
                    @change="updateSettingsModel">
                    Тип данных
                </ui-select>
                <ui-has-two-columns class="p">
                    <template #left>
                        <ui-select v-model="rule.condition" :options="conditionOptions" @change="updateSettingsModel">
                            Условие
                        </ui-select>
                    </template>
                    <template #right>
                        <ui-input
                            v-if="rule.dataType === RuleDataType.VALUE"
                            v-model="rule.value"
                            @change="updateSettingsModel">
                            Значение
                        </ui-input>
                        <ui-select v-else v-model="rule.value" :options="metrics" @change="updateSettingsModel">
                            Значение
                        </ui-select>
                    </template>
                </ui-has-two-columns>
                <ui-input class="p" v-model="rule.icon" @change="updateSettingsModel">Название иконки</ui-input>
                <ui-input-cp class="p" v-model="rule.color" @change="updateSettingsModel">Цвет</ui-input-cp>
                <ui-button type="error" @click="removeMetricIconRule(idx)">Удалить</ui-button>
            </ui-collapse>
            <ui-button type="ghost" @click="addMetricIconRule">Добавить условие</ui-button>
        </template>
    </ui-container>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import { PanelUi } from '@goodt-wcore/components';
import { SizeUnits } from '@goodt-wcore/panels';

import { RuleDataType, RuleDataTypeOptions } from '../../utils/constants';
import { ParamStyleTypes } from '../../utils';

export default {
    components: {
        ...PanelUi
    },
    props: {
        settings: { type: Object, required: true },
        indicatorIcon: { type: Object, required: true },
        metrics: { type: Array, default: () => [] }
    },
    static: {
        RuleDataTypeOptions,
        RuleDataType,
        SizeUnits
    },
    data() {
        return {
            iconSettings: null,
            indicatorIconModel: null
        };
    },
    computed: {
        conditionOptions() {
            return Object.keys(ParamStyleTypes).map((key) => ({ label: ParamStyleTypes[key].name, value: key }));
        }
    },
    watch: {
        settings: {
            handler(value) {
                this.iconSettings = cloneDeep(value);
            },
            immediate: true
        },
        indicatorIcon: {
            handler(value) {
                this.indicatorIconModel = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        addMetricIconRule() {
            const { rules } = this.iconSettings;
            rules.push({ dataType: RuleDataType.FROM_DATASET, condition: '', value: null, icon: '', color: '#000' });
            this.updateSettingsModel();
        },
        removeMetricIconRule(idx) {
            const { rules } = this.iconSettings;
            rules.splice(idx, 1);
            this.updateSettingsModel();
        },
        updateSettingsModel() {
            this.$emit('settings-changed', this.iconSettings);
        },
        updateIndicatorIconModel() {
            this.$emit('indicator-icon-changed', this.indicatorIconModel);
        }
    }
};
</script>
