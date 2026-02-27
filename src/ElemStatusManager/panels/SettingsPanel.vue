<template>
    <w-panel>
        <ui-container>
            <ui-select prop="workMode" :options="WorkModeOptions" />
            <ui-select prop="presetUserRoleId" :options="employeeRoleOptions">Режим определения роли</ui-select>

            <template v-if="isSelectMode">
                <ui-has-panel>
                    <span class="form-label form-label-small">Настройка иконок для статусов</span>
                    <template #panel>
                        <ui-panel :groups="[{ slot: 'default', name: 'Настройка иконок для статусов' }]">
                            <ui-container>
                                <ui-button type="primary" @click="onAddStatusIconBinding">Добавить настройку</ui-button>
                                <ui-collapse
                                    v-for="(statusIconBinding, index) in props.statusIconBindings"
                                    :key="index">
                                    <template #header>
                                        <div class="d-flex flex-h-space-between items-center">
                                            <span>
                                                <i
                                                    class="mdi"
                                                    :class="statusIconBinding.icon"
                                                    :style="{ color: statusIconBinding.color }" />
                                                {{ statusIconBinding.status || 'Статус' }}
                                            </span>
                                            <i
                                                class="mdi mdi-delete color-red"
                                                @click.stop="onDeleteStatusIconBinding(index)" />
                                        </div>
                                    </template>
                                    <ui-container>
                                        <ui-input type="number" :prop="`statusIconBindings[${index}].status`" />
                                        <ui-input :prop="`statusIconBindings[${index}].icon`" />
                                        <ui-input-cp :prop="`statusIconBindings[${index}].color`" />
                                    </ui-container>
                                </ui-collapse>
                            </ui-container>
                        </ui-panel>
                    </template>
                </ui-has-panel>

                <ui-has-panel>
                    <span class="form-label form-label-small">Настройка стилей селекта</span>
                    <template #panel>
                        <ui-panel :groups="[{ slot: 'default', name: 'Настройка стилей селекта' }]">
                            <ui-container>
                                <ui-input-tags prop="selectSetting.statusCssClass" />
                                <ui-input-tags prop="selectSetting.selectCssClass" />
                                <ui-input-tags prop="selectSetting.statusIconCssClass" />
                                <ui-input-tags prop="selectSetting.datalistCssClass" />
                                <ui-input-tags prop="selectSetting.optionCssClass" />
                                <ui-input-tags prop="selectSetting.optionStatusIconCssClass" />
                            </ui-container>
                        </ui-panel>
                    </template>
                </ui-has-panel>
            </template>

            <ui-input prop="placeholderOpenedText">Текст кнопки</ui-input>

            <ui-input prop="events.statusChangedEvent">Название ивента после смены статуса</ui-input>

            <ui-input prop="events.reload">Событие для обновления виджета</ui-input>

            <ui-switch prop="useStatusIdAsEvent">Отправить id статуса как событие</ui-switch>

            <ui-switch prop="isBulkStatusChange">Массовая смена статуса</ui-switch>
            <template v-if="props.isBulkStatusChange">
                <ui-input prop="parentTaskTypeId" type="number">Тип родительского таска</ui-input>
                <ui-input-tags v-model="childTaskTypeIds">Типы дочерних тасков</ui-input-tags>
            </template>

            <ui-has-panel>
                <span class="form-label form-label-small">Настройка классов попапа подтверждения</span>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройка классов попапа подтверждения' }]">
                        <ui-container>
                            <ui-input-tags prop="popupSetting.popupCssClass" />
                            <ui-input-tags prop="popupSetting.titleCssClass" />
                            <ui-input-tags prop="popupSetting.closeIconCssClass" />
                            <ui-input-tags prop="popupSetting.bodyCssClass" />
                            <ui-input-tags prop="popupSetting.footerCssClass" />
                            <ui-input-tags prop="popupSetting.cancelButtonCssClass" />
                            <ui-input-tags prop="popupSetting.confirmButtonCssClass" />
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
// eslint-disable-next-line import/no-cycle
import { Events } from '../descriptor';
import { DefaultOption } from '../config';
import { WorkModeOptions } from './config';
import { WorkMode } from '../constants';

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'cog-outline' },
    static: {
        Events,
        WorkModeOptions
    },
    data: () => ({
        roles: []
    }),
    computed: {
        employeeRoleOptions() {
            return [DefaultOption, ...this.roles];
        },
        childTaskTypeIds: {
            get() {
                return this.props.childTaskTypeIds;
            },
            set(ids) {
                this.props.childTaskTypeIds = ids.map(Number).filter((id) => !Number.isNaN(id));
                this.propChanged('childTaskTypeIds');
            }
        },
        isSelectMode() {
            return this.props.workMode === WorkMode.SELECT;
        }
    },
    created() {
        this.setRoles();
    },
    methods: {
        async setRoles() {
            this.roles = (await this.elementInstance.modelDataService.fetchTaskTypeRoles())
                .map(({ id, name, task_type: { name: taskTypeName } }) => ({
                    value: id,
                    label: `${id} ${name} - ${taskTypeName}`
                }))
                .sort((a, b) => a.value - b.value);
        },
        onAddStatusIconBinding() {
            const { statusIconBindings } = this.descriptor.props;
            this.props.statusIconBindings.push(statusIconBindings.factory());
            this.propChanged('statusIconBindings');
        },
        onDeleteStatusIconBinding(index) {
            this.props.statusIconBindings.splice(index, 1);
            this.propChanged('statusIconBindings');
        }
    }
};
</script>
