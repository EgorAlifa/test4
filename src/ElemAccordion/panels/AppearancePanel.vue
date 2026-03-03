<template>
    <w-panel>
        <ui-container>

            <!-- ── Цвета ──────────────────────────────────────────────── -->
            <div class="section-label">
                <i class="mdi mdi-palette-outline" />
                Цвета
            </div>

            <ui-input-cp prop="accentColor">Акцентный цвет</ui-input-cp>
            <ui-input-cp prop="borderColor">Цвет рамки</ui-input-cp>

            <!-- ── Заголовок ──────────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 10px">
                <i class="mdi mdi-format-header-1" />
                Заголовок
            </div>

            <ui-input-cp prop="headerBg">Фон заголовка</ui-input-cp>
            <ui-input-cp prop="headerColor">Цвет текста заголовка</ui-input-cp>
            <ui-input prop="headerFontSize" placeholder="15px">Размер шрифта</ui-input>
            <ui-input prop="headerFontWeight" placeholder="600">Жирность</ui-input>
            <ui-input prop="headerPadding" placeholder="16px 20px">Отступы заголовка</ui-input>

            <!-- ── Контент ────────────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 10px">
                <i class="mdi mdi-text" />
                Содержимое
            </div>

            <ui-input-cp prop="contentBg">Фон содержимого</ui-input-cp>
            <ui-input-cp prop="contentColor">Цвет текста содержимого</ui-input-cp>
            <ui-input prop="contentFontSize" placeholder="14px">Размер шрифта</ui-input>
            <ui-input prop="contentPadding" placeholder="12px 20px 16px">Отступы содержимого</ui-input>

            <!-- ── Форма ──────────────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 10px">
                <i class="mdi mdi-square-rounded-outline" />
                Форма и отступы
            </div>

            <ui-input prop="borderRadius" placeholder="12px">Скругление углов</ui-input>
            <ui-input prop="itemGap" placeholder="8px">Расстояние между блоками</ui-input>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Внешний вид', icon: 'format-paint' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    })
};
</script>

<style scoped>
.section-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f1f5f9;
}
</style>
