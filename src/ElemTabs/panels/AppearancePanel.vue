<template>
    <w-panel>
        <ui-container>

            <!-- ── Акцент ─────────────────────────────────────────────── -->
            <div class="section-label">
                <i class="mdi mdi-palette-outline" />
                Акцент
            </div>

            <ui-color prop="tabIndicatorColor">Цвет индикатора активной</ui-color>
            <ui-color prop="borderColor">Цвет рамки</ui-color>

            <!-- ── Панель вкладок ─────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 10px">
                <i class="mdi mdi-tab" />
                Панель вкладок
            </div>

            <ui-color prop="tabBarBg">Фон панели</ui-color>
            <ui-color prop="tabBarBorderColor">Цвет разделителя панели</ui-color>

            <!-- ── Неактивная вкладка ─────────────────────────────────── -->
            <div class="section-label" style="margin-top: 10px">
                <i class="mdi mdi-tab-unselected" />
                Неактивная вкладка
            </div>

            <ui-color prop="tabBg">Фон</ui-color>
            <ui-color prop="tabColor">Цвет текста</ui-color>
            <ui-input prop="tabFontSize" placeholder="14px">Размер шрифта</ui-input>
            <ui-input prop="tabFontWeight" placeholder="500">Жирность</ui-input>
            <ui-input prop="tabPadding" placeholder="10px 18px">Отступы</ui-input>
            <ui-input prop="tabBorderRadius" placeholder="8px">Скругление (pill)</ui-input>

            <!-- ── Активная вкладка ───────────────────────────────────── -->
            <div class="section-label" style="margin-top: 10px">
                <i class="mdi mdi-tab" />
                Активная вкладка
            </div>

            <ui-color prop="tabActiveBg">Фон активной</ui-color>
            <ui-color prop="tabActiveColor">Цвет текста активной</ui-color>

            <!-- ── Содержимое ─────────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 10px">
                <i class="mdi mdi-text" />
                Содержимое
            </div>

            <ui-color prop="contentBg">Фон содержимого</ui-color>
            <ui-color prop="contentColor">Цвет текста</ui-color>
            <ui-input prop="contentFontSize" placeholder="14px">Размер шрифта</ui-input>
            <ui-input prop="contentPadding" placeholder="20px">Отступы</ui-input>
            <ui-input prop="contentBorderRadius" placeholder="0 0 12px 12px">Скругление блока</ui-input>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Внешний вид', icon: 'palette' },
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
