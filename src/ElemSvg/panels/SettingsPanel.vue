<template>
    <w-panel>
        <ui-container>
            <ui-has-panel class="form-label form-label-small">
                Настройки цвета
                <template #panel>
                    <ui-panel
                        :groups="[
                            { slot: 'default', name: 'По умолчанию' },
                            { slot: 'rules', name: 'По условию' }
                        ]">
                        <template #default>
                            <ui-container>
                                <ui-input-cp prop="colorSettings.defaultColor">Цвет объектов без данных</ui-input-cp>
                                <ui-input-cp prop="colorSettings.defaultStroke">
                                    Цвет границы объектов без данных
                                </ui-input-cp>
                                <ui-input-cp prop="generalSettings.stroke">Цвет границы объектов</ui-input-cp>
                                <ui-select v-model="currentObject" :options="nodesOptions">Объект</ui-select>
                                <ui-input-cp
                                    v-if="props.colorSettings.nodes.length > 0"
                                    v-model="props.colorSettings.nodes[currentObject].fill"
                                    @change="propChanged('colorSettings')">
                                    Цвет объекта
                                </ui-input-cp>
                            </ui-container>
                        </template>
                        <template #rules>
                            <ui-container>
                                <ui-switch prop="colorSettings.shouldUseRules">Цвет по условию</ui-switch>
                                <ui-select prop="fields.metricColor" :options="dimensionsMetrics">
                                    Значение для покраски
                                </ui-select>
                                <ui-collapse v-for="(rule, idx) in props.colorSettings.rules" :key="idx">
                                    <template #header>
                                        <div class="d-flex flex-v-center flex-h-space-between">
                                            <span>Условие {{ idx + 1 }}</span>
                                            <ui-button type="ghost" class="icon-btn" @click.stop="removeRule(idx)">
                                                <i class="mdi mdi-delete color-red" />
                                            </ui-button>
                                        </div>
                                    </template>
                                    <ui-has-two-columns class="p">
                                        <template #left>
                                            <ui-input v-model="rule.from" @change="propChanged('colorSettings')">
                                                От
                                            </ui-input>
                                        </template>
                                        <template #right>
                                            <ui-input v-model="rule.to" @change="propChanged('colorSettings')">
                                                До
                                            </ui-input>
                                        </template>
                                    </ui-has-two-columns>
                                    <ui-has-two-columns class="p">
                                        <template #left>
                                            <ui-input-cp v-model="rule.fill" @change="propChanged('colorSettings')">
                                                Цвет заливки
                                            </ui-input-cp>
                                        </template>
                                        <template #right>
                                            <ui-input-cp v-model="rule.stroke" @change="propChanged('colorSettings')">
                                                Цвет границы
                                            </ui-input-cp>
                                        </template>
                                    </ui-has-two-columns>
                                </ui-collapse>
                                <ui-button @click="addRule">Добавить правило</ui-button>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-checkbox prop="hoverSettings.shouldUseSettings">Настройки при наведении</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройки при наведении' }]">
                        <ui-container>
                            <ui-switch prop="hoverSettings.shouldHoverAllElements">
                                Применять ко всем объектам
                            </ui-switch>
                            <ui-input-cp prop="hoverSettings.fill">Цвет объектов</ui-input-cp>
                            <ui-input-cp prop="hoverSettings.stroke">Цвет границы</ui-input-cp>
                            <ui-input-units prop="hoverSettings.strokeWidth" :units="FontSizes">
                                Толщина границы
                            </ui-input-units>
                            <ui-input-cp prop="hoverSettings.additionalFill">
                                Цвет затемнения остальных объектов
                            </ui-input-cp>
                            <ui-input-cp prop="hoverSettings.additionalStroke">
                                Цвет затемнения границ остальных объектов
                            </ui-input-cp>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-checkbox prop="selectSettings.isEnabled">Настройки при нажатии</ui-checkbox>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Настройки при нажатии' }]">
                        <ui-container>
                            <ui-switch prop="selectSettings.shouldSelectAllElements">
                                Применять ко всем объектам
                            </ui-switch>

                            <ui-input type="number" min="0" max="1" step="0.1" prop="selectSettings.blockOpacity">
                                Прозрачность остальных объектов
                            </ui-input>
                            <ui-input type="number" min="0" max="1" step="0.1" prop="selectSettings.textOpacity">
                                Прозрачность остальных подписей
                            </ui-input>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel v-if="props.cardMode">
                <div class="form-label form-label-small">Оформление карточек показателей</div>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Оформление карточек' }]">
                        <ui-container>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input v-model="props.cardStyle.fontFamily" @change="propChanged('cardStyle')">
                                        Шрифт
                                    </ui-input>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        v-model="props.cardStyle.titleFontSize"
                                        :units="FontSizes"
                                        @change="propChanged('cardStyle')">
                                        Размер заголовка
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-units
                                        v-model="props.cardStyle.valueFontSize"
                                        :units="FontSizes"
                                        @change="propChanged('cardStyle')">
                                        Размер значения
                                    </ui-input-units>
                                </template>
                                <template #right>
                                    <ui-input-units
                                        v-model="props.cardStyle.percentFontSize"
                                        :units="FontSizes"
                                        @change="propChanged('cardStyle')">
                                        Размер %
                                    </ui-input-units>
                                </template>
                            </ui-has-two-columns>
                            <ui-input-units
                                v-model="props.cardStyle.planFontSize"
                                :units="FontSizes"
                                @change="propChanged('cardStyle')">
                                Размер строки плана
                            </ui-input-units>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-cp v-model="props.cardStyle.titleColor" @change="propChanged('cardStyle')">
                                        Цвет заголовка
                                    </ui-input-cp>
                                </template>
                                <template #right>
                                    <ui-input-cp v-model="props.cardStyle.valueColor" @change="propChanged('cardStyle')">
                                        Цвет значения
                                    </ui-input-cp>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-cp
                                        v-model="props.cardStyle.planLabelColor"
                                        @change="propChanged('cardStyle')">
                                        Цвет подписи плана
                                    </ui-input-cp>
                                </template>
                                <template #right>
                                    <ui-input-cp
                                        v-model="props.cardStyle.planValueColor"
                                        @change="propChanged('cardStyle')">
                                        Цвет значения плана
                                    </ui-input-cp>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-cp
                                        v-model="props.cardStyle.positiveColor"
                                        @change="propChanged('cardStyle')">
                                        Цвет "хорошего" отклонения
                                    </ui-input-cp>
                                </template>
                                <template #right>
                                    <ui-input-cp
                                        v-model="props.cardStyle.negativeColor"
                                        @change="propChanged('cardStyle')">
                                        Цвет "плохого" отклонения
                                    </ui-input-cp>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-cp v-model="props.cardStyle.bg" @change="propChanged('cardStyle')">
                                        Фон карточки
                                    </ui-input-cp>
                                </template>
                                <template #right>
                                    <ui-input-cp v-model="props.cardStyle.border" @change="propChanged('cardStyle')">
                                        Рамка карточки
                                    </ui-input-cp>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-input-cp
                                        v-model="props.cardStyle.highlightBg"
                                        @change="propChanged('cardStyle')">
                                        Фон выделенной карточки
                                    </ui-input-cp>
                                </template>
                                <template #right>
                                    <ui-input-cp
                                        v-model="props.cardStyle.highlightBorder"
                                        @change="propChanged('cardStyle')">
                                        Рамка выделенной карточки
                                    </ui-input-cp>
                                </template>
                            </ui-has-two-columns>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-tooltip
                v-model="props.customTooltip"
                :options="dimensionsMetrics"
                @change="propChanged('customTooltip')">
                <ui-switch v-model="isTooltipFixed">Зафиксировать тултип</ui-switch>
            </ui-tooltip>
            <ui-input-units prop="generalSettings.strokeWidth" :units="FontSizes">
                Толщина границы объектов
            </ui-input-units>
            <ui-input prop="generalSettings.boxShadow">Тень объектов</ui-input>
            <ui-button @click="saveSvg">Сохранить свг</ui-button>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelDatasetMixinTypes, usePanelDatasetMixin } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { FontSizes } from './config';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    static: {
        FontSizes
    },
    data: () => ({
        currentObject: 0,
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }),
    computed: {
        nodesOptions() {
            return this.elementInstance.nodesOptions;
        },
        isTooltipFixed: {
            set(value) {
                const { options } = this.elementInstance.tooltip;
                options.isFixed = value;
            },
            get() {
                const { options = {} } = this.elementInstance?.tooltip ?? {};
                return options.isFixed ?? false;
            }
        }
    },
    watch: {
        nodesOptions: {
            handler(nodes) {
                this.buildNodes(nodes);
            },
            immediate: true
        }
    },
    methods: {
        saveSvg() {
            const svgData = this.elementInstance.svgElement.outerHTML;
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = 'newSvg.svg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        buildNodes(nodes) {
            const {
                nodes: { length }
            } = this.props.colorSettings;
            if ((length > 0 && length === nodes.length) || nodes.length === 0) {
                return;
            }

            this.props.colorSettings.nodes = nodes.map(({ label: id }) => ({ id, fill: 'rgba(0,0,0,0)' }));
            this.propChanged('colorSettings');
        },
        addRule() {
            this.props.colorSettings.rules.push({
                from: null,
                to: null,
                fill: '#fff',
                stroke: '#000'
            });
            this.propChanged('colorSettings');
        },

        removeRule(idx) {
            this.props.colorSettings.rules.splice(idx, 1);
            this.propChanged('colorSettings');
        }
    },
    implicitCssModule: true
};
</script>

<style lang="pcss" module>
@b icon-btn {
    min-height: 24px;
}
</style>
