# Спецификация рефакторинга виджетов: ElemButton · ElemSticker · ElemText

> **Цель документа**: Полный технический план для добавления панели «Я дизайнер»,
> панели «Оформление» и интеграции с Vuex-хранилищем по образцу
> `ElemRoutesNavigator / ExpertPanel` к трём передовым виджетам.
>
> Дав этот документ в контекст — можно полностью переработать любой из трёх виджетов.

---

## 1. Контекст и эталонная реализация

### 1.1 Что уже сделано (эталон — ElemRoutesNavigator)

`ElemRoutesNavigator` — зрелый виджет с четырьмя панелями:

| Панель | Файл | Meta-имя |
|---|---|---|
| Настройки | `panels/SettingsPanel.vue` | «Настройки» |
| Оформление/Пагинация | `panels/PaginationPanel.vue` | «Оформление» |
| Эксперт | `panels/ExpertPanel.vue` | «Эксперт» |
| Я дизайнер | `panels/DesignerPanel.vue` | «Я дизайнер» |

**Ключевые паттерны** ExpertPanel:
1. При монтировании читает маршруты из Vuex-стора через цепочку поиска
2. Подписывается на `store.subscribe()` и следит за мутациями с debounce 300 ms
3. Хранит `storeUnsubscribe` и очищает подписку в `beforeDestroy`
4. Имеет fallback-цепочку поиска стора: `$store → $root.$store → window.$nuxt.$store → window.__NUXT__.$store → window.__VUE__.$store`

**Ключевые паттерны** DesignerPanel («Я дизайнер»):
1. `meta: { name: 'Я дизайнер', icon: 'palette' }`
2. `localStyles` — объект с ключами по CSS-элементам виджета
3. `cssElements` — массив `{ key, label, selector, placeholder }`
4. `cssPresets` — готовые CSS-пресеты (массив preset-чипов)
5. `getElementDefaultStyles(key)` — возвращает текущие стили из пропов
6. `fillWithCurrentStyles(key)` — заполняет textarea текущими стилями
7. `resetElement(key)` / `resetAll()` — сброс
8. Debounce 300 ms при сохранении через `propChanged()`

---

## 2. Анализ текущего состояния виджетов

### 2.1 ElemButton

**Файловая структура:**
```
src/ElemButton/
├── ElemButton.vue          # Основной компонент
├── descriptor.js           # Пропы + meta
├── constants.js            # POPUP_LIFETIME = 2000
├── utils.js                # buildSerializedStoreUrl()
├── ElemButton.d.ts         # TypeScript
├── types.d.ts
└── panels/
    ├── index.js            # [OptionsPanel, BufferCopyPanel, StylesPanel, AppearancePanel]
    ├── OptionsPanel.vue    # Действия кнопки + Vuex маршруты (УЖЕ ЕСТЬ store integration!)
    ├── AppearancePanel.vue # Внешний вид (live preview, шрифт, цвета, эффекты)
    ├── StylesPanel.vue     # CSS редактор — meta: 'Я дизайнер' (УЖЕ ЕСТЬ!)
    ├── BufferCopyPanel.vue # Копирование в буфер
    └── components/
        └── ButtonLabelEditor.vue
```

**Текущие панели (порядок в index.js):**
1. `OptionsPanel` — «Действия»
2. `BufferCopyPanel` — «Копирование»
3. `StylesPanel` — «**Я дизайнер**» ✅ (уже есть)
4. `AppearancePanel` — «Внешний вид»

**Чего не хватает:**
- ❌ Отдельной панели «**Оформление**» (AppearancePanel называется «Внешний вид», не «Оформление»)
- ⚠️ Vuex-интеграция есть только в OptionsPanel (маршруты для URL), но не в самом виджете и не в StylesPanel

**Имеющийся Vuex-паттерн в OptionsPanel** (уже отработан):
```javascript
// OptionsPanel.vue — пример заготовки для переноса в ElemButton
data: () => ({
    availableRoutes: [],
    storeUnsubscribe: null
}),
methods: {
    loadRoutes() { /* цепочка поиска стора */ },
    setupStoreObserver(store) {
        this.storeUnsubscribe = store.subscribe((mutation) => { ... });
    }
},
beforeDestroy() { this.storeUnsubscribe?.(); }
```

---

### 2.2 ElemSticker

**Файловая структура:**
```
src/ElemSticker/
├── ElemSticker.vue         # Основной компонент
├── descriptor.js           # Пропы + aiMeta + presets + varBindings
├── styles/
│   └── css-vars.js
└── panels/
    ├── index.js            # [ContentPanel, AppearancePanel, MetadataPanel, VariablesPanel]
    ├── ContentPanel.vue    # Содержимое + тема + пресеты
    ├── AppearancePanel.vue # «Оформление» (tape, pin, paper, rotation...)
    ├── MetadataPanel.vue   # Автор, дата, приоритет, теги
    └── VariablesPanel.vue  # VIBE 2.0 биндинги переменных
└── constants/
    ├── stickerThemes.js
    ├── priorityLevels.js
    └── handwritingFonts.js
```

**Текущие панели:**
1. `ContentPanel` — «Содержимое»
2. `AppearancePanel` — «**Оформление**» ✅ (уже есть, хорошее оформление)
3. `MetadataPanel` — «Метаданные»
4. `VariablesPanel` — «Переменные»

**Чего не хватает:**
- ❌ Панели «**Я дизайнер**» (CSS-редактор для элементов стикера)
- ❌ Vuex store-интеграции (нет ни одной подписки на стор в компоненте или панелях)
- ⚠️ AppearancePanel работает через `$set(this.props, key, value) + propChanged()`,
  что правильно, но нет CSS custom props экспорта

---

### 2.3 ElemText

