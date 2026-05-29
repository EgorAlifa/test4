<template>
    <ui-panel-container>
        <ui-container>
            <ui-select prop="bookType" :options="BookTypeOptions">Формат файла</ui-select>
            <ui-has-panel v-if="props.bookType === BookType.CSV">
                <ui-checkbox prop="isCsvOtherDelimiter">Другой разделитель</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройка разделителя' }]">
                        <ui-input prop="csvDelimiter">Разделитель</ui-input>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-input v-model="props.events[Events.REFRESH]" @change="propChanged('events')">
                Событие для обновления
            </ui-input>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { Events, BookType } from '../constants';
import { BookTypeOptions } from './config';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'cog-outline' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
    static: {
        BookTypeOptions,
        Events,
        BookType
    }
};
</script>
