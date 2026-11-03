<template>
    <w-panel>
        <ui-container>
            <ui-input prop="title" placeholder="Помощник по вики">Заголовок</ui-input>

            <ui-select prop="displayMode" :options="options.displayModes">Режим отображения</ui-select>

            <ui-select v-if="props.displayMode !== 'inline'" prop="position" :options="options.positions">
                Положение кнопки
            </ui-select>

            <!-- Тексты чата -->
            <ui-has-panel>
                <div class="form-label form-label-small">Тексты чата</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Тексты чата', slot: 'texts' }]">
                        <template #texts>
                            <ui-container>
                                <div class="form-label form-label-small">Приветствие</div>
                                <ui-textarea prop="greeting" :rows="4" />

                                <ui-input prop="placeholder" placeholder="Задайте вопрос по вики…">
                                    Подсказка в поле ввода
                                </ui-input>

                                <div class="form-label form-label-small">Готовые вопросы (по одному в строке)</div>
                                <ui-textarea
                                    :value="suggestionsText"
                                    :rows="4"
                                    placeholder="Как добавить виджет на страницу?"
                                    @input="onSuggestionsInput"
                                />
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- Источник ответов -->
            <ui-has-panel>
                <div class="form-label form-label-small">Источник ответов</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Источник ответов', slot: 'backend' }]">
                        <template #backend>
                            <ui-container>
                                <ui-switch prop="useMockBackend">Демо-режим (без сервера)</ui-switch>

                                <ui-input
                                    v-if="!props.useMockBackend"
                                    prop="apiBase"
                                    placeholder="/api/wiki-assistant/">
                                    Адрес API помощника
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <!-- База знаний -->
            <ui-has-panel>
                <div class="form-label form-label-small">База знаний</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'База знаний', slot: 'corpus' }]">
                        <template #corpus>
                            <ui-container>
                                <ui-input prop="projectBaseUrl" placeholder="Пусто — определяется автоматически">
                                    Адрес проекта вики
                                </ui-input>

                                <div class="form-label form-label-small">
                                    Исключённые страницы (ссылка страницы в строке)
                                </div>
                                <ui-textarea
                                    :value="excludedText"
                                    :rows="4"
                                    placeholder="changelog"
                                    @input="onExcludedInput"
                                />

                                <ui-input prop="revalidateMinutes" type="number" min="1">
                                    Проверять обновления вики, мин
                                </ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

/**
 * Значение из события ввода: компоненты UI отдают строку, нативные — событие.
 * @param {string|Event} payload
 * @return {string}
 */
const inputValue = (payload) => {
    if (typeof payload === 'string') {
        return payload;
    }
    return payload && payload.target ? String(payload.target.value || '') : '';
};

/**
 * Строки textarea → массив непустых строк.
 * @param {string} text
 * @return {string[]}
 */
const toLines = (text) =>
    String(text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

export default {
    extends: Panel,

    meta: { name: 'Настройки', icon: 'cog-outline' },

    data: () => ({
        ...PanelInstanceTypeDescriptor,
        suggestionsText: '',
        excludedText: '',
        options: {
            displayModes: [
                { label: 'Плавающая кнопка', value: 'floating' },
                { label: 'Встроенный чат', value: 'inline' }
            ],
            positions: [
                { label: 'Справа внизу', value: 'bottom-right' },
                { label: 'Слева внизу', value: 'bottom-left' }
            ]
        }
    }),

    created() {
        // Локальная модель textarea: заполняется из пропов один раз, дальше пишем только в проп
        this.suggestionsText = (this.props.suggestions || []).join('\n');
        this.excludedText = (this.props.excludedSlugs || []).join('\n');
    },

    methods: {
        onSuggestionsInput(payload) {
            this.suggestionsText = inputValue(payload);
            this.props.suggestions = toLines(this.suggestionsText);
            this.propChanged('suggestions');
        },

        onExcludedInput(payload) {
            this.excludedText = inputValue(payload);
            this.props.excludedSlugs = toLines(this.excludedText);
            this.propChanged('excludedSlugs');
        }
    }
};
</script>
