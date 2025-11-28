<template>
    <w-panel>
        <ui-container>
            <!-- Заголовок -->
            <ui-has-panel>
                <ui-checkbox prop="showTitle">Показывать заголовок</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки заголовка', slot: 'title' }]">
                        <template #title>
                            <ui-container>
                                <ui-input prop="title" placeholder="Навигация"></ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-checkbox prop="showSlug">Показывать пути страниц</ui-checkbox>

            <ui-select prop="orientation" :options="options.orientations" label="Ориентация"></ui-select>

            <!-- Позиционирование кнопок (для vertical/dropdown/kebab) -->
            <ui-select
                v-if="props.orientation === 'vertical' || props.orientation === 'dropdown' || props.orientation === 'kebab'"
                prop="buttonAlignment"
                :options="options.buttonAlignments"
                label="Позиционирование кнопок">
            </ui-select>

            <!-- Настройка текста для dropdown меню -->
            <ui-input
                v-if="props.orientation === 'dropdown'"
                prop="dropdownText"
                placeholder="Оставьте пустым чтобы скрыть">
                Текст меню
            </ui-input>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';
import { ORIENTATION_OPTIONS } from '../config';

export default {
    extends: Panel,

    meta: { name: 'Настройки виджета', icon: 'cog' },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        options: {
            orientations: ORIENTATION_OPTIONS,
            buttonAlignments: [
                { label: 'По левому краю', value: 'left' },
                { label: 'По центру', value: 'center' },
                { label: 'По правому краю', value: 'right' }
            ]
        }
    })
};
</script>
