<template>
    <w-panel>
        <ui-container>
            <ui-input-auto prop="reportServiceUrl">Host сервиса отчетов</ui-input-auto>

            <ui-input v-model="props.events[Events.RUN_REPORT]" @change="propChanged('events')">
                Событие для запуска отчёта
            </ui-input>

            <ui-input v-model="props.events[Events.START_RUNNING]" @change="propChanged('events')">
                Событие после начала сборки отчёта
            </ui-input>

            <ui-input v-model="props.events[Events.END_RUNNING]" @change="propChanged('events')">
                Событие после окончания сборки отчёта
            </ui-input>

            <ui-switch prop="shouldShowPreloader"></ui-switch>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
// eslint-disable-next-line import/no-cycle
import { Events } from '../descriptor';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Настройки сервиса', icon: 'api' },
    static: {
        Events
    },
    methods: {
        ...PanelInstanceTypeDescriptor
    }
};
</script>
