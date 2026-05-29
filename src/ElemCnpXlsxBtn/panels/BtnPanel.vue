<template>
    <ui-panel-container>
        <ui-container>
            <ui-input prop="downloadXLSX.bookName">Название файла</ui-input>
            <ui-input prop="downloadXLSX.sheetName" :maxlength="$options.excel.MAX_SHEET_NAME_LENGTH">
                Название страниц
            </ui-input>
            <ui-input-tags prop="downloadXLSX.buttonClass">Классы кнопки</ui-input-tags>
            <ui-input prop="downloadXLSX.style">Стили кнопки</ui-input>
            <ui-input prop="downloadXLSX.buttonText">Текст кнопки</ui-input>
            <ui-input prop="downloadXLSX.iconStyle">Стили иконки</ui-input>
            <ui-has-two-columns>
                <template #left>
                    <ui-input prop="downloadXLSX.iconLeft">Иконка слева</ui-input>
                </template>
                <template #right>
                    <ui-input prop="downloadXLSX.iconRight">Иконка справа</ui-input>
                </template>
            </ui-has-two-columns>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { MAX_SHEET_NAME_LENGTH } from '../constants';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Настройки кнопки', icon: 'button-cursor' },
    excel: {
        MAX_SHEET_NAME_LENGTH
    },
    data() {
        return {
            ...PanelInstanceTypeDescriptor
        };
    }
};
</script>