**Файловая структура:**
```
src/ElemText/
├── ElemText.vue            # Основной компонент (TiptapEditor, cssStyleSync)
├── descriptor.js           # aiMeta + presets + examples + varBindings
├── styles/
│   ├── css-vars.js
│   └── style.pcss
├── utils/
│   └── cssStyleSync.js     # Sync между пропами и CSS-стилями
└── panels/
    ├── index.js            # [ContentPanel, AppearancePanel, TypographyPanel,
    │                       #  EffectsPanel, DesignerPanel, VariablesPanel]
    ├── ContentPanel.vue    # HTML, design system, пресеты
    ├── AppearancePanel.vue # «Внешний вид» (opacity, radius, fill, stroke — Figma-style)
    ├── TypographyPanel.vue # Шрифты, выравнивание, перенос
    ├── EffectsPanel.vue    # Тени, blur
    ├── DesignerPanel.vue   # «Я дизайнер» — цвета, отступы, бордеры
    └── VariablesPanel.vue  # VIBE 2.0
└── components/
    ├── TiptapEditor.vue
    └── extensions/
└── panels/components/
    ├── AccordionSection.vue
    ├── CustomSelect.vue
    ├── FillRow.vue
    ├── GradientPicker.vue
    └── StrokeRow.vue
```

**Текущие панели:**
1. `ContentPanel` — «Содержимое»
2. `AppearancePanel` — «Внешний вид» (Figma-style: opacity, radius, fill, stroke)
3. `TypographyPanel` — «Типографика»
4. `EffectsPanel` — «Эффекты»
5. `DesignerPanel` — «**Я дизайнер**» ✅ (есть! цвета, отступы, бордеры через accordion)
6. `VariablesPanel` — «Переменные»

**Чего не хватает:**
- ⚠️ `DesignerPanel` называется «Я дизайнер» только в `meta.name`, но НЕ имеет meta `icon: 'palette'`
  в одном формате со StylesPanel ElemButton
- ❌ Панели «**Оформление**» как отдельной — AppearancePanel называется «Внешний вид»
- ❌ Vuex store-интеграции в компоненте и панелях

---

## 3. Целевая архитектура после рефакторинга

### 3.1 Единый стандарт панелей для всех трёх виджетов

```
[Основные настройки]  → панель специфичная для виджета (Действия / Содержимое / Содержимое)
[Оформление]          → НОВАЯ унифицированная панель оформления (meta: 'Оформление', icon: 'palette-outline')
[Я дизайнер]          → CSS-редактор по образцу ElemRoutesNavigator DesignerPanel
[Переменные/Доп.]     → существующие панели (VariablesPanel, OptionsPanel и пр.)
```

### 3.2 Vuex Store Integration — стандартный паттерн

Каждый виджет должен получить возможность **читать данные из Vuex-стора** и **реагировать на мутации**.
Паттерн взять из `ElemRoutesNavigator` (ExpertPanel + основной компонент).

---

## 4. Спецификация добавляемых компонентов

### 4.1 Панель «Оформление» — универсальный шаблон

**Назначение:** Визуальная настройка внешнего вида виджета через конкретные пропы (НЕ raw CSS).
Это «безопасный» дизайнер — работает с именованными пропами.

**Meta:**
```javascript
meta: { name: 'Оформление', icon: 'palette-outline' }
```

**Структура для каждого виджета:**

#### 4.1.1 AppearancePanel (Оформление) для ElemButton

Файл: `src/ElemButton/panels/OformleniePanel.vue`

Переименовать существующий `AppearancePanel.vue` → `OformleniePanel.vue` и сменить meta-name:

```vue
<!-- panels/OformleniePanel.vue -->
<template>
  <w-panel>
    <ui-container>
      <!-- Live Preview (перенести из текущего AppearancePanel) -->
      <div class="btn-preview-wrap">
        <div class="btn-preview" :style="fullPreviewStyle">
          <!-- ... preview content ... -->
        </div>
      </div>

      <!-- Цветовая схема -->
      <div class="section-label">Цвет фона</div>
      <ui-input-cp prop="btnBg" />
      <ui-input-cp prop="btnColor">Цвет текста</ui-input-cp>

      <!-- Градиент -->
      <ui-input-cp prop="btnGradientTo">Второй цвет (градиент)</ui-input-cp>
      <ui-select prop="btnGradientAngle" :options="gradientAngles" />

      <!-- Форма -->
      <div class="section-label">Форма кнопки</div>
      <ui-input prop="btnBorderRadius">Скругление</ui-input>
      <ui-input prop="btnPaddingV">Отступ по вертикали</ui-input>
      <ui-input prop="btnPaddingH">Отступ по горизонтали</ui-input>

      <!-- Бордер -->
      <ui-switch prop="btnBorderWidth">Обводка</ui-switch>
      <ui-input-cp prop="btnBorderColor" />

      <!-- Тень -->
      <ui-input prop="btnShadow">Тень</ui-input>

      <!-- Эффект при наведении -->
      <div class="section-label">Эффект наведения</div>
      <div class="hover-effects-grid">
        <button v-for="e in hoverEffects" :key="e.value"
          :class="['effect-chip', { active: props.btnHoverEffect === e.value }]"
          @click="setHoverEffect(e.value)">{{ e.label }}</button>
      </div>

      <!-- Стеклянный эффект -->
      <ui-switch prop="btnIsGlass">Стеклянный эффект</ui-switch>
    </ui-container>
  </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

export default {
  extends: Panel,
  meta: { name: 'Оформление', icon: 'palette-outline' },
  data: () => ({
    hoverEffects: [
      { value: 'default',  label: 'По умолчанию' },
      { value: 'lift',     label: 'Подъём' },
      { value: 'glow',     label: 'Свечение' },
      { value: 'scale',    label: 'Масштаб' },
      { value: 'pulse',    label: 'Пульс' },
      { value: 'none',     label: 'Нет' }
    ],
    gradientAngles: [
      { value: '90deg',   label: '→ Горизонт.' },
      { value: '135deg',  label: '↘ Диагональ' },
      { value: '180deg',  label: '↓ Вертикаль' },
      { value: '45deg',   label: '↗ Диагональ' }
    ]
  }),
  computed: {
    fullPreviewStyle() {
      const p = this.props;
      return {
        background: p.btnGradientTo
          ? `linear-gradient(${p.btnGradientAngle || '135deg'}, ${p.btnBg}, ${p.btnGradientTo})`
          : p.btnBg,
        color: p.btnColor,
        borderRadius: p.btnBorderRadius,
        padding: `${p.btnPaddingV} ${p.btnPaddingH}`,
        fontSize: p.btnFontSize,
        fontWeight: p.btnFontWeight,
        boxShadow: p.btnShadow,
        border: `${p.btnBorderWidth || 0} solid ${p.btnBorderColor || 'transparent'}`
      };
    }
  },
  methods: {
    setHoverEffect(value) {
      this.props.btnHoverEffect = value;
      this.propChanged('btnHoverEffect');
    }
  }
};
</script>
```

