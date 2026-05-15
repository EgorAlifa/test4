<template>
    <w-panel>
        <ui-container>
            <div class="info-message">
                ℹ️ <strong>Поля данных определяют источники информации для карты:</strong><br/>
                <strong>Широта/Долгота</strong> – координаты для отображения точек на карте<br/>
                <strong>Дата</strong> – для режима анимации и временных фильтров<br/>
                <strong>Категория</strong> – для группировки и раскраски точек<br/>
                <strong>Описание</strong> – дополнительная информация во всплывающих подсказках<br/>
                <strong>Регионы</strong> – для режима хороплета (закраска областей на карте)<br/>
                <em>Примечание: Метрики настраиваются в отдельной панели "Метрики"</em>
            </div>

            <!-- Latitude field -->
            <ui-select
                prop="latitudeField"
                :options="dimensionOptions"
                label="Поле широты">
            </ui-select>

            <!-- Longitude field -->
            <ui-select
                prop="longitudeField"
                :options="dimensionOptions"
                label="Поле долготы">
            </ui-select>

            <!-- Date field -->
            <ui-select
                prop="dateField"
                :options="dimensionOptions"
                label="Поле даты">
            </ui-select>

            <!-- Category field -->
            <ui-select
                prop="categoryField"
                :options="dimensionOptions"
                label="Поле категории">
            </ui-select>

            <!-- Description field -->
            <ui-select
                prop="descriptionField"
                :options="dimensionOptionsWithEmpty"
                label="Поле описания (опционально)">
            </ui-select>

            <!-- Region code field (simplified - single field with RU-XXX codes) -->
            <ui-select
                prop="regionCodeField"
                :options="dimensionOptionsWithEmpty"
                label="Поле кода региона (RU-XXX для хороплета)">
            </ui-select>

            <!-- Region name field -->
            <ui-select
                prop="regionNameField"
                :options="dimensionOptionsWithEmpty"
                label="Поле названия региона (для подсказки)">
            </ui-select>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Поля данных', icon: 'database' },

    computed: {
        dimensionOptions() {
            return this.buildOptions(this.dimensions, { empty: { label: '-- Выберите поле --', value: null } });
        },

        dimensionOptionsWithEmpty() {
            return this.buildOptions(this.dimensions, { empty: { label: '-- Не выбрано --', value: null } });
        }
    }
};
</script>

<style scoped>
.info-message {
    padding: 12px;
    margin: 12px 0;
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    font-size: 13px;
    color: #1e40af;
    line-height: 1.5;
}
</style>

