<template>
    <w-panel>
        <ui-container>
            <div class="form-label form-label-small">Включить фильтры</div>

            <!-- Enable year filter -->
            <ui-checkbox prop="enableYearFilter">Включить фильтр по годам</ui-checkbox>

            <!-- Enable category filter -->
            <ui-checkbox prop="enableCategoryFilter">Включить фильтр по категориям</ui-checkbox>

            <!-- Enable lasso tool -->
            <ui-checkbox prop="enableLassoTool">Включить инструмент лассо</ui-checkbox>
            
            <div class="form-label form-label-small mt-3">Доступные опции для пользователя</div>
            
            <!-- Enable theme selector -->
            <ui-checkbox prop="enableThemeSelector">Доступен выбор темы</ui-checkbox>
            
            <!-- Enable mode selector -->
            <ui-checkbox prop="enableModeSelector">Доступен выбор режима</ui-checkbox>
            
            <!-- Enable fade selector -->
            <ui-checkbox prop="enableFadeSelector">Доступен выбор затухания</ui-checkbox>
            
            <!-- Enable particle size selector -->
            <ui-checkbox prop="enableParticleSizeSelector">Доступен выбор размера частиц</ui-checkbox>
            
            <!-- Enable legend toggle -->
            <ui-checkbox prop="enableLegendToggle">Доступно переключение легенды</ui-checkbox>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки', icon: 'filter' }
};
</script>