#### 4.1.2 OformleniePanel для ElemSticker

Текущий `AppearancePanel.vue` уже содержит нужный контент.
**Действие:** только изменить `meta`:

```javascript
// panels/AppearancePanel.vue — ElemSticker
export default {
  extends: Panel,
  meta: { name: 'Оформление', icon: 'palette-outline' },  // ← было: { name: 'Оформление', icon: 'palette' }
  // ...остальное без изменений
};
```

**Дополнительно добавить в AppearancePanel ElemSticker** — секцию «Размер и позиция»:

```vue
<!-- В AppearancePanel.vue ElemSticker — добавить секцию -->
<div class="panel-section">
  <div class="panel-section__header">
    <span class="panel-section__title">Размер и позиция</span>
  </div>
  <div class="panel-row panel-row--inline">
    <span class="panel-label">Мин. ширина</span>
    <ui-input-units :value="props.minWidth" @input="handleMinWidthChange" />
  </div>
  <div class="panel-row panel-row--inline">
    <span class="panel-label">Макс. ширина</span>
    <ui-input-units :value="props.maxWidth" @input="handleMaxWidthChange" />
  </div>
  <div class="panel-row panel-row--inline">
    <span class="panel-label">Соотношение сторон</span>
    <ui-select :value="props.aspectRatio"
      :options="aspectRatioOptions" @input="handleAspectRatioChange" />
  </div>
</div>
```

#### 4.1.3 OformleniePanel для ElemText

Текущий `AppearancePanel.vue` называется «Внешний вид».
**Действие:** изменить meta-name на «Оформление»:

```javascript
// panels/AppearancePanel.vue — ElemText
export default {
  extends: Panel,
  meta: { name: 'Оформление', icon: 'palette-outline' },  // ← было: { name: 'Внешний вид', icon: 'palette' }
  // ...остальное без изменений
};
```

---

### 4.2 Панель «Я дизайнер» — CSS-редактор

**Назначение:** Ручное написание CSS для точечной кастомизации. Опасная зона — для продвинутых пользователей.

**Meta:**
```javascript
meta: { name: 'Я дизайнер', icon: 'palette' }
```

**Требования к реализации** (по образцу `ElemRoutesNavigator/panels/DesignerPanel.vue`):

1. **CSS-пресеты** — набор кнопок-чипов с готовыми стилями
2. **cssElements** — список элементов виджета с их CSS-классами/селекторами
3. **Аккордеон по элементам** — каждый элемент раскрывается
4. **Жёлтый блок** — показывает текущие настройки из «Оформление»-панели
5. **Кнопка «Заполнить текущими»** — переносит вычисленные стили в textarea
6. **Textarea** с debounce 300 ms и сохранением через `propChanged()`
7. **Синий hint-box** — напоминание о синтаксисе CSS
8. **Кнопка сброса** для каждого элемента и «Сбросить всё»

#### 4.2.1 DesignerPanel для ElemButton

> ✅ **УЖЕ ЕСТЬ** — `StylesPanel.vue` с `meta: { name: 'Я дизайнер', icon: 'palette' }`

Только переименовать файл `StylesPanel.vue` → `DesignerPanel.vue` и обновить импорт в `panels/index.js`.

**Текущие cssElements:**
```javascript
cssElements: [
  { key: 'btn',   label: 'Кнопка',              selector: '.elem-btn',       placeholder: '...' },
  { key: 'hover', label: 'Кнопка при наведении', selector: '.elem-btn:hover', placeholder: '...' }
]
```

**Текущие пропы для хранения CSS:**
- `btnCustomCss` — основные стили `.elem-btn`
- `btnHoverCss` — стили при наведении `.elem-btn:hover`

#### 4.2.2 DesignerPanel для ElemSticker

Файл: `src/ElemSticker/panels/DesignerPanel.vue` (создать новый)

**Пропы для хранения CSS** (добавить в `descriptor.js`):
```javascript
stickerCustomCss: {
    type: String, default: '',
    description: 'Custom CSS for .elemsticker-widget-root'
},
stickerContentCss: {
    type: String, default: '',
    description: 'Custom CSS for .elemsticker-content'
},
stickerTapeCss: {
    type: String, default: '',
    description: 'Custom CSS for .elemsticker-tape'
}
```

**cssElements для ElemSticker:**
```javascript
cssElements: [
  {
    key: 'root',
    label: 'Корневой контейнер',
    selector: '.elemsticker-widget-root',
    placeholder: 'border: 2px solid currentColor;\nborder-radius: 16px;',
    propName: 'stickerCustomCss'
  },
  {
    key: 'content',
    label: 'Область контента',
    selector: '.elemsticker-content',
    placeholder: 'padding: 20px;\nfont-size: 16px;',
    propName: 'stickerContentCss'
  },
  {
    key: 'tape',
    label: 'Скотч',
    selector: '.elemsticker-tape',
    placeholder: 'width: 80px;\nopacity: 0.9;',
    propName: 'stickerTapeCss'
  }
]
```

**CSS-пресеты для ElemSticker:**
```javascript
cssPresets: [
  {
    label: 'Неон',
    root: 'border: 2px solid currentColor;\nbox-shadow: 0 0 10px currentColor;',
    content: '', tape: ''
  },
  {
    label: 'Тёмный',
    root: 'background-color: #1e293b !important;\ncolor: #e2e8f0 !important;',
    content: '', tape: 'background: rgba(255,255,255,0.2) !important;'
  },
  {
    label: 'Прозрачный',
    root: 'background: transparent !important;\nborder: 2px dashed rgba(0,0,0,0.2);',
    content: '', tape: ''
  },
  {
    label: 'Сброс',
    root: '', content: '', tape: ''
  }
]
```

