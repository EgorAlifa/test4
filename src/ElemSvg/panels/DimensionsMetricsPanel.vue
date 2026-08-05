<template>
    <ui-panel-container>
        <ui-container>
            <ui-select prop="fields.metricId" :options="metricDimensionOptions">ID</ui-select>
            <ui-collapse>
                <template #header>Настройка подписей объектов</template>
                <ui-container>
                    <ui-input type="number" prop="labelOffsetY">Отступ подписей сверху</ui-input>
                    <ui-input type="number" prop="labelOffsetX">Отступ подписей слева</ui-input>
                    <ui-input type="number" prop="labelOffsetRight">Отступ подписей справа</ui-input>
                    <ui-input type="number" prop="offsetBetweenLabels">Отступ между подписями</ui-input>
                    <ui-button @click="addLabel">Добавить подпись</ui-button>
                    <ui-draggable handle=".drag-handle" v-model="props.labels" @change="propChanged('labels')">
                        <ui-collapse
                            :class="{ p: idx !== props.labels.length - 1 }"
                            v-for="(label, idx) in props.labels"
                            :key="idx">
                            <template #header>
                                <div class="d-flex flex-v-center gap-2">
                                    <i class="mdi mdi-drag mdi-18px drag-handle" />
                                    {{ label.field || 'Подпись ' + (idx + 1) }}
                                </div>
                            </template>
                            <ui-container>
                                <ui-select
                                    v-model="label.field"
                                    :options="metricDimensionOptions"
                                    @change="propChanged('labels')">
                                    Значение
                                </ui-select>

                                <ui-input-cp v-model="label.style.color" @change="propChanged('labels')">
                                    Цвет значения
                                </ui-input-cp>

                                <ui-input
                                    type="number"
                                    v-model.number="label.style.offsetY"
                                    @change="propChanged('labels')">
                                    Межстрочный отступ
                                </ui-input>

                                <ui-has-panel class="form-label form-label-small">
                                    Настройки шрифта
                                    <template #panel>
                                        <ui-panel :groups="[{ slot: 'default', name: 'Настройки шрифта' }]">
                                            <ui-container>
                                                <ui-has-two-columns>
                                                    <template #left>
                                                        <ui-input
                                                            v-model="label.style.fontFamily"
                                                            @change="propChanged('labels')">
                                                            Шрифт
                                                        </ui-input>
                                                    </template>
                                                    <template #right>
                                                        <ui-input-units
                                                            v-model="label.style.fontSize"
                                                            :units="FontSizes"
                                                            @change="propChanged('labels')">
                                                            Размер шрифта
                                                        </ui-input-units>
                                                    </template>
                                                </ui-has-two-columns>

                                                <ui-select
                                                    v-model="label.style.fontWeight"
                                                    :options="FontWeightOptions"
                                                    @change="propChanged('labels')">
                                                    Начертание шрифта
                                                </ui-select>
                                            </ui-container>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>

                                <ui-number-format v-model="label.format" @change="propChanged('labels')">
                                    Формат подписи
                                </ui-number-format>
                                <ui-has-two-columns>
                                    <template #left>
                                        <ui-input v-model="label.prefix.text" @change="propChanged('labels')">
                                            Префикс
                                        </ui-input>
                                    </template>
                                    <template #right>
                                        <ui-input v-model="label.postfix.text" @change="propChanged('labels')">
                                            Постфикс
                                        </ui-input>
                                    </template>
                                </ui-has-two-columns>

                                <w-common-style-options
                                    v-model="label.prefix.style"
                                    title="Настройки префикса"
                                    @change="propChanged('labels')" />
                                <w-common-style-options
                                    v-model="label.postfix.style"
                                    title="Настройки постфикса"
                                    @change="propChanged('labels')" />
                                <ui-button type="error" @click="removeLabel(idx)">Удалить</ui-button>
                            </ui-container>
                        </ui-collapse>
                    </ui-draggable>
                </ui-container>
            </ui-collapse>
            <ui-has-panel>
                <ui-switch prop="cardMode">Режим карточек показателей</ui-switch>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Карточки показателей' }]">
                        <ui-container>
                            <ui-hint>
                                <template #label>Как это работает</template>
                                Один и тот же шаблон карточки (заголовок + значение + % с
                                <br />
                                стрелкой + план) переиспользуется для каждой строки датасета —
                                <br />
                                строка ищется по тому же полю "ID" (fields.metricId) выше.
                            </ui-hint>
                            <ui-select prop="cardFields.titleField" :options="metricDimensionOptions">
                                Заголовок (строка 1)
                            </ui-select>
                            <ui-select prop="cardFields.titleField2" :options="metricDimensionOptions">
                                Заголовок (строка 2, необязательно)
                            </ui-select>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-select prop="cardFields.valueField" :options="metricDimensionOptions">
                                        Факт
                                    </ui-select>
                                </template>
                                <template #right>
                                    <ui-number-format prop="cardFields.valueFormat">Формат факта</ui-number-format>
                                </template>
                            </ui-has-two-columns>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-select prop="cardFields.planField" :options="metricDimensionOptions">
                                        План
                                    </ui-select>
                                </template>
                                <template #right>
                                    <ui-number-format prop="cardFields.planFormat">Формат плана</ui-number-format>
                                </template>
                            </ui-has-two-columns>
                            <ui-hint>
                                <template #label>% отклонения</template>
                                Если поле не выбрано — считается сам как abs(факт − план) / план.
                            </ui-hint>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-select prop="cardFields.percentField" :options="metricDimensionOptions">
                                        Поле % (необязательно)
                                    </ui-select>
                                </template>
                                <template #right>
                                    <ui-number-format prop="cardFields.percentFormat">Формат %</ui-number-format>
                                </template>
                            </ui-has-two-columns>
                            <ui-select prop="cardFields.positiveDirectionField" :options="metricDimensionOptions">
                                <ui-hint>
                                    <template #label>Поле направления "хорошо"</template>
                                    Значение строки: 'up' — рост зелёный, иначе — падение зелёное.
                                    <br />
                                    Пусто = по умолчанию рост зелёный (как positive_log в DAX).
                                </ui-hint>
                            </ui-select>
                            <ui-select prop="cardFields.highlightField" :options="metricDimensionOptions">
                                Поле подсветки (истина → карточка выделена)
                            </ui-select>
                            <ui-input prop="cardFields.planLabel">Подпись плана</ui-input>
                            <ui-collapse>
                                <template #header>Готовый текст вместо формата (необязательно)</template>
                                <ui-container>
                                    <ui-hint>
                                        <template #label>Когда это нужно</template>
                                        Если у строк разная точность (напр. "716" и "22,00" и "5,0"),
                                        один формат для всех не подходит — выберите поле с уже
                                        готовым текстом, оно покажется как есть вместо факта/плана/%.
                                    </ui-hint>
                                    <ui-select prop="cardFields.valueDisplayField" :options="metricDimensionOptions">
                                        Готовый текст факта
                                    </ui-select>
                                    <ui-select prop="cardFields.planDisplayField" :options="metricDimensionOptions">
                                        Готовый текст плана
                                    </ui-select>
                                    <ui-select prop="cardFields.percentDisplayField" :options="metricDimensionOptions">
                                        Готовый текст % (без стрелки, она добавляется сама)
                                    </ui-select>
                                </ui-container>
                            </ui-collapse>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-has-panel>
                <ui-switch prop="factorPanel.enabled">Режим панели отклонений</ui-switch>
                <template #panel>
                    <ui-panel :groups="[{ slot: 'default', name: 'Панель отклонений' }]">
                        <ui-container>
                            <ui-hint>
                                <template #label>Как это работает</template>
                                Число строк переменное. Для узла (или нескольких), выбранного ниже,
                                <br />
                                вместо карточки рисуется общий итог + список строк ("bold"/"section"/"item"),
                                <br />
                                которые виджет достраивает из ДРУГИХ строк датасета — сколько их и
                                <br />
                                какие значения, целиком зависит от текущего фильтра/периода.
                            </ui-hint>
                            <ui-select prop="factorPanel.nodeIds" :options="factorPanelNodeOptions" multiple>
                                Объекты-панели
                            </ui-select>
                            <ui-hint>
                                <template #label>Итоговое значение</template>
                                Берётся из строки, найденной как обычно (fields.metricId ==
                                data-id узла) — как у карточек.
                            </ui-hint>
                            <ui-has-two-columns>
                                <template #left>
                                    <ui-select prop="factorPanel.totalField" :options="metricDimensionOptions">
                                        Поле итога
                                    </ui-select>
                                </template>
                                <template #right>
                                    <ui-number-format prop="factorPanel.totalFormat">Формат итога</ui-number-format>
                                </template>
                            </ui-has-two-columns>
                            <ui-input prop="factorPanel.totalLabel">Подпись над итогом</ui-input>
                            <ui-hint>
                                <template #label>Строки списка</template>
                                Отдельные строки датасета, у каждой — поле группировки со
                                <br />
                                значением, равным ID строки-панели выше (связь "одна панель — много строк").
                            </ui-hint>
                            <ui-select prop="factorPanel.groupField" :options="metricDimensionOptions">
                                Поле группировки (= ID панели)
                            </ui-select>
                            <ui-select prop="factorPanel.orderField" :options="metricDimensionOptions">
                                Поле порядка (необязательно)
                            </ui-select>
                            <ui-select prop="factorPanel.typeField" :options="metricDimensionOptions">
                                <ui-hint>
                                    <template #label>Поле типа строки</template>
                                    Значения: 'bold' (жирный заголовок), 'section' (подзаголовок),
                                    'item' (строка label + value). Всё остальное = 'item'.
                                </ui-hint>
                            </ui-select>
                            <ui-select prop="factorPanel.labelField" :options="metricDimensionOptions">
                                Поле подписи строки
                            </ui-select>
                            <ui-select prop="factorPanel.valueField" :options="metricDimensionOptions">
                                Поле значения (для типа 'item')
                            </ui-select>
                        </ui-container>
                    </ui-panel>
                </template>
            </ui-has-panel>
            <ui-select prop="fields.metricByClick" :options="metricDimensionOptions">Событие при нажатии</ui-select>
            <ui-input prop="events.unselect">Событие при отмене выбора</ui-input>
            <ui-input-auto prop="routeUrl">Переход по ссылке</ui-input-auto>
            <ui-switch prop="resetStoreVariables">Обнуление переменных</ui-switch>
            <ui-switch prop="shouldDrawForeignObject">Другой способ отрисовки подписей</ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { FontWeightOptions } from '@goodt-wcore/panels';
