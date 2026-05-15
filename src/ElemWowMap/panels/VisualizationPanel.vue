<template>
    <w-panel>
        <ui-container>
            <!-- Режим и стиль -->
            <ui-has-panel>
                <div class="form-label form-label-small">Режим и стиль</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Режим и стиль', slot: 'default' }]">
                        <ui-container>
                            <!-- Visualization mode -->
                            <ui-select
                                prop="visualizationMode"
                                :options="options.visualizationModes"
                                label="Режим визуализации">
                            </ui-select>

                            <!-- Theme -->
                            <ui-select
                                prop="theme"
                                :options="options.themes"
                                label="Тема">
                            </ui-select>

                            <!-- Map tile provider -->
                            <ui-select
                                prop="mapTileProvider"
                                :options="options.mapTiles"
                                label="Стиль карты">
                            </ui-select>

                            <!-- Yandex API Key (shown only when yandex provider is selected) -->
                            <template v-if="props.mapTileProvider === 'yandex'">
                                <div class="form-label form-label-small mt-2">API-ключ Яндекс Карт</div>
                                <ui-input
                                    prop="yandexApiKey"
                                    placeholder="Введите API-ключ"
                                    label="Яндекс API-ключ">
                                </ui-input>
                            </template>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Параметры отображения -->
            <ui-has-panel>
                <div class="form-label form-label-small mt-3">Параметры отображения</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Параметры отображения', slot: 'default' }]">
                        <ui-container>
                            <!-- Show controls -->
                            <ui-checkbox prop="showControls">Показать панель управления</ui-checkbox>

                            <!-- Show legend -->
                            <ui-checkbox prop="showLegend">Показать легенду</ui-checkbox>

                            <!-- Show chart -->
                            <ui-checkbox prop="showChart">Показать график событий</ui-checkbox>

                            <!-- Show region labels (choropleth) -->
                            <ui-checkbox prop="showLabels">Показать названия регионов (хороплет)</ui-checkbox>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Настройки карты -->
            <ui-has-panel>
                <div class="form-label form-label-small mt-3">Настройки карты</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки карты', slot: 'default' }]">
                        <ui-container>
                            <!-- Initial zoom -->
                            <ui-input
                                type="number"
                                min="1"
                                max="18"
                                prop="initialZoom"
                                label="Начальное увеличение">
                            </ui-input>

                            <!-- Auto-center map on data load -->
                            <ui-checkbox prop="autoCenter">Автоцентрирование на данных</ui-checkbox>

                            <div class="form-label form-label-small mt-3">Ограничения увеличения</div>

                            <!-- Min/Max zoom -->
                            <ui-input
                                type="number"
                                min="1"
                                max="10"
                                prop="minZoom"
                                label="Минимальное увеличение">
                            </ui-input>

                            <ui-input
                                type="number"
                                min="10"
                                max="20"
                                prop="maxZoom"
                                label="Максимальное увеличение">
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Позиции элементов -->
            <ui-has-panel>
                <div class="form-label form-label-small mt-3">Позиции элементов</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Позиции элементов', slot: 'default' }]">
                        <ui-container>
                            <!-- Controls position -->
                            <ui-select
                                prop="controlsPosition"
                                :options="options.positions"
                                label="Позиция управления">
                            </ui-select>

                            <!-- Legend position -->
                            <ui-select
                                prop="legendPosition"
                                :options="options.positions"
                                label="Позиция легенды">
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Фильтрация Top-N -->
            <ui-has-panel>
                <div class="form-label form-label-small mt-3">Фильтрация Top-N</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Фильтрация Top-N', slot: 'default' }]">
                        <ui-container>
                            <ui-input
                                type="number"
                                min="1"
                                prop="topN"
                                label="Показать топ N точек (0 = все)">
                            </ui-input>
                            <ui-select
                                prop="topNOrder"
                                :options="options.topNOrders"
                                label="Порядок сортировки">
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
// eslint-disable-next-line import/named
import {
    VISUALIZATION_MODE_OPTIONS,
    THEME_OPTIONS,
    MAP_TILE_OPTIONS,
    TOP_N_ORDER_OPTIONS
} from '../utils/constants';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Визуализация', icon: 'eye' },

    data() {
        return {
            options: {
                visualizationModes: VISUALIZATION_MODE_OPTIONS,
                themes: THEME_OPTIONS,
                mapTiles: MAP_TILE_OPTIONS,
                topNOrders: TOP_N_ORDER_OPTIONS,
                positions: [
                    { value: 'topleft', label: 'Сверху слева' },
                    { value: 'topright', label: 'Сверху справа' },
                    { value: 'bottomleft', label: 'Снизу слева' },
                    { value: 'bottomright', label: 'Снизу справа' }
                ]
            }
        };
    }
};
</script>

<style scoped>
.form-label-small {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.mt-2 {
    margin-top: 8px;
}

.mt-3 {
    margin-top: 16px;
}
</style>
