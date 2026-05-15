<template>
    <w-panel>
        <ui-container>
            <!-- Маркеры -->
            <ui-has-panel>
                <div class="form-label form-label-small">Маркеры на карте</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Маркеры', slot: 'default' }]">
                        <ui-container>
                            <!-- Enable markers -->
                            <ui-checkbox prop="showMarkers">Показывать маркеры</ui-checkbox>

                            <!-- Marker symbol -->
                            <ui-select
                                prop="markerSymbol"
                                :options="options.markerSymbols"
                                label="Форма маркера">
                            </ui-select>

                            <!-- Marker color -->
                            <ui-color
                                prop="markerColor"
                                label="Цвет маркера">
                            </ui-color>

                            <!-- Marker size -->
                            <ui-input
                                type="number"
                                min="4"
                                max="40"
                                prop="markerSize"
                                label="Размер маркера">
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Привязка данных маркеров -->
            <ui-has-panel>
                <div class="form-label form-label-small mt-3">Привязка данных</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Данные маркеров', slot: 'default' }]">
                        <ui-container>
                            <div class="form-hint">
                                Укажите поля датасета, которые содержат координаты и подпись маркеров.
                                Маркеры отображаются поверх всех режимов карты.
                            </div>

                            <!-- Latitude field -->
                            <ui-input
                                prop="markerLatField"
                                label="Поле широты маркера">
                            </ui-input>

                            <!-- Longitude field -->
                            <ui-input
                                prop="markerLonField"
                                label="Поле долготы маркера">
                            </ui-input>

                            <!-- Label field -->
                            <ui-input
                                prop="markerLabelField"
                                label="Поле подписи маркера">
                            </ui-input>
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
import { MARKER_SYMBOL_OPTIONS } from '../utils/constants';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Маркеры', icon: 'map-pin' },

    data() {
        return {
            options: {
                markerSymbols: MARKER_SYMBOL_OPTIONS
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

.mt-3 {
    margin-top: 16px;
}

.form-hint {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
    line-height: 1.5;
}
</style>