**getElementDefaultStyles для ElemSticker:**
```javascript
getElementDefaultStyles(key) {
  const p = this.props;
  if (key === 'root') {
    return [
      `background-color: ${p.stickerColor || '/* из темы */'}; `,
      `color: ${p.textColor || '/* из темы */'};`,
      `padding: ${p.padding || '16px'};`,
      `border-radius: ${p.borderRadius || '2px'};`,
      `opacity: ${p.opacity || 1};`,
      p.boxShadow ? `box-shadow: ${p.boxShadow};` : '',
      p.effectiveRotation ? `transform: rotate(${p.effectiveRotation}deg);` : ''
    ].filter(Boolean).join('\n');
  }
  if (key === 'content') {
    return [
      `font-size: ${p.fontSize || '14px'};`,
      `font-weight: ${p.fontWeight || 400};`,
      `line-height: ${p.lineHeight || 1.5};`,
      `text-align: ${p.textAlign || 'left'};`
    ].join('\n');
  }
  return '';
}
```

**Инъекция CSS в ElemSticker.vue** (добавить в template):
```vue
<!-- В конец .elemsticker-widget-root, после всех остальных элементов -->
<component
  v-if="stickerCustomStyleContent"
  :is="'style'"
  v-html="stickerCustomStyleContent"
/>
```

**Computed в ElemSticker.vue:**
```javascript
stickerCustomStyleContent() {
  const { stickerCustomCss, stickerContentCss, stickerTapeCss } = this.props;
  let css = '';
  if (stickerCustomCss)  css += `.elemsticker-widget-root { ${stickerCustomCss} }\n`;
  if (stickerContentCss) css += `.elemsticker-content { ${stickerContentCss} }\n`;
  if (stickerTapeCss)    css += `.elemsticker-tape { ${stickerTapeCss} }\n`;
  return css || null;
}
```

#### 4.2.3 DesignerPanel для ElemText

> ✅ **УЖЕ ЕСТЬ** — `DesignerPanel.vue` с аккордеонами (цвета, отступы, бордеры).

**Проблема:** текущий DesignerPanel работает через именованные пропы (`color`, `backgroundColor`, `padding*`), а не через raw CSS.
Это хорошо, но не соответствует паттерну «Я дизайнер» как CSS-редактора.

**Вариант А (рекомендуется):** Оставить существующий DesignerPanel, **добавить секцию «Произвольный CSS»** в конец:

```vue
<!-- Добавить в конец panels/DesignerPanel.vue -->
<accordion-section
  title="Произвольный CSS"
  icon="code-braces"
  :collapsed="!expandedSections.customCss"
  :enabled-count="props.textCustomCss ? 1 : 0"
  :total-count="1"
  @toggle="toggleSection('customCss')"
>
  <div class="css-info-box">
    <div class="css-info-box__title">CSS-класс контейнера текста:</div>
    <pre class="css-info-box__pre">.elem-text { ... }</pre>
  </div>
  <textarea
    v-model="localCustomCss"
    class="css-textarea"
    spellcheck="false"
    placeholder="font-variant: small-caps;\nletter-spacing: 0.05em;"
    @input="onCustomCssChange"
  />
  <button class="css-reset-el-btn" @click="resetCustomCss">Сбросить CSS</button>
</accordion-section>
```

**Вариант Б:** Создать отдельный `CssPanel.vue` по полному образцу DesignerPanel ElemRoutesNavigator.

**cssElements для ElemText (Вариант Б):**
```javascript
cssElements: [
  {
    key: 'container',
    label: 'Контейнер текста',
    selector: '.elem-text',
    placeholder: 'text-shadow: 1px 1px 2px rgba(0,0,0,0.1);\nletter-spacing: 0.03em;',
    propName: 'textCustomCss'
  },
  {
    key: 'prose',
    label: 'Область текста (prose)',
    selector: '.elem-text .tiptap-prose',
    placeholder: 'column-count: 2;\ncolumn-gap: 20px;',
    propName: 'textProseCss'
  }
]
```

---

## 5. Vuex Store Integration — паттерн и шаблон кода

### 5.1 Где нужна интеграция

| Виджет | Компонент | Панель | Зачем |
|---|---|---|---|
| ElemButton | `ElemButton.vue` | `OptionsPanel.vue` | Уже есть маршруты, расширить до состояний стора |
| ElemSticker | `ElemSticker.vue` | `ContentPanel.vue` | Читать html/тему из переменных стора |
| ElemText | `ElemText.vue` | `ContentPanel.vue` | Читать html из переменных стора |

### 5.2 Универсальный mixin для Vuex Store Discovery

Создать файл `src/common/mixins/storeDiscoveryMixin.js`:

```javascript
/**
 * storeDiscoveryMixin — Universal Vuex store discovery
 *
 * Provides the same store-finding algorithm used in ElemRoutesNavigator
 * for any widget panel that needs to read/watch Vuex state.
 *
 * Usage:
 *   import { storeDiscoveryMixin } from '../common/mixins/storeDiscoveryMixin';
 *   export default {
 *     mixins: [storeDiscoveryMixin],
 *     mounted() { this.findVuexStore(); }
 *   }
 */

export const storeDiscoveryMixin = {
  data: () => ({
    _discoveredStore: null,
    _storeUnsubscribe: null,
    _storeDebounce: null
  }),

  methods: {
    /**
     * Finds the Vuex store instance using the same fallback chain
     * as ElemRoutesNavigator.
     * @returns {Object|null} Vuex store or null
     */
    findVuexStore() {
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
          if (store?.state) {
            this._discoveredStore = store;
            return store;
          }
        } catch (e) {
          // silent
        }
      }
      return null;
    },

    /**
     * Reads a nested value from store.state by dot-path.
     * e.g. getFromStore('app.data.routes')
     */
    getFromStore(path) {
      if (!this._discoveredStore?.state) return undefined;
      return path.split('.').reduce((obj, key) => obj?.[key], this._discoveredStore.state);
    },

    /**
     * Subscribes to store mutations, calls handler with debounce.
     * @param {string[]} keywords - mutation type keywords to watch (lowercase)
     * @param {Function} handler - callback
     * @param {number} debounce - ms
     */
    subscribeToStore(keywords, handler, debounceMs = 300) {
      if (!this._discoveredStore) return;
      this._storeUnsubscribe?.();
      this._storeUnsubscribe = this._discoveredStore.subscribe((mutation) => {
        const type = mutation.type.toLowerCase();
        if (keywords.some(k => type.includes(k))) {
          clearTimeout(this._storeDebounce);
          this._storeDebounce = setTimeout(handler, debounceMs);
        }
      });
    },

    /**
     * Cleanup — call in beforeDestroy
     */
    destroyStoreSubscription() {
      this._storeUnsubscribe?.();
      clearTimeout(this._storeDebounce);
    }
  },

  beforeDestroy() {
    this.destroyStoreSubscription();
  }
};
```

