# Анализ базовых виджетов Insight-X

> Дата анализа: Февраль 2025
> Цель: Оптимизация библиотеки виджетов и расширение функциональности на базе Framer/Tilda

---

## Содержание

1. [Текущее состояние](#текущее-состояние)
2. [Выявленные проблемы](#выявленные-проблемы)
3. [Рекомендации по оптимизации](#рекомендации-по-оптимизации)
4. [Новые виджеты](#новые-виджеты)
5. [Архитектурные улучшения](#архитектурные-улучшения)
6. [Roadmap внедрения](#roadmap-внедрения)

---

## Текущее состояние

### Инвентаризация базовых виджетов

Проанализировано **14 базовых виджетов** из `/example/Виджеты/basic/src/lib/`:

| Категория | Виджет | Назначение | Слоты | Дети |
|-----------|--------|------------|-------|------|
| **Текст** | ElemText | Rich HTML с WYSIWYG редактором | — | — |
| **Текст** | ElemSticker | Sticky-note с HTML контентом | 1 | — |
| **Медиа** | ElemImage | Отображение изображений | — | — |
| **Навигация** | ElemButton | Кнопка с actions (навигация, events, filters) | 1 | ✓ |
| **Навигация** | ElemLink | Ссылка с router-link интеграцией | 1 | ✓ |
| **Навигация** | ElemDropdown | Dropdown/popover меню | 2 | ✓ |
| **Лейаут** | ElemContainer | Wrapper с collapsible header | 2 | ✓* |
| **Лейаут** | ElemRow | Bootstrap grid row | 1 | только ElemCol |
| **Лейаут** | ElemCol | Bootstrap grid column (12-колоночная сетка) | 1 | ✓* |
| **Лейаут** | ElemGrid | CSS Grid с auto-responsive колонками | 1 | ✓ |
| **Лейаут** | ElemGridLayout | CSS Grid с named areas + export | dynamic | ✓ |
| **Лейаут** | ElemGridLayoutLegacy | Упрощённый CSS Grid (устаревший) | dynamic | ✓ |
| **Лейаут** | ElemLayersContainer | Слои с z-index управлением | dynamic | ✓ |
| **Лейаут** | ElemTile | Card/tile контейнер | 1 | ✓* |

*Ограничения на типы дочерних элементов

---

### Детальный анализ виджетов

#### ElemText
**Путь:** `ElemText/ElemText.vue`

```javascript
props: {
    html: { type: String, default: 'Текст...' },
    isPlainHTMLShown: { type: Boolean }
}
```

**Возможности:**
- WYSIWYG редактор (paragraph style, color, font size, bold, italic, align, lists, links)
- Интерполяция переменных: `{{ storeName }}` → значение из store
- Переключение между WYSIWYG и raw HTML

---

#### ElemSticker
**Путь:** `ElemSticker/ElemSticker.vue`

```javascript
props: {
    html: { type: String },
    background: { type: String, default: 'rgba(252, 235, 176, 1)' }
}
```

**Возможности:**
- WYSIWYG редактор (аналогично ElemText)
- Интерполяция переменных
- Стилизация sticky-note (тень, фон, padding)

**⚠️ Дублирование:** 90% функциональности совпадает с ElemText

---

#### ElemImage
**Путь:** `ElemImage/ElemImage.vue`

```javascript
props: {
    url: { type: String },
    responsive: { type: Boolean, default: true }
}
```

**Возможности:**
- Responsive sizing
- Placeholder в режиме редактирования
- Простой `<img>` рендеринг

**⚠️ Ограничения:** Нет object-fit, lazy loading, fallback image

---

#### ElemButton
**Путь:** `ElemButton/ElemButton.vue`

```javascript
props: {
    url: String,                    // URL навигации
    eventName: Array | String,      // Кастомные события
    filters: Array,                 // Store filters [{name, data}]
    cutParams: Array,               // Params для очистки
    urlFilters: Array,              // Query params для URL
    isClickSelf: Boolean,           // Клик только на самой кнопке
    isTargetBlank: Boolean,         // Открытие в новом окне
    isCopyStore: Boolean,           // Копировать store в буфер
    shouldCopyText: Boolean,        // Копировать текст
    routeQueryParamNames: Array     // Route query params
}
```

**Возможности:**
- Цепочка действий: filters → events → navigation → copy
- Smart URL routing (relative, absolute, hash)
- Сериализация store state
- Popup уведомления

---

#### ElemLink
**Путь:** `ElemLink/ElemLink.vue`

```javascript
props: {
    href: String,
    target: { type: String, default: '_self' },
    eventName: String,
    filters: Array,
    cutStateParams: Array,
    enableLink: { type: Boolean, default: true },
    cssClass: { type: Array, default: ['d-inline-block'] }
}
```

**Возможности:**
- Vue Router `<router-link>` интеграция
- Active/exact-active состояния
- Store filters на клик
- Внешние ссылки с валидацией протокола

**⚠️ Пересечение:** Общая логика с ElemButton (filters, events)

---

#### ElemDropdown
**Путь:** `ElemDropdown/ElemDropdown.vue`

```javascript
props: {
    display: { type: String, default: 'd-inline-block' },
    'dropdown-behaviour': { type: String, default: 'mousemove' },
    'dropdown-pos': { type: String, default: 'bottom' }
}
```

**Возможности:**
- Click или hover триггер
- Позиционирование (bottom, top, left, right)
- ResizeObserver для динамических обновлений
- Таймауты показа/скрытия

---

#### ElemContainer
**Путь:** `ElemContainer/ElemContainer.vue`

```javascript
props: {
    collapsible: { type: Boolean, default: false }
}
```

**Слоты:** `default`, `header`

**Возможности:**
- Опциональный collapsible header
- Chevron иконка toggle

---

#### ElemRow / ElemCol
**Путь:** `ElemRow/ElemRow.vue`, `ElemCol/ElemCol.vue`

```javascript
// ElemRow
props: {
    uncollapse: { type: Boolean, default: false }
}

// ElemCol
props: {
    size: String,           // 2-12/12, auto
    padding: { type: Boolean, default: true },
    valign: String          // stretch, top, mid, bot
}
```

**Возможности:**
- Bootstrap 12-колоночная сетка
- Responsive collapse
- Vertical alignment

**⚠️ Устаревший подход:** CSS Grid предпочтительнее

---

#### ElemGrid
**Путь:** `ElemGrid/ElemGrid.vue`

```javascript
props: {
    gap: { type: String, default: '10px' },
    minColWidth: { type: String, default: '150px' },
    fillMode: { type: String, default: 'fill' },  // fill | fit
    height: { type: String, default: '100' },
    heightUnit: { type: String, default: '%' }
}
```

**Возможности:**
- Auto-responsive: `repeat(auto-fill/fit, minmax(...))`
- Динамический gap

---

#### ElemGridLayout
**Путь:** `ElemGridLayout/ElemGridLayout.vue`

```javascript
props: {
    grid: {
        areas: [[String]],      // 2D массив named areas
        places: Object,         // justify/align per area
        rows: [String],         // row sizes
        cols: [String],         // col sizes
        gap: { row, col }       // gaps
    },
    screenshotMode: Object,     // export настройки
    height: String,
    heightUnit: String
}
```

**Возможности:**
- Named CSS Grid areas
- Per-area positioning (justify/align)
- Screenshot export: PNG, JPEG, WEBP
- PDF export через event system
- Динамические слоты по именам areas

---

#### ElemGridLayoutLegacy
**Путь:** `ElemGridLayoutLegacy/ElemGridLayoutLegacy.vue`

**⚠️ Deprecated:** Упрощённая версия ElemGridLayout без export функций

---

#### ElemLayersContainer
**Путь:** `ElemLayersContainer/ElemLayersContainer.vue`

```javascript
props: {
    layers: [{
        name: String,
        isVisible: Boolean,
        width: String,
        height: String,
        position: String
    }],
    position: { type: String, default: 'pos-rel' },
    height: String,
    heightUnit: String
}
```

**Возможности:**
- Visibility-controlled layers
- Z-index management
- Динамические слоты per layer

---

#### ElemTile
**Путь:** `ElemTile/ElemTile.vue`

```javascript
props: {
    padding: { type: Boolean, default: true },
    size: String,
    height: { type: String, default: '100' },
    heightUnit: { type: String, default: '%' }
}
```

**Возможности:**
- Card styling
- Size variants
- Height configuration

**⚠️ Пересечение:** Похож на ElemContainer по назначению

---

## Выявленные проблемы

### 1. Дублирование функциональности

| Группа | Виджеты | Проблема |
|--------|---------|----------|
| Текстовый контент | ElemText, ElemSticker | 90% общего кода (WYSIWYG, интерполяция) |
| Навигация | ElemButton, ElemLink | Общая логика filters/events |
| Контейнеры | ElemContainer, ElemTile | Похожее назначение |
| CSS Grid | ElemGridLayout, ElemGridLayoutLegacy | Legacy версия избыточна |

### 2. Устаревшие подходы

- **ElemRow/ElemCol:** Bootstrap grid устарел, CSS Grid предпочтительнее
- **ElemGrid:** Функциональность покрывается ElemGridLayout

### 3. Отсутствующая функциональность

Сравнение с Framer/Tilda выявило критические пробелы:

| Категория | Отсутствует |
|-----------|-------------|
| Landing blocks | Hero section, Features, Pricing, Testimonials |
| UI компоненты | Accordion, Tabs, Modal, Tooltip |
| Анимации | Marquee, Parallax, Animated text |
| Утилиты | Divider, Spacer, Countdown |
| Бизнес | Team cards, Contact block, Cookie banner |

---

## Рекомендации по оптимизации

### Объединение виджетов

#### 1. ElemText + ElemSticker → ElemRichText

```javascript
// Новый унифицированный виджет
props: {
    html: String,
    variant: {
        type: String,
        default: 'plain',
        enum: ['plain', 'sticker', 'card', 'quote']
    },
    background: String,     // для variant !== 'plain'
    borderRadius: String,
    shadow: Boolean
}
```

#### 2. ElemContainer + ElemTile → ElemBox

```javascript
props: {
    variant: {
        type: String,
        default: 'container',
        enum: ['container', 'tile', 'card', 'glass']
    },
    collapsible: Boolean,
    padding: Boolean | String,
    shadow: String          // none, sm, md, lg
}
```

### Deprecation план

| Виджет | Действие | Миграция |
|--------|----------|----------|
| ElemGridLayoutLegacy | Удалить | → ElemGridLayout |
| ElemSticker | Объединить | → ElemRichText (variant: 'sticker') |
| ElemRow/ElemCol | Soft deprecate | → ElemGridLayout |
| ElemGrid | Soft deprecate | → ElemGridLayout |

### Унификация логики

Создать общий mixin для ElemButton и ElemLink:

```javascript
// mixins/useNavigationActions.js
export const useNavigationActions = {
    props: {
        filters: Array,
        eventName: [String, Array],
        cutParams: Array
    },
    methods: {
        applyFilters() { /* ... */ },
        triggerEvents() { /* ... */ },
        clearParams() { /* ... */ }
    }
}
```

---

## Новые виджеты

### Приоритет 1: Must-Have (Landing Essentials)

#### ElemHero
Hero-секция для первого экрана лендинга.

```javascript
props: {
    layout: {
        type: String,
        default: 'center',
        enum: ['center', 'left', 'right', 'split']
    },
    background: {
        type: Object,
        default: () => ({
            type: 'color',      // color | image | video | gradient
            value: '#ffffff',
            overlay: null,      // rgba overlay
            position: 'center'
        })
    },
    height: {
        type: String,
        default: '100vh',
        enum: ['100vh', '80vh', '60vh', 'auto']
    },
    verticalAlign: {
        type: String,
        default: 'center'
    }
}
```

**Слоты:** `default` (content), `background` (custom bg), `actions` (CTA buttons)

**Референсы:** [Framer Hero](https://segmentui.com/uikit/hero), Tilda Cover blocks

---

#### ElemAccordion
Раскрывающийся список для FAQ, features.

```javascript
props: {
    items: {
        type: Array,
        default: () => [{
            title: String,
            content: String,    // HTML
            isOpen: Boolean,
            icon: String
        }]
    },
    allowMultiple: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'default',
        enum: ['default', 'bordered', 'separated', 'minimal']
    },
    iconPosition: {
        type: String,
        default: 'right',
        enum: ['left', 'right', 'none']
    }
}
```

**SEO:** Контент рендерится в DOM (crawlable), только визуально скрыт.

**Референсы:** [Framer Accordion](https://www.framer.com/marketplace/components/tags/accordion/)

---

#### ElemTabs
Вкладки для переключения контента.

```javascript
props: {
    tabs: {
        type: Array,
        default: () => [{
            id: String,
            label: String,
            icon: String,
            disabled: Boolean
        }]
    },
    activeTab: String,
    variant: {
        type: String,
        default: 'default',
        enum: ['default', 'pills', 'underline', 'bordered']
    },
    orientation: {
        type: String,
        default: 'horizontal',
        enum: ['horizontal', 'vertical']
    }
}
```

**Слоты:** Динамические по `tab.id`

---

#### ElemMarquee
Бегущая строка для логотипов, текста.

```javascript
props: {
    direction: {
        type: String,
        default: 'left',
        enum: ['left', 'right', 'up', 'down']
    },
    speed: {
        type: Number,
        default: 50          // px/s
    },
    pauseOnHover: {
        type: Boolean,
        default: true
    },
    gap: {
        type: String,
        default: '40px'
    }
}
```

**Слот:** `default` (контент для прокрутки, автоматически дублируется)

**Референсы:** [Marquee Addons](https://wordpress.org/plugins/marquee-addons-for-elementor/)

---

#### ElemDivider
Разделитель секций.

```javascript
props: {
    variant: {
        type: String,
        default: 'line',
        enum: ['line', 'dashed', 'dotted', 'gradient', 'wave', 'zigzag']
    },
    color: String,
    thickness: {
        type: String,
        default: '1px'
    },
    width: {
        type: String,
        default: '100%'
    },
    margin: {
        type: String,
        default: '20px 0'
    },
    icon: String            // центральная иконка
}
```

---

#### ElemSpacer
Управляемый вертикальный отступ.

```javascript
props: {
    height: {
        type: String,
        default: '40px'
    },
    responsive: {
        type: Object,
        default: () => ({
            mobile: '20px',
            tablet: '30px',
            desktop: '40px'
        })
    }
}
```

---

### Приоритет 2: High Impact (Conversion)

#### ElemTestimonials
Блок отзывов.

```javascript
props: {
    items: {
        type: Array,
        default: () => [{
            quote: String,
            author: String,
            role: String,
            company: String,
            avatar: String,
            rating: Number,     // 1-5
            logo: String
        }]
    },
    layout: {
        type: String,
        default: 'carousel',
        enum: ['carousel', 'grid', 'masonry', 'single']
    },
    showRating: Boolean,
    showLogo: Boolean,
    autoplay: Boolean,
    interval: Number
}
```

**Референсы:** [Framer Testimonials](https://segmentui.com/uikit/testimonials)

---

#### ElemPricingCard
Карточка тарифного плана.

```javascript
props: {
    name: String,
    price: {
        type: Object,
        default: () => ({
            amount: Number,
            currency: String,
            period: String      // month, year, one-time
        })
    },
    description: String,
    features: [{
        text: String,
        included: Boolean,
        tooltip: String
    }],
    cta: {
        text: String,
        url: String,
        variant: String
    },
    badge: String,          // "Popular", "Best Value"
    highlighted: Boolean
}
```

---

#### ElemFeatureCard
Карточка преимущества.

```javascript
props: {
    icon: String,           // иконка или эмодзи
    title: String,
    description: String,
    link: {
        text: String,
        url: String
    },
    variant: {
        type: String,
        default: 'default',
        enum: ['default', 'bordered', 'filled', 'minimal']
    },
    iconPosition: {
        type: String,
        default: 'top',
        enum: ['top', 'left', 'inline']
    }
}
```

---

#### ElemCountdown
Таймер обратного отсчёта.

```javascript
props: {
    targetDate: String,     // ISO date
    format: {
        type: Array,
        default: () => ['days', 'hours', 'minutes', 'seconds']
    },
    labels: {
        type: Object,
        default: () => ({
            days: 'дней',
            hours: 'часов',
            minutes: 'минут',
            seconds: 'секунд'
        })
    },
    onComplete: {
        type: String,       // event name
        default: 'countdown-complete'
    },
    variant: {
        type: String,
        default: 'default',
        enum: ['default', 'flip', 'minimal', 'circular']
    }
}
```

---

#### ElemStats
Числовые показатели с анимацией.

```javascript
props: {
    items: {
        type: Array,
        default: () => [{
            value: Number,
            suffix: String,     // "+", "%", "K"
            prefix: String,     // "$", ">"
            label: String,
            icon: String
        }]
    },
    animate: {
        type: Boolean,
        default: true
    },
    duration: {
        type: Number,
        default: 2000       // ms
    },
    triggerOnScroll: {
        type: Boolean,
        default: true
    }
}
```

---

#### ElemBadge
Бейдж/тег.

```javascript
props: {
    text: String,
    variant: {
        type: String,
        default: 'default',
        enum: ['default', 'success', 'warning', 'error', 'info', 'custom']
    },
    size: {
        type: String,
        default: 'md',
        enum: ['sm', 'md', 'lg']
    },
    icon: String,
    pulse: Boolean          // анимация пульсации
}
```

---

### Приоритет 3: Modern UI (Trends 2025-2026)

#### ElemBentoGrid
Bento-лейаут — асимметричная сетка.

```javascript
props: {
    items: {
        type: Array,
        default: () => [{
            id: String,
            colSpan: Number,    // 1-4
            rowSpan: Number,    // 1-4
            content: String     // slot name
        }]
    },
    columns: {
        type: Number,
        default: 4
    },
    gap: String,
    minItemHeight: String
}
```

**Референсы:** [Bento Grid Trend 2025](https://senorit.de/en/blog/bento-grid-design-trend-2025)

---

#### ElemGlassCard
Glassmorphism карточка.

```javascript
props: {
    blur: {
        type: String,
        default: '10px'
    },
    opacity: {
        type: Number,
        default: 0.7
    },
    borderRadius: String,
    border: String,         // "1px solid rgba(255,255,255,0.2)"
    shadow: Boolean
}
```

---

#### ElemParallax
Параллакс-эффект.

```javascript
props: {
    speed: {
        type: Number,
        default: 0.5        // 0-1, множитель скорости
    },
    direction: {
        type: String,
        default: 'vertical',
        enum: ['vertical', 'horizontal']
    },
    overflow: {
        type: Boolean,
        default: false
    }
}
```

---

#### ElemStickySection
Прилипающая секция.

```javascript
props: {
    offset: {
        type: String,
        default: '0px'
    },
    zIndex: {
        type: Number,
        default: 100
    },
    behavior: {
        type: String,
        default: 'sticky',
        enum: ['sticky', 'fixed-on-scroll']
    }
}
```

---

#### ElemAnimatedText
Текст с анимациями.

```javascript
props: {
    text: String,
    animation: {
        type: String,
        default: 'none',
        enum: ['none', 'typewriter', 'fade-in', 'slide-up', 'split-chars', 'highlight']
    },
    delay: Number,
    duration: Number,
    triggerOnScroll: Boolean,
    loop: Boolean           // для typewriter
}
```

**Референсы:** [Aceternity UI](https://ui.aceternity.com/components)

---

#### ElemGradientBg
Анимированный градиентный фон.

```javascript
props: {
    colors: {
        type: Array,
        default: () => ['#ff6b6b', '#4ecdc4', '#45b7d1']
    },
    angle: {
        type: Number,
        default: 45
    },
    animate: {
        type: Boolean,
        default: true
    },
    speed: {
        type: Number,
        default: 10         // секунд на цикл
    },
    blur: String            // mesh gradient blur
}
```

---

### Приоритет 4: Business Features

#### ElemTeamMember
Карточка сотрудника.

```javascript
props: {
    photo: String,
    name: String,
    role: String,
    bio: String,
    social: [{
        type: String,       // linkedin, twitter, email
        url: String
    }],
    variant: {
        type: String,
        default: 'card',
        enum: ['card', 'minimal', 'horizontal']
    }
}
```

---

#### ElemContactCard
Контактный блок.

```javascript
props: {
    address: String,
    phone: String,
    email: String,
    workingHours: String,
    map: {
        lat: Number,
        lng: Number,
        zoom: Number
    },
    social: Array,
    variant: String
}
```

---

#### ElemSocialLinks
Иконки соцсетей.

```javascript
props: {
    links: [{
        type: String,       // vk, telegram, youtube, linkedin, etc.
        url: String
    }],
    size: String,
    variant: {
        type: String,
        default: 'default',
        enum: ['default', 'filled', 'outline', 'monochrome']
    },
    direction: {
        type: String,
        default: 'horizontal'
    }
}
```

---

#### ElemCookieBanner
GDPR cookie-уведомление.

```javascript
props: {
    message: String,
    acceptText: String,
    declineText: String,
    policyUrl: String,
    position: {
        type: String,
        default: 'bottom',
        enum: ['bottom', 'top', 'bottom-left', 'bottom-right']
    },
    storageKey: String
}
```

---

#### ElemFloatingCTA
Плавающая кнопка.

```javascript
props: {
    position: {
        type: String,
        default: 'bottom-right',
        enum: ['bottom-right', 'bottom-left', 'bottom-center']
    },
    icon: String,
    text: String,
    url: String,
    showAfterScroll: Number,    // px
    pulse: Boolean
}
```

---

#### ElemModal
Модальное окно.

```javascript
props: {
    isOpen: Boolean,
    title: String,
    size: {
        type: String,
        default: 'md',
        enum: ['sm', 'md', 'lg', 'xl', 'full']
    },
    closeOnOverlay: {
        type: Boolean,
        default: true
    },
    closeOnEsc: {
        type: Boolean,
        default: true
    },
    showClose: Boolean
}
```

**Слоты:** `default`, `header`, `footer`

---

#### ElemTooltip
Всплывающая подсказка.

```javascript
props: {
    content: String,
    position: {
        type: String,
        default: 'top',
        enum: ['top', 'bottom', 'left', 'right']
    },
    trigger: {
        type: String,
        default: 'hover',
        enum: ['hover', 'click', 'focus']
    },
    delay: Number,
    maxWidth: String
}
```

---

## Архитектурные улучшения

### 1. Система вариантов

Унифицированный подход к стилизации:

```javascript
// Общие варианты для всех виджетов
const STYLE_VARIANTS = {
    appearance: ['default', 'outline', 'ghost', 'glass'],
    size: ['xs', 'sm', 'md', 'lg', 'xl'],
    radius: ['none', 'sm', 'md', 'lg', 'full']
}
```

### 2. Анимации как пропсы

```javascript
// mixins/useAnimation.js
props: {
    animation: {
        entrance: {
            type: String,
            enum: ['none', 'fade', 'slide-up', 'slide-down', 'scale', 'blur']
        },
        entranceDelay: Number,
        entranceDuration: Number,
        scroll: {
            type: String,
            enum: ['none', 'parallax', 'reveal', 'sticky']
        },
        hover: {
            type: String,
            enum: ['none', 'lift', 'glow', 'scale', 'tilt']
        }
    }
}
```

### 3. Responsive система

```javascript
// mixins/useResponsive.js
props: {
    responsive: {
        mobile: Object,     // props overrides for mobile
        tablet: Object,     // props overrides for tablet
        desktop: Object     // base props
    },
    hideOn: {
        type: Array,        // ['mobile', 'tablet']
        default: () => []
    }
}
```

### 4. CSS Variables система

```css
/* Глобальные CSS переменные для консистентности */
:root {
    /* Spacing */
    --insight-space-xs: 4px;
    --insight-space-sm: 8px;
    --insight-space-md: 16px;
    --insight-space-lg: 24px;
    --insight-space-xl: 32px;

    /* Radius */
    --insight-radius-sm: 4px;
    --insight-radius-md: 8px;
    --insight-radius-lg: 16px;
    --insight-radius-full: 9999px;

    /* Shadows */
    --insight-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --insight-shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --insight-shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

    /* Transitions */
    --insight-transition-fast: 150ms ease;
    --insight-transition-normal: 300ms ease;
    --insight-transition-slow: 500ms ease;
}
```

---

## Roadmap внедрения

### Фаза 1: Foundation (2-3 недели)

**Оптимизация существующих:**
- [ ] Объединить ElemText + ElemSticker → ElemRichText
- [ ] Deprecate ElemGridLayoutLegacy
- [ ] Создать mixin useNavigationActions

**Новые утилиты:**
- [ ] ElemDivider
- [ ] ElemSpacer
- [ ] ElemBadge

### Фаза 2: Landing Essentials (3-4 недели)

**Must-have для лендингов:**
- [ ] ElemHero
- [ ] ElemAccordion
- [ ] ElemTabs
- [ ] ElemMarquee

### Фаза 3: Conversion Boosters (3-4 недели)

**High-impact виджеты:**
- [ ] ElemTestimonials
- [ ] ElemPricingCard
- [ ] ElemFeatureCard
- [ ] ElemCountdown
- [ ] ElemStats

### Фаза 4: Modern UI (4-5 недель)

**Тренды 2025-2026:**
- [ ] ElemBentoGrid
- [ ] ElemGlassCard
- [ ] ElemParallax
- [ ] ElemAnimatedText
- [ ] ElemGradientBg

### Фаза 5: Business Features (3-4 недели)

**Бизнес-функционал:**
- [ ] ElemModal
- [ ] ElemTooltip
- [ ] ElemTeamMember
- [ ] ElemContactCard
- [ ] ElemSocialLinks
- [ ] ElemCookieBanner
- [ ] ElemFloatingCTA

---

## Источники

- [SegmentUI - Framer Components](https://segmentui.com/remix)
- [Framestack Component Library](https://framestack.co/)
- [Framer Marketplace](https://www.framer.com/marketplace/components/)
- [Tilda Features](https://tilda.cc/en/features/)
- [Tilda Education](https://tilda.education/en/tilda-website-builder)
- [Bento Grid Trend 2025](https://senorit.de/en/blog/bento-grid-design-trend-2025)
- [Aceternity UI Components](https://ui.aceternity.com/components)
- [Smashing Magazine - Tilda Review](https://www.smashingmagazine.com/2018/09/tilda-website-builder-full-review/)
