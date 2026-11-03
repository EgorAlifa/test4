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
                                <ui-select prop="backendMode" :options="options.backendModes">
                                    Источник ответов
                                </ui-select>

                                <ui-input
                                    v-if="props.backendMode === 'server'"
                                    prop="apiBase"
                                    placeholder="/api/wiki-assistant/">
                                    Адрес API помощника
                                </ui-input>

                                <ui-has-panel v-if="props.backendMode === 'local'">
                                    <div class="form-label form-label-small">Модель</div>
                                    <template #panel>
                                        <ui-panel :groups="[{ name: 'Модель', slot: 'llm' }]">
                                            <template #llm>
                                                <ui-container>
                                                    <ui-input prop="llmBaseUrl" placeholder="https://api.openai.com/v1">
                                                        Адрес API модели
                                                    </ui-input>

                                                    <ui-input prop="llmModel" placeholder="gpt-4o-mini">
                                                        Модель
                                                    </ui-input>

                                                    <ui-input prop="llmApiKey" type="password" autocomplete="off">
                                                        Ключ API модели
                                                    </ui-input>

                                                    <div class="form-label form-label-small text-warning">
                                                        Ключ сохраняется в настройках проекта и виден любому зрителю.
                                                        Для боевого стенда укажите прокси, который добавляет ключ сам,
                                                        и оставьте поле пустым.
                                                    </div>

                                                    <ui-input prop="llmAuthHeader" placeholder="Authorization">
                                                        Заголовок авторизации
                                                    </ui-input>

                                                    <ui-input prop="llmAuthPrefix" placeholder="Bearer ">
                                                        Префикс ключа
                                                    </ui-input>

                                                    <ui-input prop="llmTemperature" type="number" min="0" max="2" step="0.1">
                                                        Температура
                                                    </ui-input>

                                                    <ui-input prop="llmMaxTokens" type="number" min="1">
                                                        Максимум токенов ответа
                                                    </ui-input>

                                                    <ui-switch prop="llmSupportsStream">Потоковый ответ (stream)</ui-switch>
                                                </ui-container>
                                            </template>
                                        </ui-panel>
                                    </template>
                                </ui-has-panel>
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
            backendModes: [
                { label: 'Мок (без модели)', value: 'mock' },
                { label: 'Модель из браузера', value: 'local' },
                { label: 'Сервер (apiBase)', value: 'server' }
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