### 5.3 Применение storeDiscoveryMixin в ElemSticker

В `ElemSticker.vue` добавить поддержку привязки HTML-содержимого к Vuex:

```javascript
// ElemSticker.vue — script section additions
import { storeDiscoveryMixin } from '../common/mixins/storeDiscoveryMixin';

export default {
  mixins: [varBindingsMixin, storeDiscoveryMixin],

  mounted() {
    this.findVuexStore();
    this.loadFromStore();
    this.subscribeToStore(
      ['setsticker', 'sticker', 'sethtml', 'setcontent'],
      this.loadFromStore
    );
  },

  methods: {
    loadFromStore() {
      const { varBindings } = this.props;
      if (!varBindings?.listen?.html?.enabled) return;

      const varName = varBindings.listen.html.varName;
      if (!varName) return;

      // Try Managers.StoreManager first (preferred platform store)
      try {
        const { store } = Managers.StoreManager;
        const val = store.state[varName]?.value;
        if (val != null) {
          this.props.html = val;
          return;
        }
      } catch (e) { /* no platform store */ }

      // Fallback: discovered Vuex store
      const vuexVal = this.getFromStore(varName);
      if (vuexVal != null) this.props.html = vuexVal;
    }
  }
};
```

### 5.4 Применение storeDiscoveryMixin в DesignerPanel (ElemSticker)

```javascript
// ElemSticker/panels/DesignerPanel.vue
import { storeDiscoveryMixin } from '../../common/mixins/storeDiscoveryMixin';

export default {
  extends: Panel,
  mixins: [storeDiscoveryMixin],
  meta: { name: 'Я дизайнер', icon: 'palette' },

  mounted() {
    // Optionally: load store state variable names for hint display
    const store = this.findVuexStore();
    if (store) {
      this.storeStateKeys = Object.keys(store.state).filter(k => {
        const v = store.state[k];
        return v && typeof v === 'object' && 'value' in v;
      });
    }
  },

  data: () => ({
    storeStateKeys: [],
    localStyles: { root: '', content: '', tape: '' },
    cssElOpen: { root: false, content: false, tape: false },
    debounceTimer: null,
    cssElements: [
      {
        key: 'root',
        label: 'Стикер',
        selector: '.elemsticker-widget-root',
        propName: 'stickerCustomCss',
        placeholder: 'border: 2px solid currentColor;'
      },
      {
        key: 'content',
        label: 'Содержимое',
        selector: '.elemsticker-content',
        propName: 'stickerContentCss',
        placeholder: 'font-size: 16px;\nline-height: 1.7;'
      },
      {
        key: 'tape',
        label: 'Скотч/Булавка',
        selector: '.elemsticker-tape',
        propName: 'stickerTapeCss',
        placeholder: 'width: 80px;'
      }
    ]
  }),

  methods: {
    onStyleChange(key) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const el = this.cssElements.find(e => e.key === key);
        if (!el) return;
        this.props[el.propName] = this.localStyles[key];
        this.propChanged(el.propName);
      }, 300);
    },

    fillWithCurrentStyles(key) {
      this.localStyles[key] = this.getElementDefaultStyles(key);
      this.onStyleChange(key);
    },

    resetElement(key) {
      this.localStyles[key] = '';
      const el = this.cssElements.find(e => e.key === key);
      if (!el) return;
      this.props[el.propName] = '';
      this.propChanged(el.propName);
    },

    resetAll() {
      this.cssElements.forEach(el => this.resetElement(el.key));
    },

    getElementDefaultStyles(key) {
      const p = this.props;
      if (key === 'root') {
        const lines = [];
        if (p.stickerColor) lines.push(`background-color: ${p.stickerColor};`);
        if (p.textColor)    lines.push(`color: ${p.textColor};`);
        if (p.padding)      lines.push(`padding: ${p.padding};`);
        if (p.borderRadius) lines.push(`border-radius: ${p.borderRadius};`);
        if (p.opacity != null && p.opacity !== 1) lines.push(`opacity: ${p.opacity};`);
        if (p.boxShadow)    lines.push(`box-shadow: ${p.boxShadow};`);
        return lines.join('\n') || '/* нет кастомных стилей */';
      }
      if (key === 'content') {
        return [
          `font-size: ${p.fontSize || '14px'};`,
          `font-weight: ${p.fontWeight || 400};`,
          `line-height: ${p.lineHeight || 1.5};`,
          `text-align: ${p.textAlign || 'left'};`
        ].join('\n');
      }
      return '';
    }
  }
};
```

---

## 6. Изменения в descriptor.js для каждого виджета

### 6.1 ElemButton — добавить в descriptor.js

Пропы уже существуют (`btnCustomCss`, `btnHoverCss`). **Ничего не добавлять**, только убедиться что StylesPanel → DesignerPanel.

### 6.2 ElemSticker — добавить в descriptor.js

```javascript
// В props секцию descriptor.js ElemSticker, после эффектов:

// ─────────────────────────────────────────────────────────────────
// CUSTOM CSS (DesignerPanel / Я дизайнер)
// ─────────────────────────────────────────────────────────────────
stickerCustomCss: {
    type: String,
    default: '',
    description: 'Custom CSS for the sticker root element (.elemsticker-widget-root)'
},
stickerContentCss: {
    type: String,
    default: '',
    description: 'Custom CSS for the content area (.elemsticker-content)'
},
stickerTapeCss: {
    type: String,
    default: '',
    description: 'Custom CSS for tape/pin decoration elements'
}
```

