<template>
    <ui-panel-container>
        <ui-container>
            <span class="form-label text-truncate form-label-small">Центр карты</span>
            <ui-has-two-columns>
                <template #left>
                    <ui-input type="number" step="any" prop="centerLatitude">Широта</ui-input>
                </template>
                <template #right>
                    <ui-input type="number" step="any" prop="centerLongitude">Долгота</ui-input>
                </template>
            </ui-has-two-columns>

            <ui-has-panel>
                <span class="form-label text-truncate form-label-small">Настройки масштаба</span>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройки масштаба' }]">
                        <ui-container>
                            <ui-switch prop="zoom.shouldVisibleAllMarkers">Автомасштабирование</ui-switch>
                            <ui-switch prop="zoom.shouldShowZoomLevel">Уровень масштаба</ui-switch>
                            <ui-input-units v-model="zoomMapWithUnit" :units="SizeUnits">
                                Масштаб по умолчанию
                            </ui-input-units>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-units v-model="minZoomMapWithUnit" :units="SizeUnits">
                                        Масштаб мин.
                                    </ui-input-units>
                                </template>
                                <template #right>
                                    <ui-input-units v-model="maxZoomMapWithUnit" :units="SizeUnits">
                                        Масштаб макс.
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-input-units v-model="zoomSnapWithUnit" :units="SizeUnits">
                                Шаг изменения масштаба
                            </ui-input-units>

                            <ui-input-units v-model="wheelPxPerZoomLevelWithUnit" :units="SizeUnits">
                                <ui-hint>
                                    <template #label>Длина скролла одного слоя</template>
                                    Параметр определяет скорость увеличения или уменьшения масштаба с помощью колесика
                                    мыши.
                                    <br />
                                    Чем больше значение, тем больше нужно крутить колесо мыши, чтобы изменить масштаб,
                                    <br />
                                    при изменении масштаба
                                    <b>на несколько уровней подряд</b>
                                    .
                                </ui-hint>
                            </ui-input-units>

                            <ui-input-units v-model="drilldownZoomWithUnit" :units="SizeUnits">
                                Масштаб при дриллдауне
                            </ui-input-units>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <span class="form-label text-truncate form-label-small">Анимация перемещения</span>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Анимация перемещения' }]">
                        <ui-container>
                            <ui-input-units v-model="zoomFlightOfTheBumblebeeWithUnit" :units="SizeUnits">
                                Масштаб перемещения
                            </ui-input-units>
                            <ui-input type="number" min="1" step="any" prop="animateDuration">
                                Время перемещения (в секундах)
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <span class="form-label text-truncate form-label-small">Настройки поиска</span>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройки поиска' }]">
                        <ui-input-units prop="search.top" :units="SizeUnits">Отступ сверху</ui-input-units>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-has-panel>
                <ui-checkbox prop="rotateControl.isEnabled">Угол поворота карты</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Угол поворота карты' }]">
                        <ui-input prop="rotateControl.bearing" type="number" min="0" max="360" step="any">
                            Угол поворота
                        </ui-input>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-switch prop="shouldShowMinimap">Мини-карта</ui-switch>
            <ui-switch prop="controlScale.isEnabled">Контрольная шкала</ui-switch>
            <ui-switch prop="isVisibleControlHome">
                <ui-hint>
                    <template #label>Кнопка возврата</template>
                    Возвращение происходит на координаты, установленные для "Центра карты",
                    <br />
                    и на "Масштаб перемещения" из настроек анимации.
                </ui-hint>
            </ui-switch>
            <ui-switch prop="isEnabledFullscreen">Полноэкранный режим</ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from 'goodt-wcore';
import { SizeUnits } from '@goodt-wcore/panels';
import { resolveSizeUnits } from '../utils/utils';

export default {
    extends: Panel,
    static: { SizeUnits },
    data() {
        return {
            /** @public */
            $meta: { name: 'Настройки виджета', icon: 'widgets' }
        };
    },
    computed: {
        zoomMapWithUnit: {
            get() {
                const {
                    zoom: { zoomMap }
                } = this.props;
                return resolveSizeUnits(zoomMap);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.zoom.zoomMap = value;
                this.propChanged('zoom');
            }
        },
        minZoomMapWithUnit: {
            get() {
                const {
                    zoom: { minZoomMap }
                } = this.props;
                return resolveSizeUnits(minZoomMap);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.zoom.minZoomMap = value;
                this.propChanged('zoom');
            }
        },
        maxZoomMapWithUnit: {
            get() {
                const {
                    zoom: { maxZoomMap }
                } = this.props;
                return resolveSizeUnits(maxZoomMap);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.zoom.maxZoomMap = value;
                this.propChanged('zoom');
            }
        },
        zoomSnapWithUnit: {
            get() {
                const {
                    zoom: { zoomSnap }
                } = this.props;
                return resolveSizeUnits(zoomSnap);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.zoom.zoomSnap = value;
                this.propChanged('zoom');
            }
        },
        wheelPxPerZoomLevelWithUnit: {
            get() {
                const {
                    zoom: { wheelPxPerZoomLevel }
                } = this.props;
                return resolveSizeUnits(wheelPxPerZoomLevel);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.zoom.wheelPxPerZoomLevel = value;
                this.propChanged('zoom');
            }
        },
        drilldownZoomWithUnit: {
            get() {
                const {
                    zoom: { drilldownZoom }
                } = this.props;
                return resolveSizeUnits(drilldownZoom);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.zoom.drilldownZoom = value;
                this.propChanged('zoom');
            }
        },
        zoomFlightOfTheBumblebeeWithUnit: {
            get() {
                const {
                    zoom: { zoomFlightOfTheBumblebee }
                } = this.props;
                return resolveSizeUnits(zoomFlightOfTheBumblebee);
            },
            set(value) {
                // eslint-disable-next-line goodt-rules/no-long-prop-chains
                this.props.zoom.zoomFlightOfTheBumblebee = value;
                this.propChanged('zoom');
            }
        },
    }
};
</script>
