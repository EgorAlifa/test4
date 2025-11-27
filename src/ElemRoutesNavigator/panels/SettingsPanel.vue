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

            <!-- Основные настройки -->
            <div class="form-label form-label-small mt-3">Основные настройки</div>

            <ui-checkbox prop="showSlug">Показывать пути страниц</ui-checkbox>

            <ui-select prop="orientation" :options="options.orientations" label="Ориентация"></ui-select>

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
            orientations: ORIENTATION_OPTIONS
        }
    })
};
</script>