### 6.3 ElemText — добавить в descriptor.js (если Вариант Б)

```javascript
// В props секцию descriptor.js ElemText:

// ─────────────────────────────────────────────────────────────────
// CUSTOM CSS (CssPanel — raw CSS editor)
// ─────────────────────────────────────────────────────────────────
textCustomCss: {
    type: String,
    default: '',
    description: 'Custom CSS for text container (.elem-text)'
},
textProseCss: {
    type: String,
    default: '',
    description: 'Custom CSS for prose area (.tiptap-prose)'
}
```

---

## 7. Изменения в panels/index.js

### 7.1 ElemButton — panels/index.js

```javascript
// БЫЛО:
export default [
    () => import('./OptionsPanel.vue'),
    () => import('./BufferCopyPanel.vue'),
    () => import('./StylesPanel.vue'),    // «Я дизайнер»
    () => import('./AppearancePanel.vue') // «Внешний вид»
];

// СТАНЕТ (порядок важен — первая вкладка открывается по умолчанию):
export default [
    () => import('./OptionsPanel.vue'),       // «Действия»
    () => import('./OformleniePanel.vue'),    // «Оформление» ← НОВАЯ (переименованный AppearancePanel)
    () => import('./DesignerPanel.vue'),      // «Я дизайнер» ← переименованный StylesPanel
    () => import('./BufferCopyPanel.vue')     // «Копирование»
];
```

### 7.2 ElemSticker — panels/index.js

```javascript
// БЫЛО:
export default [
    ContentPanelAsync,
    AppearancePanelAsync,
    MetadataPanelAsync,
    VariablesPanelAsync
];

// СТАНЕТ:
export default [
    ContentPanelAsync,       // «Содержимое»
    AppearancePanelAsync,    // «Оформление» (meta переименовать)
    DesignerPanelAsync,      // «Я дизайнер» ← НОВАЯ
    MetadataPanelAsync,      // «Метаданные»
    VariablesPanelAsync      // «Переменные»
];

// Добавить:
const DesignerPanelAsync = () => import('./DesignerPanel.vue');
```

### 7.3 ElemText — panels/index.js

```javascript
// БЫЛО:
export default [
    ContentPanelAsync,
    AppearancePanelAsync,    // «Внешний вид»
    TypographyPanelAsync,
    EffectsPanelAsync,
    DesignerPanelAsync,      // «Я дизайнер» (уже есть, оставить)
    VariablesPanelAsync
];

// СТАНЕТ:
export default [
    ContentPanelAsync,
    AppearancePanelAsync,    // «Оформление» ← переименовать meta
    TypographyPanelAsync,
    EffectsPanelAsync,
    DesignerPanelAsync,      // «Я дизайнер» (добавить секцию raw CSS)
    VariablesPanelAsync
];
```

---

## 8. Инъекция CSS в компоненты

Каждый виджет должен применять кастомный CSS, написанный в DesignerPanel.

### 8.1 ElemButton (уже есть)

```vue
<!-- ElemButton.vue — уже реализовано: -->
<component v-if="customCssContent" :is="'style'" v-html="customCssContent" />
```

```javascript
// computed:
customCssContent() {
  const { btnCustomCss, btnHoverCss } = this.props;
  let css = '';
  if (btnCustomCss) css += `.elem-btn { ${btnCustomCss} }`;
  if (btnHoverCss)  css += `.elem-btn:hover { ${btnHoverCss} }`;
  return css || null;
}
```

### 8.2 ElemSticker (добавить)

```vue
<!-- ElemSticker.vue — добавить в конец template перед закрывающим </div> .elemsticker-widget-root -->
<component
  v-if="stickerCustomStyleContent"
  :is="'style'"
  v-html="stickerCustomStyleContent"
/>
```

```javascript
// В computed ElemSticker.vue:
stickerCustomStyleContent() {
  const { stickerCustomCss, stickerContentCss, stickerTapeCss } = this.props;
  let css = '';
  if (stickerCustomCss)  css += `.elemsticker-widget-root { ${stickerCustomCss} }\n`;
  if (stickerContentCss) css += `.elemsticker-content { ${stickerContentCss} }\n`;
  if (stickerTapeCss)    css += `.elemsticker-tape { ${stickerTapeCss} }\n`;
  return css || null;
}
```

### 8.3 ElemText (добавить, если Вариант Б)

```vue
<!-- ElemText.vue — добавить в конец template -->
<component
  v-if="textCustomStyleContent"
  :is="'style'"
  v-html="textCustomStyleContent"
/>
```

```javascript
// В computed ElemText.vue:
textCustomStyleContent() {
  const { textCustomCss, textProseCss } = this.props;
  let css = '';
  if (textCustomCss)  css += `.elem-text { ${textCustomCss} }\n`;
  if (textProseCss)   css += `.elem-text .tiptap-prose { ${textProseCss} }\n`;
  return css || null;
}
```

---

## 9. Полный шаблон DesignerPanel (для Copy-Paste)

Ниже приведён полный шаблон панели «Я дизайнер» по образцу ElemRoutesNavigator,
адаптированный как универсальная заготовка. Подставить `cssElements`, `cssPresets` и `getElementDefaultStyles`.

