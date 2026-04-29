<template>
    <ui-container>
        <ui-button class="w-100" @click="addRule">Добавить правило</ui-button>
        <ui-draggable-accordion
            v-model="rules"
            :toolbox-controls="resolvedToolboxControls"
            @change="emitRules">
            <template #header="{ item, index }">
                {{ resolveRuleTitle(item, index) }}
            </template>
            <template #default="{ item, index: ruleIndex }">
                <ui-container>
                    <ui-select v-model="item.targetAlias" :options="targetOptions" :error="resolveTargetAliasError(item)">
                        Поле для форматирования
                    </ui-select>
                    <ui-switch v-model="item.isFormattingTotal">Форматировать итоги</ui-switch>
                    <ui-has-two-columns>
                        <template #left>
                            <ui-input-cp v-model="item.cellSettings.color">Цвет текста</ui-input-cp>
                        </template>
                        <template #right>
                            <ui-input-cp v-model="item.cellSettings.backgroundColor">Цвет фона</ui-input-cp>
                        </template>
                    </ui-has-two-columns>

                    <div
                        v-for="(condition, conditionIndex) in item.conditions"
                        :key="condition.uid"
                        class="condition-rules-editor__condition">
                        <ui-label label-size="small">
                            Условие {{ conditionIndex + 1 }}
                        </ui-label>
                        <ui-select
                            v-model="condition.fieldAlias"
                            :options="fieldOptions"
                            :error="resolveFieldAliasError(condition)">
                            Проверяемое поле
                        </ui-select>
                        <ui-has-two-columns>
                            <template #left>
                                <ui-select v-model="condition.operator" :options="ConditionsOptions">
                                    Оператор
                                </ui-select>
                            </template>
                            <template #right>
                                <ui-select v-model="condition.fieldType" :options="ConditionDataTypesOptions">
                                    Тип данных
                                </ui-select>
                            </template>
                        </ui-has-two-columns>
                        <ui-select v-model="condition.compareType" :options="ConditionCompareValueTypesOptions">
                            Тип значения
                        </ui-select>

                        <ui-input-dp
                            v-if="isDateStaticCondition(condition)"
                            v-model="condition.comparedValue"
                            :error="resolveComparedValueError(condition)">
                            Значение для сравнения
                        </ui-input-dp>
                        <ui-input
                            v-else-if="condition.compareType === ConditionCompareValueType.STATIC"
                            v-model="condition.comparedValue"
                            :type="condition.fieldType === ConditionDataType.NUMBER ? 'number' : 'text'"
                            :error="resolveComparedValueError(condition)">
                            Значение для сравнения
                        </ui-input>
                        <ui-select
                            v-else
                            v-model="condition.comparedAlias"
                            :options="compareFieldOptions"
                            :error="resolveComparedAliasError(condition)">
                            Поле для сравнения
                        </ui-select>

                        <div class="condition-rules-editor__actions">
                            <ui-button type="error" @click="removeCondition(ruleIndex, conditionIndex)">
                                Удалить условие
                            </ui-button>
                        </div>

                        <ui-select
                            v-if="conditionIndex < item.conditions.length - 1"
                            v-model="condition.logicalOperator"
                            :options="ConditionLogicalOperatorOptions">
                            Логический оператор
                        </ui-select>
                    </div>

                    <ui-button type="ghost" @click="addCondition(ruleIndex)">Добавить условие</ui-button>
                </ui-container>
            </template>
        </ui-draggable-accordion>
    </ui-container>
</template>

<script>
import { isEqual } from 'lodash';
import { PanelUi } from '@goodt-wcore/panel-ui';
import {
    createCondition,
    createConditionRuleItem,
    createConditionWithUid,
    CURRENT_FIELD_ALIAS,
    ConditionCompareValueType,
    ConditionDataType
} from '../utils/constants';
import {
    ConditionsOptions,
    ConditionCompareValueTypesOptions,
    ConditionDataTypesOptions,
    ConditionLogicalOperatorOptions
} from '../utils/config';