import { PanelDatasetMixinTypes, usePanelDatasetMixin } from '@goodt-common/data';
import UiDraggable from 'vuedraggable';
import { PanelInstanceTypeDescriptor } from '../types';
import WCommonStyleOptions from './components/CommonStyleOptions.vue';
import { FontSizes } from './config';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    components: { UiDraggable, WCommonStyleOptions },
    static: {
        FontSizes,
        FontWeightOptions
    },

    meta: { name: 'Измерения/метрики', icon: 'gauge' },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }),
    computed: {
        metricDimensionOptions() {
            return [...this.metrics, ...this.dimensions];
        },
        factorPanelNodeOptions() {
            return this.elementInstance.nodesOptions.map(({ label }) => ({ label, value: label }));
        }
    },
    methods: {
        addLabel() {
            this.props.labels.push({
                field: null,
                format: null,
                offsetY: 40,
                style: { color: '#fff', fontFamily: 'Roboto', fontSize: '2rem', fontWeight: 500 },
                prefix: {
                    text: '',
                    style: { color: '#fff', fontFamily: 'Roboto', fontWeight: 500, fontSize: '2rem' }
                },
                postfix: {
                    text: '',
                    style: { color: '#fff', fontFamily: 'Roboto', fontWeight: 500, fontSize: '2rem' }
                }
            });
            this.propChanged('labels');
        },

        removeLabel(idx) {
            this.props.labels.splice(idx, 1);
            this.propChanged('labels');
        }
    }
};
</script>