```vue
<template>
  <w-panel>
    <ui-container>

      <!-- ── CSS пресеты ──────────────────────────────────────────── -->
      <div class="section-label">Пресеты стилей</div>
      <div class="css-presets">
        <button
          v-for="p in cssPresets"
          :key="p.label"
          class="css-preset-chip"
          :title="p.label"
          @click="applyCssPreset(p)">
          {{ p.label }}
        </button>
      </div>

      <!-- ── Per-element CSS editors ─────────────────────────────── -->
      <div v-for="el in cssElements" :key="el.key" class="css-el-wrap">
        <div class="css-el-hd" @click="cssElOpen[el.key] = !cssElOpen[el.key]">
          <span class="css-el-hd__label">{{ el.label }}</span>
          <code class="css-el-hd__sel">{{ el.selector }}</code>
          <i class="mdi" :class="cssElOpen[el.key] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </div>
        <div v-if="cssElOpen[el.key]" class="css-el-body">
          <!-- Жёлтый блок с текущими настройками -->
          <div class="css-info-box">
            <div class="css-info-box__title">Текущие настройки из панели «Оформление»:</div>
            <pre class="css-info-box__pre">{{ getElementDefaultStyles(el.key) }}</pre>
          </div>
          <!-- Заголовок редактора + кнопка заполнения -->
          <div class="css-el-editor-hd">
            <span class="form-label form-label-small">CSS свойства</span>
            <button class="css-fill-btn" type="button" @click="fillWithCurrentStyles(el.key)">
              <i class="mdi mdi-keyboard-outline" /> Заполнить текущими
            </button>
          </div>
          <!-- Textarea -->
          <textarea
            v-model="localStyles[el.key]"
            class="css-textarea"
            spellcheck="false"
            :placeholder="el.placeholder"
            @input="onStyleChange(el.key)" />
          <!-- Синий hint -->
          <div class="css-hint-box">
            <i class="mdi mdi-information-outline" />
            <div>
              <strong>Совет:</strong> Только CSS свойства без селекторов.
              Пример: <code>color: red; font-weight: bold;</code>
            </div>
          </div>
          <!-- Сброс элемента -->
          <button class="css-reset-el-btn" type="button" @click="resetElement(el.key)">
            Сбросить {{ el.label.toLowerCase() }}
          </button>
        </div>
      </div>

      <!-- ── Сброс всего CSS ──────────────────────────────────────── -->
      <ui-button type="ghost" @click="resetAll">Сбросить весь CSS</ui-button>

    </ui-container>
  </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore'; // или '@goodt-wcore/panel'

export default {
  extends: Panel,

  meta: { name: 'Я дизайнер', icon: 'palette' },

  data: () => ({
    // ── Заполнить под конкретный виджет ──────────────────────────
    localStyles: {
      /* key: '' для каждого элемента */
    },
    cssElOpen: {
      /* key: false для каждого элемента */
    },
    debounceTimer: null,
    cssElements: [
      /*
      {
        key: 'root',               // уникальный ключ
        label: 'Корневой элемент', // отображаемое название
        selector: '.my-selector',  // CSS-селектор для документации
        propName: 'myCustomCss',   // имя пропа для хранения CSS
        placeholder: 'color: red;' // пример CSS
      }
      */
    ],
    cssPresets: [
      /*
      {
        label: 'Название пресета',
        key1: 'css string',
        key2: 'css string',
        // ... один ключ на каждый cssElement.key
      }
      */
      { label: 'Сброс' } // всегда добавлять пресет сброса
    ]
    // ─────────────────────────────────────────────────────────────
  }),

  mounted() {
    // Загрузить текущие значения пропов в localStyles
    this.cssElements.forEach(el => {
      this.$set(this.localStyles, el.key, this.props[el.propName] || '');
      this.$set(this.cssElOpen, el.key, false);
    });
  },

  beforeUnmount() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  },

  methods: {
    onStyleChange(key) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const el = this.cssElements.find(e => e.key === key);
        if (!el) return;
        this.props[el.propName] = this.localStyles[key];
        this.propChanged(el.propName);
      }, 300);
    },

    // OVERRIDE THIS: вернуть строку CSS из текущих пропов
    getElementDefaultStyles(/* key */) {
      return '/* Переопределить getElementDefaultStyles() */';
    },

    fillWithCurrentStyles(key) {
      this.localStyles[key] = this.getElementDefaultStyles(key);
      this.onStyleChange(key);
    },

    resetElement(key) {
      this.localStyles[key] = '';
      const el = this.cssElements.find(e => e.key === key);
      if (!el) return;
      this.props[el.propName] = '';
      this.propChanged(el.propName);
    },

    applyCssPreset(preset) {
      this.cssElements.forEach(el => {
        const val = preset[el.key] ?? '';
        this.localStyles[el.key] = val;
        this.props[el.propName] = val;
        this.propChanged(el.propName);
      });
    },

    resetAll() {
      this.cssElements.forEach(el => this.resetElement(el.key));
    }
  }
};
</script>

<style scoped>
/* ── Section label ──────────────────────────────────────────────── */
.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: #94a3b8;
  margin-top: 4px; margin-bottom: 6px;
}

/* ── CSS preset chips ────────────────────────────────────────────── */
.css-presets { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.css-preset-chip {
  padding: 4px 11px; border-radius: 20px; border: 1.5px solid #e2e8f0;
  background: #fff; color: #475569; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: border-color 0.12s, background 0.12s, color 0.12s; white-space: nowrap;
}
.css-preset-chip:hover { border-color: #a5b4fc; color: #4f6aff; background: #f5f7ff; }

/* ── Per-element editor ──────────────────────────────────────────── */
.css-el-wrap { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 8px; }
.css-el-hd {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  background: #f8fafc; cursor: pointer; user-select: none; transition: background 0.12s;
}
.css-el-hd:hover { background: #f1f5ff; }
.css-el-hd__label { flex: 1; font-size: 13px; font-weight: 600; color: #1e293b; }
.css-el-hd__sel {
  font-family: monospace; font-size: 11px; color: #64748b;
  background: #e2e8f0; padding: 2px 7px; border-radius: 4px; flex-shrink: 0;
}
.css-el-hd .mdi { font-size: 18px; color: #94a3b8; flex-shrink: 0; }
.css-el-body {
  padding: 12px; display: flex; flex-direction: column; gap: 10px;
  background: #fff; border-top: 1px solid #e2e8f0;
}

/* ── Yellow info box ─────────────────────────────────────────────── */
.css-info-box { padding: 10px 12px; background: #fef9ec; border-radius: 8px; border: 1px solid #fde68a; }
.css-info-box__title { font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 6px; }
.css-info-box__pre { font-family: monospace; font-size: 11px; color: #78350f; white-space: pre-wrap; line-height: 1.5; margin: 0; }

/* ── Editor header ───────────────────────────────────────────────── */
.css-el-editor-hd { display: flex; align-items: center; justify-content: space-between; }
.css-fill-btn {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px;
  background: #3b82f6; color: #fff; border: none; border-radius: 6px;
  font-size: 11px; font-family: inherit; cursor: pointer; transition: background 0.12s; font-weight: 500;
}
.css-fill-btn:hover { background: #2563eb; }
.css-fill-btn .mdi { font-size: 13px; }

/* ── CSS textarea ────────────────────────────────────────────────── */
.css-textarea {
  width: 100%; height: 80px; font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px; line-height: 1.55; padding: 9px 11px; background: #f8fafc;
  color: #1e293b; border: 1.5px solid #e2e8f0; border-radius: 8px;
  resize: vertical; min-height: 52px; box-sizing: border-box; outline: none; transition: border-color 0.15s;
}
.css-textarea:focus { border-color: #4f6aff; background: #fff; }

/* ── Blue hint box ───────────────────────────────────────────────── */
.css-hint-box {
  display: flex; align-items: flex-start; gap: 8px; padding: 9px 11px;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
  font-size: 12px; color: #1e40af; line-height: 1.5;
}
.css-hint-box .mdi { font-size: 15px; color: #3b82f6; flex-shrink: 0; margin-top: 2px; }
.css-hint-box code { padding: 1px 5px; background: #dbeafe; border-radius: 3px; font-family: monospace; font-size: 11px; }

/* ── Reset element button ────────────────────────────────────────── */
.css-reset-el-btn {
  align-self: flex-start; padding: 5px 13px; border: 1.5px solid #e2e8f0;
  border-radius: 6px; background: #fff; color: #64748b; font-size: 11px;
  font-family: inherit; cursor: pointer; transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.css-reset-el-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
</style>
```