export default {
    components: {
        ...PanelUi
    },
    props: {
        value: {
            type: Array,
            default: () => []
        },
        valuesSettings: {
            type: Array,
            default: () => []
        },
        rowsSettings: {
            type: Array,
            default: () => []
        },
        columnsSettings: {
            type: Array,
            default: () => []
        },
        filtersSettings: {
            type: Array,
            default: () => []
        },
        toolboxControls: {
            type: Array,
            default: () => []
        }
    },
    static: {
        ConditionsOptions,
        ConditionCompareValueType,
        ConditionDataType,
        ConditionCompareValueTypesOptions,
        ConditionDataTypesOptions,
        ConditionLogicalOperatorOptions
    },
    data: (vm) => ({
        rules: vm.normalizeRules(vm.value)
    }),
    computed: {
        metricOptions() {
            return this.valuesSettings.reduce(
                (acc, { dataAlias = '', title = '' }) =>
                    dataAlias === '' || acc.some(({ value }) => value === dataAlias)
                        ? acc
                        : [
                              ...acc,
                              {
                                  value: dataAlias,
                                  label: `Метрика: ${title || dataAlias}`
                              }
                          ],
                []
            );
        },
        dimensionOptions() {
            return [...this.rowsSettings, ...this.columnsSettings, ...this.filtersSettings].reduce(
                (acc, { dataAlias = '', title = '' }) =>
                    dataAlias === '' || acc.some(({ value }) => value === dataAlias)
                        ? acc
                        : [
                              ...acc,
                              {
                                  value: dataAlias,
                                  label: `Измерение: ${title || dataAlias}`
                              }
                          ],
                []
            );
        },
        targetDimensionOptions() {
            return [...this.rowsSettings, ...this.columnsSettings].reduce(
                (acc, { dataAlias = '', title = '' }) =>
                    dataAlias === '' || acc.some(({ value }) => value === dataAlias)
                        ? acc
                        : [
                              ...acc,
                              {
                                  value: dataAlias,
                                  label: `Измерение: ${title || dataAlias}`
                              }
                          ],
                []
            );
        },
        targetOptions() {
            return [{ value: '', label: 'Все метрики' }, ...this.metricOptions, ...this.targetDimensionOptions];
        },
        fieldOptions() {
            return [{ value: CURRENT_FIELD_ALIAS, label: 'Текущее поле' }, ...this.metricOptions, ...this.dimensionOptions];
        },
        compareFieldOptions() {
            return [...this.metricOptions, ...this.dimensionOptions];
        },
        resolvedToolboxControls() {
            return this.toolboxControls.length > 0
                ? this.toolboxControls
                : [
                      { icon: 'mdi-minus-box-outline', label: 'Удалить', handler: this.deleteRule },
                      { icon: 'mdi-content-copy', label: 'Копировать', handler: this.copyRule }
                  ];
        }
    },
    watch: {
        value: {
            handler(value) {
                const rules = this.normalizeRules(value);
                if (isEqual(this.rules, rules)) {
                    return;
                }
                this.rules = rules;
            },
            deep: true
        },
        rules: {
            handler() {
                this.emitRules();
            },
            deep: true
        }
    },
    methods: {
        normalizeRules(rules = []) {
            return rules.map(createCondition);
        },
        emitRules() {
            const rules = this.rules.map(createCondition);

            if (isEqual(rules, this.value)) {
                return;
            }

            this.$emit('input', rules);
            this.$emit('change', rules);
        },
        resolveRuleTitle(rule, index) {
            const targetLabel = this.targetOptions.find(({ value }) => value === rule.targetAlias)?.label ?? `Правило ${index + 1}`;
            const [firstCondition] = rule.conditions ?? [];

            if (firstCondition == null) {
                return targetLabel;
            }

            const fieldLabel = this.fieldOptions.find(({ value }) => value === firstCondition.fieldAlias)?.label ?? 'Поле';
            const operatorLabel =
                ConditionsOptions.find(({ value }) => value === firstCondition.operator)?.label ?? firstCondition.operator;
            const comparedLabel =
                firstCondition.compareType === ConditionCompareValueType.STATIC
                    ? `${firstCondition.comparedValue}`.trim()
                    : this.compareFieldOptions.find(({ value }) => value === firstCondition.comparedAlias)?.label ?? 'Поле';

            if ((rule.conditions?.length ?? 0) === 1) {
                return `${targetLabel}: ${fieldLabel} ${operatorLabel} ${comparedLabel}`;
            }

            return `${targetLabel}: ${fieldLabel} ${operatorLabel} ${comparedLabel} +${rule.conditions.length - 1}`;
        },
        addRule() {
            this.rules.push(createCondition());
        },
        copyRule(index) {
            this.rules.push(createConditionWithUid(structuredClone(this.rules[index])));
        },
        deleteRule(index) {
            this.rules.splice(index, 1);
        },
        addCondition(ruleIndex) {
            this.rules[ruleIndex].conditions.push(createConditionRuleItem());
        },
        removeCondition(ruleIndex, conditionIndex) {
            if (this.rules[ruleIndex].conditions.length === 1) {
                this.rules.splice(ruleIndex, 1);
                return;
            }
            this.rules[ruleIndex].conditions.splice(conditionIndex, 1);
        },
        isDateStaticCondition(condition) {
            return (
                condition.compareType === ConditionCompareValueType.STATIC &&
                condition.fieldType === ConditionDataType.DATE
            );
        },
        resolveTargetAliasError(rule) {
            if (rule.targetAlias === '') {
                return null;
            }

            return this.targetOptions.some(({ value }) => value === rule.targetAlias)
                ? null
                : 'Для форматирования доступны только метрики и измерения строк/столбцов';
        },
        resolveFieldAliasError(condition) {
            return condition.fieldAlias === '' ? 'Укажите поле для проверки' : null;
        },
        resolveComparedAliasError(condition) {
            if (condition.compareType !== ConditionCompareValueType.FIELD) {
                return null;
            }
            return condition.comparedAlias === '' ? 'Укажите поле для сравнения' : null;
        },
        resolveComparedValueError(condition) {
            if (condition.compareType !== ConditionCompareValueType.STATIC) {
                return null;
            }

            const { comparedValue, fieldType } = condition;
            if (comparedValue == null || `${comparedValue}`.trim() === '') {
                return 'Укажите значение для сравнения';
            }

            if (
                fieldType === ConditionDataType.NUMBER &&
                Number.isNaN(Number(`${comparedValue}`.replace(/\s/gi, '').replace(',', '.')))
            ) {
                return 'Введите корректное числовое значение';
            }

            if (fieldType === ConditionDataType.DATE && Number.isNaN(new Date(comparedValue).getTime())) {
                return 'Введите корректную дату';
            }

            return null;
        }
    }
};
</script>

<style lang="pcss" scoped>
.condition-rules-editor__condition {
    margin-top: var(--spacer4);
    padding-top: var(--spacer4);
    border-top: 1px solid var(--color-border);
}

.condition-rules-editor__actions {
    margin-top: var(--spacer3);
}
</style>
