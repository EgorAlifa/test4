# Стандарт виджетов: «Я дизайнер» + «Оформление» + Vuex

> **Для кого**: Этот документ — универсальная спецификация.
> Дайте его в контекст вместе с кодом **любого** виджета — и виджет можно
> привести к единому стандарту без изучения других примеров.
>
> **Эталоны** (изучены и описаны здесь):
> - `ElemRoutesNavigator/panels/DesignerPanel.vue` — образец «Я дизайнер»
> - `ElemRoutesNavigator/panels/ExpertPanel.vue` — образец Vuex-интеграции
> - `ElemButton/panels/StylesPanel.vue` — альтернативный вариант «Я дизайнер»
> - `ElemSticker/panels/AppearancePanel.vue` — образец «Оформление»

---

## Содержание

1. [Структура виджета — целевой стандарт](#1-структура-виджета--целевой-стандарт)
2. [Панель «Оформление»](#2-панель-оформление)
3. [Панель «Я дизайнер»](#3-панель-я-дизайнер)
4. [Vuex Store Integration](#4-vuex-store-integration)
5. [Проп `customStyles` и CSS-инъекция](#5-проп-customstyles-и-css-инъекция)
6. [Полные шаблоны кода](#6-полные-шаблоны-кода)
7. [Чеклист рефакторинга любого виджета](#7-чеклист-рефакторинга-любого-виджета)

---

## 1. Структура виджета — целевой стандарт

### 1.1 Файловая структура

Каждый виджет должен иметь следующую структуру:

```
src/ElemXxx/
├── ElemXxx.vue             # Основной компонент (extends Elem)
├── descriptor.js           # Все пропы + meta { descriptor, panels }
├── constants.js            # Константы виджета
├── style.pcss              # Стили (или внутри .vue)
└── panels/
    ├── index.js            # Список панелей (async imports)
    ├── SettingsPanel.vue   # Настройки — специфичны для виджета
    ├── AppearancePanel.vue # «Оформление» ← ОБЯЗАТЕЛЬНА
    ├── DesignerPanel.vue   # «Я дизайнер» ← ОБЯЗАТЕЛЬНА
    └── ...                 # Прочие панели (по необходимости)
```

### 1.2 Порядок панелей в `panels/index.js`

```javascript
// panels/index.js — СТАНДАРТНЫЙ ПОРЯДОК
export default [
    () => import('./SettingsPanel.vue'),    // 1. Настройки (специфика виджета)
    () => import('./AppearancePanel.vue'),  // 2. Оформление (визуальные пропы)
    () => import('./DesignerPanel.vue'),    // 3. Я дизайнер (raw CSS)
    // ...остальные панели по необходимости
];
```

### 1.3 Meta-идентификаторы панелей

| Панель | `meta.name` | `meta.icon` |
|---|---|---|
| Настройки | Зависит от виджета | `'cog-outline'` или тематическая |
| **Оформление** | `'Оформление'` | `'palette-outline'` |
| **Я дизайнер** | `'Я дизайнер'` | `'palette'` |
| Переменные (VIBE) | `'Переменные'` | `'link-variant'` |

---

## 2. Панель «Оформление»

### 2.1 Назначение

«Оформление» — **визуальный редактор** свойств виджета через именованные пропы.
Пользователь видит понятные контролы (цвет, слайдер, переключатель) — без кода.

**Это не** CSS-редактор. Это настройка конкретных дизайн-свойств виджета.

### 2.2 Типичное содержимое

Панель делится на именованные секции. Каждая секция — блок с заголовком.
Набор секций зависит от виджета. Типичный состав:

```
├── [Цвета]         — основной цвет, фон, текст, акцент
├── [Форма]         — скругление, отступы, размеры
├── [Тень]          — box-shadow пресеты или ручной ввод
├── [Бордер]        — показать/скрыть, цвет, толщина
├── [Эффекты]       — прозрачность, blur, специфичные для виджета
└── [Прочее]        — специфичные для виджета настройки
```

### 2.3 Шаблон AppearancePanel

```vue
<template>
    <w-panel>
        <div class="oform-panel">

            <!-- ─── Секция: Цвета ──────────────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">Цвета</div>
                <div class="oform-row">
                    <span class="oform-label">Основной цвет</span>
                    <ui-input-cp
                        :value="props.primaryColor"
                        @input="set('primaryColor', $event)"
                    />
                </div>
                <div class="oform-row">
                    <span class="oform-label">Фон</span>
                    <ui-input-cp
                        :value="props.backgroundColor"
                        @input="set('backgroundColor', $event)"
                    />
                </div>
            </div>

            <!-- ─── Секция: Форма ──────────────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">Форма</div>
                <div class="oform-row">
                    <span class="oform-label">Скругление углов</span>
                    <ui-input-units
                        :value="props.borderRadius"
                        @input="set('borderRadius', $event)"
                    />
                </div>
            </div>

            <!-- ─── Секция: Тень ───────────────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">Тень</div>
                <div class="shadow-presets">
                    <button
                        v-for="s in shadowPresets"
                        :key="s.label"
                        class="shadow-btn"
                        :class="{ 'shadow-btn--active': props.boxShadow === s.value }"
                        :style="{ boxShadow: s.value || 'none' }"
                        @click="set('boxShadow', s.value)"
                    >{{ s.label }}</button>
                </div>
            </div>

            <!-- ─── Секция: Прозрачность ───────────────────────────────── -->
            <div class="oform-section">
                <div class="oform-section__title">
                    Прозрачность ({{ opacityPct }}%)
                </div>
                <input
                    type="range"
                    :value="opacityPct"
                    min="0" max="100" step="5"
                    class="oform-slider"
                    @input="setOpacity($event.target.value)"
                />
            </div>

        </div>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';

// Набор теней — одинаков для всех виджетов
const SHADOW_PRESETS = [
    { label: 'Нет',     value: 'none' },
    { label: 'Лёгкая',  value: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' },
    { label: 'Средняя', value: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)' },
    { label: 'Глубокая',value: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)' },
    { label: 'Чёткая',  value: '0 1px 3px rgba(0,0,0,0.3)' }
];

export default {
    extends: Panel,

    meta: { name: 'Оформление', icon: 'palette-outline' },

    data: () => ({
        shadowPresets: SHADOW_PRESETS
    }),

    computed: {
        opacityPct() {
            const v = parseFloat(this.props.opacity ?? 1);
            return Math.round(v * 100); // eslint-disable-line no-magic-numbers
        }
    },

    methods: {
        /** Универсальный сеттер пропа */
        set(prop, value) {
            this.$set(this.props, prop, value);
            this.propChanged(prop);
        },

        setOpacity(pct) {
            this.set('opacity', parseInt(pct, 10) / 100); // eslint-disable-line no-magic-numbers
        }
    }
};
</script>

<style scoped>
.oform-panel { padding: 12px; }

.oform-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
}
.oform-section:last-child { border-bottom: none; margin-bottom: 0; }

.oform-section__title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
    margin-bottom: 8px;
}

.oform-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
}
.oform-row:last-child { margin-bottom: 0; }

.oform-label {
    font-size: 12px;
    color: #475569;
    flex-shrink: 0;
}

/* Shadow presets */
.shadow-presets { display: flex; flex-wrap: wrap; gap: 6px; }
.shadow-btn {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 11px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: border-color 0.12s;
}
.shadow-btn:hover { border-color: #94a3b8; }
.shadow-btn--active { border-color: #4f6aff; color: #4f6aff; background: #f5f7ff; }

/* Opacity slider */
.oform-slider {
    width: 100%;
    height: 4px;
    appearance: none;
    background: #e2e8f0;
    border-radius: 2px;
    outline: none;
}
.oform-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px; height: 16px;
    background: #fff;
    border: 2px solid #4f6aff;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
</style>
```

### 2.4 Пропы, которые обязательно должны существовать в descriptor.js

Для того чтобы AppearancePanel могла работать, виджет должен иметь хотя бы
базовый набор пропов. Добавить в `descriptor.js`:

```javascript
// ─── Базовые стилевые пропы (одинаковы для всех виджетов) ───────────
opacity: {
    type: [String, Number],
    default: 1,
    description: 'Widget opacity (0–1)'
},
// Остальное — специфично для каждого виджета (цвета, тени, радиусы и пр.)
```

---

## 3. Панель «Я дизайнер»

### 3.1 Назначение

«Я дизайнер» — **CSS-редактор** для продвинутых пользователей.
Позволяет вводить произвольный CSS для конкретных CSS-классов виджета.

**Ключевые характеристики:**
- Показывает список CSS-элементов виджета (каждый раскрывается)
- Для каждого элемента: жёлтый блок с текущими стилями из «Оформление»
- Кнопка «Заполнить текущими» — переносит computed-стили в textarea
- Textarea с debounce 300 ms — сохраняет в единый проп `customStyles`
- Синий hint-box — напоминание о синтаксисе
- CSS-пресеты — готовые наборы стилей одним кликом

### 3.2 Как хранятся CSS: единый проп `customStyles`

**Важно:** вместо отдельного пропа на каждый элемент используется **один объектный проп** `customStyles`.
Это паттерн из `ElemRoutesNavigator`:

```javascript
// descriptor.js — единственный проп для всего кастомного CSS
customStyles: {
    type: Object,
    default: () => ({}),
    description: 'Custom CSS per element. Keys match cssElements keys in DesignerPanel.'
    // Пример: { container: 'border: 2px solid red;', button: 'font-weight: 900;' }
}
```

DesignerPanel пишет:
```javascript
this.props.customStyles = { ...this.localStyles };
this.propChanged('customStyles');
```

Основной компонент читает и применяет:
```javascript
// ElemXxx.vue — computed
customCssContent() {
    const styles = this.props.customStyles;
    if (!styles || typeof styles !== 'object') return null;
    // Маппинг ключ → CSS-селектор — определяется каждым виджетом
    const selectorMap = {
        container: '.my-widget-root',
        button:    '.my-widget-button',
        // ...
    };
    return Object.entries(styles)
        .filter(([, css]) => css)
        .map(([key, css]) => `${selectorMap[key]} { ${css} }`)
        .join('\n') || null;
}
```

### 3.3 Структура `elements` в DesignerPanel

```javascript
// DesignerPanel.vue — computed elements()
// Определяет перечень CSS-элементов, доступных для редактирования
elements() {
    return [
        {
            key: 'container',     // ключ в localStyles и customStyles
            label: 'Контейнер',  // отображаемое название в панели
            selector: '.my-widget-root'  // CSS-селектор для документирования
        },
        {
            key: 'content',
            label: 'Содержимое',
            selector: '.my-widget-content'
        },
        // ...по одному объекту на каждый стилизуемый CSS-элемент виджета
    ];
}
```

### 3.4 `getElementDefaultStyles(key)` — ядро DesignerPanel

Эта функция читает текущие пропы виджета (через `this.props`) и возвращает
строку CSS, которую отображает жёлтый блок и вставляет кнопка «Заполнить текущими».

```javascript
// DesignerPanel.vue — метод для ПЕРЕОПРЕДЕЛЕНИЯ в каждом виджете
getElementDefaultStyles(key) {
    const p = this.props;
    switch (key) {
        case 'container':
            return [
                `background-color: ${p.backgroundColor || '#ffffff'};`,
                `color: ${p.textColor || '#1f2937'};`,
                `border-radius: ${p.borderRadius || '8px'};`,
                p.boxShadow ? `box-shadow: ${p.boxShadow};` : null,
                p.opacity != null && p.opacity < 1 ? `opacity: ${p.opacity};` : null,
            ].filter(Boolean).join('\n');

        case 'button':
            return [
                `padding: ${p.btnPaddingV || '10px'} ${p.btnPaddingH || '20px'};`,
                `font-size: ${p.btnFontSize || '14px'};`,
                `font-weight: ${p.btnFontWeight || '500'};`,
                `background: ${p.btnBg || '#4f6aff'};`,
                `color: ${p.btnColor || '#fff'};`,
            ].filter(Boolean).join('\n');

        default:
            return '/* нет предустановленных стилей */';
    }
}
```

### 3.5 Полный шаблон DesignerPanel

```vue
<template>
    <w-panel>
        <ui-container>

            <!-- ── CSS пресеты ──────────────────────────────────────────── -->
            <div class="dp-section-label">Пресеты стилей</div>
            <div class="dp-presets">
                <button
                    v-for="p in cssPresets"
                    :key="p.label"
                    class="dp-preset-chip"
                    @click="applyPreset(p)">
                    {{ p.label }}
                </button>
            </div>

            <!-- ── Редакторы по элементам ──────────────────────────────── -->
            <div v-for="el in elements" :key="el.key" class="dp-el-wrap">

                <!-- Заголовок секции (раскрывалка) -->
                <div class="dp-el-hd" @click="toggle(el.key)">
                    <span class="dp-el-hd__label">{{ el.label }}</span>
                    <code class="dp-el-hd__sel">{{ el.selector }}</code>
                    <i class="mdi"
                       :class="open[el.key] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>

                <!-- Тело секции -->
                <div v-if="open[el.key]" class="dp-el-body">

                    <!-- Жёлтый блок: текущие стили из «Оформление» -->
                    <div class="dp-defaults-box">
                        <div class="dp-defaults-box__title">
                            Текущие настройки из панели «Оформление»:
                        </div>
                        <pre class="dp-defaults-box__pre">{{ getElementDefaultStyles(el.key) }}</pre>
                    </div>

                    <!-- Заголовок редактора + кнопка заполнения -->
                    <div class="dp-editor-hd">
                        <span class="dp-editor-hd__label">CSS свойства</span>
                        <button class="dp-fill-btn" type="button"
                                @click="fillWithDefaults(el.key)">
                            <i class="mdi mdi-keyboard-outline" />
                            Заполнить текущими
                        </button>
                    </div>

                    <!-- CSS textarea -->
                    <textarea
                        v-model="localStyles[el.key]"
                        class="dp-textarea"
                        spellcheck="false"
                        placeholder="font-weight: 700;&#10;letter-spacing: 0.05em;"
                        @input="onInput(el.key)" />

                    <!-- Синий hint -->
                    <div class="dp-hint-box">
                        <i class="mdi mdi-information-outline" />
                        <span>
                            Только CSS свойства без селекторов:
                            <code>color: red; font-weight: bold;</code>
                        </span>
                    </div>

                    <!-- Сброс элемента -->
                    <button class="dp-reset-btn" type="button"
                            @click="resetElement(el.key)">
                        Сбросить {{ el.label.toLowerCase() }}
                    </button>
                </div>
            </div>

            <!-- ── Глобальный сброс ─────────────────────────────────────── -->
            <ui-button type="ghost" class="mt-2" @click="resetAll">
                Сбросить весь CSS
            </ui-button>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';

export default {
    extends: Panel,

    meta: { name: 'Я дизайнер', icon: 'palette' },

    data: () => ({
        localStyles: {},   // { [key]: 'css string' }
        open: {},          // { [key]: boolean }
        debounceTimer: null,

        // ── ЗАМЕНИТЬ ПОД КОНКРЕТНЫЙ ВИДЖЕТ ───────────────────────────
        cssPresets: [
            {
                label: 'Неон',
                // ключи совпадают с elements[].key
                container: 'border: 2px solid currentColor;\nbox-shadow: 0 0 12px currentColor;',
                button: 'text-transform: uppercase;\nletter-spacing: 0.08em;'
            },
            {
                label: '3D',
                container: 'box-shadow: 0 8px 0 rgba(0,0,0,0.2), 0 10px 14px rgba(0,0,0,0.15);',
                button: 'box-shadow: 0 4px 0 rgba(0,0,0,0.25);'
            },
            {
                label: 'Сброс'
                // без ключей = очистить все
            }
        ]
        // ─────────────────────────────────────────────────────────────
    }),

    computed: {
        // ── ЗАМЕНИТЬ ПОД КОНКРЕТНЫЙ ВИДЖЕТ ───────────────────────────
        elements() {
            return [
                {
                    key: 'container',
                    label: 'Контейнер',
                    selector: '.my-widget-root'   // ← CSS-класс корневого элемента
                },
                {
                    key: 'button',
                    label: 'Кнопка',
                    selector: '.my-widget-button' // ← пример доп. элемента
                }
                // ... добавить все стилизуемые элементы виджета
            ];
        }
        // ─────────────────────────────────────────────────────────────
    },

    mounted() {
        // Инициализировать localStyles и open из props
        const saved = this.props.customStyles || {};
        this.elements.forEach(el => {
            this.$set(this.localStyles, el.key, saved[el.key] || '');
            this.$set(this.open, el.key, false);
        });
    },

    beforeDestroy() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    },

    methods: {
        toggle(key) {
            this.$set(this.open, key, !this.open[key]);
        },

        onInput(key) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.props.customStyles = { ...this.localStyles };
                this.propChanged('customStyles');
            }, 300);
        },

        // ── ЗАМЕНИТЬ ПОД КОНКРЕТНЫЙ ВИДЖЕТ ───────────────────────────
        getElementDefaultStyles(key) {
            // Читает this.props и возвращает строку CSS
            // Отражает текущие настройки из панели «Оформление»
            return '/* Переопределить getElementDefaultStyles() для этого виджета */';
        },
        // ─────────────────────────────────────────────────────────────

        fillWithDefaults(key) {
            const css = this.getElementDefaultStyles(key);
            this.$set(this.localStyles, key, css);
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        resetElement(key) {
            this.$set(this.localStyles, key, '');
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        applyPreset(preset) {
            this.elements.forEach(el => {
                const css = preset[el.key] ?? '';
                this.$set(this.localStyles, el.key, css);
            });
            this.props.customStyles = { ...this.localStyles };
            this.propChanged('customStyles');
        },

        resetAll() {
            this.elements.forEach(el => this.$set(this.localStyles, el.key, ''));
            this.props.customStyles = {};
            this.propChanged('customStyles');
        }
    }
};
</script>

<style scoped>
/* ── Section label ─────────────────────────────────────────────────── */
.dp-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: #94a3b8; margin: 4px 0 6px;
}

/* ── Preset chips ──────────────────────────────────────────────────── */
.dp-presets { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.dp-preset-chip {
    padding: 4px 11px; border-radius: 20px; border: 1.5px solid #e2e8f0;
    background: #fff; color: #475569; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: 0.12s;
}
.dp-preset-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }

/* ── Element accordion ─────────────────────────────────────────────── */
.dp-el-wrap { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 8px; }
.dp-el-hd {
    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    background: #f8fafc; cursor: pointer; user-select: none;
    transition: background 0.12s;
}
.dp-el-hd:hover { background: #f1f5ff; }
.dp-el-hd__label { flex: 1; font-size: 13px; font-weight: 600; color: #1e293b; }
.dp-el-hd__sel {
    font-family: monospace; font-size: 11px; color: #64748b;
    background: #e2e8f0; padding: 2px 7px; border-radius: 4px;
}
.dp-el-hd .mdi { font-size: 18px; color: #94a3b8; }

.dp-el-body {
    padding: 12px; display: flex; flex-direction: column; gap: 10px;
    background: #fff; border-top: 1px solid #e2e8f0;
}

/* ── Yellow defaults box ───────────────────────────────────────────── */
.dp-defaults-box { padding: 10px 12px; background: #fef9ec; border-radius: 8px; border: 1px solid #fde68a; }
.dp-defaults-box__title { font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 6px; }
.dp-defaults-box__pre { font-family: monospace; font-size: 11px; color: #78350f; white-space: pre-wrap; line-height: 1.5; margin: 0; }

/* ── Editor header ─────────────────────────────────────────────────── */
.dp-editor-hd { display: flex; align-items: center; justify-content: space-between; }
.dp-editor-hd__label { font-size: 12px; font-weight: 600; color: #334155; }
.dp-fill-btn {
    display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px;
    background: #3b82f6; color: #fff; border: none; border-radius: 6px;
    font-size: 11px; cursor: pointer; font-weight: 500; font-family: inherit;
    transition: background 0.12s;
}
.dp-fill-btn:hover { background: #2563eb; }
.dp-fill-btn .mdi { font-size: 13px; }

/* ── CSS textarea ──────────────────────────────────────────────────── */
.dp-textarea {
    width: 100%; height: 80px; font-family: 'Consolas', monospace;
    font-size: 12px; line-height: 1.55; padding: 9px 11px; background: #f8fafc;
    color: #1e293b; border: 1.5px solid #e2e8f0; border-radius: 8px;
    resize: vertical; min-height: 52px; box-sizing: border-box; outline: none;
    transition: border-color 0.15s;
}
.dp-textarea:focus { border-color: #4f6aff; background: #fff; }

/* ── Blue hint box ─────────────────────────────────────────────────── */
.dp-hint-box {
    display: flex; align-items: flex-start; gap: 8px; padding: 9px 11px;
    background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
    font-size: 12px; color: #1e40af; line-height: 1.5;
}
.dp-hint-box .mdi { font-size: 15px; color: #3b82f6; flex-shrink: 0; margin-top: 2px; }
.dp-hint-box code { padding: 1px 5px; background: #dbeafe; border-radius: 3px; font-family: monospace; font-size: 11px; }

/* ── Reset element button ──────────────────────────────────────────── */
.dp-reset-btn {
    align-self: flex-start; padding: 5px 13px; border: 1.5px solid #e2e8f0;
    border-radius: 6px; background: #fff; color: #64748b; font-size: 11px;
    cursor: pointer; font-family: inherit; transition: 0.12s;
}
.dp-reset-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
</style>
```

---

## 4. Vuex Store Integration

### 4.1 Зачем

Vuex-интеграция позволяет виджету/панели:
- Читать данные (маршруты, переменные, конфиги) из редактора в реальном времени
- Реагировать на изменения без перезагрузки страницы
- Работать как в режиме редактора (Vuex доступен), так и в режиме плеера (fallback)

**Образец:** `ElemRoutesNavigator/panels/ExpertPanel.vue` — полная рабочая реализация.

### 4.2 Алгоритм поиска Vuex Store (fallback-цепочка)

Vuex-стор не всегда доступен через `this.$store`. Используется цепочка из 5+ источников:

```javascript
/**
 * Находит Vuex store экземпляр.
 * Возвращает store или null.
 */
findVuexStore() {
    // Источники в порядке приоритета
    const candidates = [
        () => this.$store,
        () => this.$root?.$store,
        () => window.$nuxt?.$store,
        () => window.__NUXT__?.$store,
        () => window.__VUE__?.$store,
        () => window.parent?.$nuxt?.$store,
        () => window.parent?.__NUXT__?.$store
    ];

    for (const getStore of candidates) {
        try {
            const store = getStore();
            if (store?.state) return store;
        } catch (e) { /* игнорировать */ }
    }
    return null;
}
```

### 4.3 Пути к данным в store.state (маршруты/страницы)

```javascript
/**
 * Ищет данные (например, routes) в store.state по нескольким путям.
 * Возвращает первый найденный массив или null.
 */
findInStore(store, paths) {
    const state = store.state;
    for (const pathFn of paths) {
        try {
            const value = pathFn(state);
            if (value != null) return value;
        } catch (e) { /* продолжить поиск */ }
    }
    return null;
}

// Стандартные пути для маршрутов/страниц (из ElemRoutesNavigator):
const ROUTE_PATHS = [
    (s) => s?.app?.app?.data?.routes,
    (s) => s?.app?.data?.routes,
    (s) => s?.app?.routes,
    (s) => s?.editor?.data?.routes,
    (s) => s?.editor?.routes,
    (s) => s?.routes
];

// Стандартные пути для переменных платформы:
const VAR_PATHS = [
    (s) => s?.vars,
    (s) => s?.variables,
    (s) => s?.store
];
```

### 4.4 Подписка на мутации с debounce

```javascript
/**
 * Подписывается на Vuex mutations.
 * Вызывает handler с задержкой при изменениях.
 *
 * @param {Object} store - Vuex store
 * @param {string[]} keywords - ключевые слова в типе мутации (строчные)
 * @param {Function} handler - callback
 * @param {number} debounceMs - задержка (300 рекомендовано)
 */
setupStoreObserver(store, keywords, handler, debounceMs = 300) {
    this.storeUnsubscribe?.();  // снять предыдущую подписку
    this.storeUnsubscribe = store.subscribe((mutation) => {
        const type = mutation.type.toLowerCase();
        if (keywords.some(k => type.includes(k))) {
            clearTimeout(this.routesReloadDebounce);
            this.routesReloadDebounce = setTimeout(handler, debounceMs);
        }
    });
}
```

### 4.5 Обязательная очистка

```javascript
// В beforeDestroy компонента/панели
beforeDestroy() {
    if (this.storeUnsubscribe) {
        this.storeUnsubscribe();
        this.storeUnsubscribe = null;
    }
    if (this.routesReloadDebounce) {
        clearTimeout(this.routesReloadDebounce);
        this.routesReloadDebounce = null;
    }
}
```

### 4.6 Полный шаблон интеграции (для вставки в панель или компонент)

```javascript
// Добавить в data():
data: () => ({
    storeUnsubscribe: null,
    routesReloadDebounce: null,
    storeData: []     // результат загрузки из стора
}),

// Добавить в mounted():
async mounted() {
    await this.loadFromStore();
    this.setupStoreObserver();
},

// Добавить в beforeDestroy():
beforeDestroy() {
    if (this.storeUnsubscribe) {
        this.storeUnsubscribe();
        this.storeUnsubscribe = null;
    }
    clearTimeout(this.routesReloadDebounce);
},

// Добавить в methods:
methods: {
    async loadFromStore() {
        const store = this.findVuexStore();
        if (!store) return;

        // ← ИЗМЕНИТЬ: пути поиска зависят от нужных данных
        const data = this.findInStore(store, [
            (s) => s?.app?.app?.data?.routes,
            (s) => s?.app?.data?.routes,
            (s) => s?.app?.routes,
            (s) => s?.editor?.data?.routes,
            (s) => s?.editor?.routes,
            (s) => s?.routes
        ]);

        if (data) {
            this.storeData = data;
            this.setupStoreObserver(store);
        }
    },

    findVuexStore() {
        const candidates = [
            () => this.$store,
            () => this.$root?.$store,
            () => window.$nuxt?.$store,
            () => window.__NUXT__?.$store,
            () => window.__VUE__?.$store
        ];
        for (const get of candidates) {
            try { const s = get(); if (s?.state) return s; } catch (e) {}
        }
        return null;
    },

    findInStore(store, paths) {
        for (const fn of paths) {
            try { const v = fn(store.state); if (v != null) return v; } catch (e) {}
        }
        return null;
    },

    setupStoreObserver(store) {
        this.storeUnsubscribe?.();
        // ← ИЗМЕНИТЬ: ключевые слова мутаций для этого виджета
        const WATCH_KEYWORDS = ['route', 'page', 'setroutes'];
        this.storeUnsubscribe = store.subscribe((mutation) => {
            const type = mutation.type.toLowerCase();
            if (WATCH_KEYWORDS.some(k => type.includes(k))) {
                clearTimeout(this.routesReloadDebounce);
                this.routesReloadDebounce = setTimeout(() => this.loadFromStore(), 300);
            }
        });
    }
}
```

---

## 5. Проп `customStyles` и CSS-инъекция

### 5.1 Добавить в descriptor.js любого виджета

```javascript
// descriptor.js — обязательный проп для DesignerPanel
customStyles: {
    type: Object,
    default: () => ({}),
    description: 'Custom CSS per UI element (written in DesignerPanel). ' +
                 'Object keys correspond to element keys defined in DesignerPanel.elements'
}
```

### 5.2 Добавить в основной компонент виджета (ElemXxx.vue)

**Computed:**

```javascript
// ElemXxx.vue — computed
customCssContent() {
    const styles = this.props.customStyles;
    if (!styles || typeof styles !== 'object') return null;

    // ← ИЗМЕНИТЬ: маппинг ключей DesignerPanel на CSS-селекторы виджета
    const selectorMap = {
        container: '.my-widget-root',
        content:   '.my-widget-content',
        button:    '.my-widget-button',
        // ...
    };

    const css = Object.entries(selectorMap)
        .filter(([key]) => styles[key])
        .map(([key, selector]) => `${selector} { ${styles[key]} }`)
        .join('\n');

    return css || null;
}
```

**Template** (добавить в конец корневого элемента):

```vue
<!-- ElemXxx.vue — в конце template, внутри корневого тега -->
<component
    v-if="customCssContent"
    :is="'style'"
    v-html="customCssContent"
/>
```

### 5.3 Scoped styles и `customCssContent`

Стили через `<style scoped>` получают уникальный атрибут-хэш (`data-v-xxxxxxxx`).
Инжектируемый через `customCssContent` CSS **не scoped** — он глобальный в scope страницы.

Это ожидаемое поведение: пользователь явно пишет CSS-селектор и знает,
что он может затронуть другие экземпляры этого виджета на странице.

Если нужна изоляция — добавить уникальный `id` к корневому элементу и строить
селекторы через него: `#widget-${this.id} .my-widget-button { ... }`.

---

## 6. Полные шаблоны кода

### 6.1 panels/index.js (стандартный)

```javascript
/**
 * ElemXxx Panels
 * Порядок: Настройки → Оформление → Я дизайнер → [прочие]
 */
export default [
    () => import('./SettingsPanel.vue'),    // «Настройки» / специфичное название
    () => import('./AppearancePanel.vue'),  // «Оформление»
    () => import('./DesignerPanel.vue'),    // «Я дизайнер»
    // () => import('./VariablesPanel.vue') // «Переменные» (если есть VIBE 2.0)
];
```

### 6.2 Минимальный descriptor.js со всеми нужными пропами

```javascript
import panels from './panels';

export const descriptor = () => ({
    props: {
        // ─── Специфичные для виджета пропы ──────────────────────────
        // ... (зависит от виджета)

        // ─── Базовые стилевые пропы (AppearancePanel) ───────────────
        backgroundColor: { type: String, default: '#ffffff' },
        textColor:       { type: String, default: '#1f2937' },
        borderRadius:    { type: String, default: '8px' },
        boxShadow:       { type: String, default: '' },
        opacity:         { type: [String, Number], default: 1 },

        // ─── DesignerPanel (Я дизайнер) ─────────────────────────────
        customStyles: {
            type: Object,
            default: () => ({})
        }
    },
    vars: {},
    cssVars: {}
});

export const meta = { descriptor, panels };
export default descriptor;
```

---

## 7. Чеклист рефакторинга любого виджета

При получении кода любого виджета — пройти по этому чеклисту сверху вниз.

### Шаг 1: Анализ

- [ ] Прочитать `panels/index.js` — какие панели существуют?
- [ ] Есть ли панель с `meta.name === 'Оформление'` или `'Внешний вид'`?
- [ ] Есть ли панель с `meta.name === 'Я дизайнер'`?
- [ ] Есть ли в `descriptor.js` проп `customStyles`?
- [ ] Есть ли в основном `.vue` файле `customCssContent` и `<style>` тег?
- [ ] Есть ли в компоненте или панелях `storeUnsubscribe`?

### Шаг 2: Добавить проп `customStyles` в descriptor.js

Если `customStyles` нет:
```javascript
customStyles: { type: Object, default: () => ({}) }
```

### Шаг 3: Добавить CSS-инъекцию в основной компонент

Если `customCssContent` нет — добавить computed и `<component :is="'style'">` по шаблону из секции 5.

### Шаг 4: Добавить/переименовать панель «Оформление»

- Если нет `AppearancePanel.vue` — создать по шаблону из секции 2.3
- Если есть, но `meta.name !== 'Оформление'` — поменять `meta.name`
- Убедиться что `meta.icon = 'palette-outline'`

### Шаг 5: Добавить/переименовать панель «Я дизайнер»

- Если нет `DesignerPanel.vue` — создать по шаблону из секции 3.5
- Заполнить `elements()` computed реальными CSS-классами виджета (взять из `<style>` основного компонента)
- Заполнить `getElementDefaultStyles()` реальными пропами виджета
- Заполнить `cssPresets` осмысленными пресетами
- Если уже есть панель «Я дизайнер» — проверить что использует `customStyles` объект (не отдельные пропы)

### Шаг 6: Добавить Vuex-интеграцию (если нужна)

Нужна, если виджет работает с данными из редактора (маршруты, переменные, конфиги).
- Добавить `storeUnsubscribe`, `routesReloadDebounce` в `data()`
- Добавить методы `findVuexStore()`, `findInStore()`, `setupStoreObserver()` по шаблону из секции 4.6
- Вызвать `loadFromStore()` + `setupStoreObserver()` в `mounted()`
- Очистить в `beforeDestroy()`

### Шаг 7: Обновить panels/index.js

```javascript
// Привести к стандартному порядку:
export default [
    () => import('./SettingsPanel.vue'),   // специфичное для виджета
    () => import('./AppearancePanel.vue'), // «Оформление»
    () => import('./DesignerPanel.vue'),   // «Я дизайнер»
    // ...остальные
];
```

---

## Приложение: Стандартные CSS-пресеты

Одинаковые CSS-пресеты для всех виджетов. Вставить в `cssPresets` DesignerPanel,
добавив нужные ключи элементов:

```javascript
// В DesignerPanel.vue — cssPresets базовый набор
// (добавить ключи ваших элементов в каждый пресет)
[
    {
        label: 'Неон',
        container: 'border: 2px solid currentColor;\nbox-shadow: 0 0 10px currentColor, inset 0 0 10px rgba(255,255,255,0.05);'
    },
    {
        label: '3D',
        container: 'box-shadow: 0 8px 0 rgba(0,0,0,0.18), 0 10px 18px rgba(0,0,0,0.12);\ntransform: translateY(-2px);'
    },
    {
        label: 'Стекло',
        container: 'background: rgba(255,255,255,0.1) !important;\nbackdrop-filter: blur(12px);\nborder: 1px solid rgba(255,255,255,0.2);'
    },
    {
        label: 'Тёмный',
        container: 'background: #0f172a !important;\ncolor: #e2e8f0 !important;\nborder: 1px solid #334155;'
    },
    {
        label: 'Минимализм',
        container: 'background: transparent !important;\nborder: 1.5px solid currentColor;'
    },
    {
        label: 'Сброс'
        // без ключей — очищает всё
    }
]
```

---

## Приложение: Примеры реализаций из кодовой базы

| Виджет | Панель | Особенности реализации |
|---|---|---|
| `ElemRoutesNavigator` | `DesignerPanel.vue` | Эталон: `customStyles` объект, `ui-has-panel` + `ui-panel` слоты, 12 элементов |
| `ElemRoutesNavigator` | `ExpertPanel.vue` | Эталон Vuex: полная цепочка поиска стора, dragDrop, debounce 300ms |
| `ElemButton` | `StylesPanel.vue` | Альтернатива: отдельные пропы `btnCustomCss`/`btnHoverCss` вместо объекта |
| `ElemSticker` | `AppearancePanel.vue` | Образец «Оформление»: секции tape, pin, paper, rotation, shadow, spacing |
| `ElemText` | `DesignerPanel.vue` | Вариант через accordion + именованные пропы (не raw CSS), добавлена секция CSS |
| `ElemButton` | `OptionsPanel.vue` | Vuex для маршрутов: `availableRoutes`, `storeUnsubscribe`, dropdown страниц |

---

*Документ: WIDGET_REFACTORING_SPEC.md · Версия 2.0 · 2026-03-02*
*Эталонный виджет: `src/ElemRoutesNavigator/`*
