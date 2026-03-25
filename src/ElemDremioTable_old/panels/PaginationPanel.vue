<template>
    <div>
        <ui-input class="p" v-model="props.pagination.fontFamily" @change="propChanged('pagination')">
            Шрифт
        </ui-input>
        <ui-input
            class="p"
            type="number"
            step="0.05"
            v-model="props.pagination.fontSize"
            @change="propChanged('pagination')">
            Размер шрифта
        </ui-input>
        <ui-input-cp class="p" v-model="props.pagination.color" @change="propChanged('pagination')">
            Цвет текста
        </ui-input-cp>
        <ui-input-cp class="p" v-model="props.pagination.activeColor" @change="propChanged('pagination')">
            Цвет текста активной кнопки
        </ui-input-cp>
        <ui-input-cp class="p" v-model="props.pagination.background" @change="propChanged('pagination')">
            Цвет активной кнопки
        </ui-input-cp>
    </div>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    data: () => ({
        /** @public */
        $meta: { name: 'Настройки пагинации', icon: 'book-open-page-variant-outline' },
        ...PanelInstanceTypeDescriptor
    })
};
</script>