---

## 10. Чеклист рефакторинга

### ElemButton

- [ ] Переименовать `StylesPanel.vue` → `DesignerPanel.vue`
- [ ] Переименовать `AppearancePanel.vue` → `OformleniePanel.vue`
- [ ] В `OformleniePanel.vue` изменить meta: `{ name: 'Оформление', icon: 'palette-outline' }`
- [ ] Обновить `panels/index.js` (новый порядок: OptionsPanel → OformleniePanel → DesignerPanel → BufferCopyPanel)
- [ ] Опционально: добавить `storeDiscoveryMixin` в DesignerPanel для отображения доступных переменных стора

### ElemSticker

- [ ] Добавить в `descriptor.js` пропы: `stickerCustomCss`, `stickerContentCss`, `stickerTapeCss`
- [ ] В `AppearancePanel.vue` изменить meta: `{ name: 'Оформление', icon: 'palette-outline' }`
- [ ] Создать `panels/DesignerPanel.vue` по шаблону из секции 9
  - cssElements: root, content, tape
  - cssPresets: Неон, Тёмный, Прозрачный, Сброс
  - getElementDefaultStyles: читает p.stickerColor, p.textColor, p.padding и т.д.
- [ ] Добавить в `ElemSticker.vue` computed `stickerCustomStyleContent`
- [ ] Добавить `<component :is="'style'" v-if="stickerCustomStyleContent" v-html="stickerCustomStyleContent" />` в template
- [ ] Добавить `storeDiscoveryMixin` в `ElemSticker.vue`
- [ ] Обновить `panels/index.js` (добавить DesignerPanelAsync)

### ElemText

- [ ] В `AppearancePanel.vue` изменить meta: `{ name: 'Оформление', icon: 'palette-outline' }`
- [ ] В `DesignerPanel.vue` убедиться что meta: `{ name: 'Я дизайнер', icon: 'palette' }` (icon уже должен быть)
- [ ] Добавить секцию «Произвольный CSS» в конец `DesignerPanel.vue` (Вариант А)
  - ИЛИ создать отдельный `CssPanel.vue` по шаблону из секции 9 (Вариант Б)
- [ ] Добавить в `descriptor.js` пропы `textCustomCss`, `textProseCss` (если Вариант Б)
- [ ] Добавить computed `textCustomStyleContent` и `<style>` тег в `ElemText.vue` (если Вариант Б)
- [ ] Добавить `storeDiscoveryMixin` в `ElemText.vue` для реактивного чтения html из стора

---

## 11. Дополнительные рекомендации

### Единый порядок панелей

Для консистентности рекомендуется следующий порядок:
```
1. [Контент/Действия]   — специфичный для виджета
2. [Оформление]         — визуальные пропы (icon: palette-outline)
3. [Я дизайнер]         — raw CSS редактор (icon: palette)
4. [Дополнительные]     — переменные, метаданные, буфер и т.п.
```

### CSS-классы виджетов (для документирования в DesignerPanel)

| Виджет | Корневой класс | Доп. классы |
|---|---|---|
| ElemButton | `.elem-btn` | `.elem-btn:hover`, `.elem-btn--toggle-active` |
| ElemSticker | `.elemsticker-widget-root` | `.elemsticker-content`, `.elemsticker-tape`, `.elemsticker-pin` |
| ElemText | `.elem-text` | `.tiptap-prose`, `.tiptap-toolbar` |

### Vuex store paths (для storeDiscoveryMixin)

```javascript
// Пути для поиска данных в Vuex (взяты из ElemRoutesNavigator):
const STORE_DATA_PATHS = [
  'app.app.data',
  'app.data',
  'app',
  'editor.data',
  'editor',
  ''  // root state
];
```

### Формат customCss-пропов

Всегда хранить как **строку CSS-свойств без селекторов**:
```css
/* ✅ Правильно — только свойства */
color: red;
font-weight: bold;

/* ❌ Неправильно — не включать селектор */
.elem-btn { color: red; }
```

Виджет сам оборачивает в нужный селектор при инъекции через `<style>`.

---

*Документ создан 2026-03-02. Версия 1.0.*
*Эталонная реализация: `ElemRoutesNavigator/panels/DesignerPanel.vue` и `ExpertPanel.vue`.*
