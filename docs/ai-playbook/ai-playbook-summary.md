# AI Playbook Summary

## 1. Core Principles

- Widget = descriptor.js + Elem<Name>.vue + panels/ + utils/ + styles/
- Platform auto-discovers widgets via `meta` export from `descriptor.js`
- Microfrontend: ALL CSS must be scoped — un-scoped styles break other widgets
- Imports from goodt packages: root-level only (Webpack Module Federation requirement)
- Register descriptor vars BEFORE `$storeCommit`; commit BEFORE `$storeWatchHandler`
- Every prop mutation in a panel MUST call `propChanged('propName')`
- `<w-elem>` root for widgets; `<w-panel>` root for panels — both mandatory
- All dimension/size props stored as `{size, unit}` objects; convert with `unit2PxMixin`
- Run `convertCssVarToComputedValue(opts, computedStyle)` before passing opts to chart libs

---

## 2. Widget Architecture

```
src/ElemMyWidget/
├── descriptor.js          # Props + meta registration
├── ElemMyWidget.vue       # Main Vue component (extends Elem)
├── panels/
│   ├── index.js           # Async re-exports
│   ├── DatasetPanelMixin.js
│   ├── config.js          # Static dropdown options, format constants
│   ├── DimensionsPanel.vue
│   ├── MetricsPanel.vue
│   └── OptionsPanel.vue
├── utils/
│   ├── constants.js       # Default factories, series templates
│   └── index.js           # Formatters, aggregation, uid()
├── styles/
│   ├── css-vars.js        # Theme variable mapping
│   └── style.pcss         # Scoped component styles
└── components/            # Optional sub-components
```

**Naming:**

| Item | Rule |
|------|------|
| Widget | `Elem<Feature>` PascalCase |
| Directory | Must match widget name exactly |
| Vue files | PascalCase |
| JS modules | camelCase |
| Panels | `<Name>Panel.vue` in `panels/` |
| CSS namespace | `.elem{widgetname}-widget-root` (lowercase) |
| Boolean data | `is*`, `has*`, `can*`, `should*` prefix |
| Array constants | End with `s` |
| Exported constants | PascalCase |

---

## 3. Hard Rules

### Imports
- Root only: `@goodt-wcore/elem`, `@goodt-wcore/panel`, `@goodt-wcore/panel-ui`, `@goodt-wcore/components`, `@goodt-wcore/managers`, `@goodt-common/data`, `@goodt-common/utils`, `@goodt-common/api`
- FORBIDDEN: `@goodt-wcore/src/...`, `@goodt-wcore/components/panel-ui`, `@goodt-common/utils/web-api`

### Naming
- `Elem` prefix, PascalCase widget name
- Panel files end with `Panel`, live in `panels/`
- Boolean data props: `is*`, `has*`, `can*`, `should*`

### Styling
- Always `<style module>` OR namespace wrapper `.elem{name}-widget-root`
- No un-scoped global styles
- No Tailwind — use scoped PostCSS
- Dimension props: `{size, unit}` object (never plain `Number`)
- Use `unit2PxMixin.takeUnit2Px()` for pixel conversion

### Vue
- `<w-elem>` root for widget components (mandatory)
- `<w-panel>` root for panel components (mandatory)
- Call `propChanged('name')` after every prop mutation
- No inline `style="..."` attributes — use computed properties
- No template literal expressions in templates — use computed
- Use `== null` for null/undefined checks (not `!`)
- Use `=== false` for boolean-false checks (not `!flag`)
- Destructure nested props — no long chains

### Dataset / Store / Variables
- Register descriptor vars BEFORE `$storeCommit`
- `$storeCommit` BEFORE `$storeWatchHandler`
- Use dimension names as keys (not column IDs)
- Clear with `null`, not `undefined`
- Filter values: always arrays — `[value]`, never bare `value`
- Call `updateDescriptorVars()` in `mounted()`
- `$storeCommit` = runtime cross-widget value sync
- `$storeMeta.setVar()` = panel variable binding config

### Panels
- `cloneDeep()` nested defaults before mutating
- Never access `props.varAliases` directly — use `$storeMeta`
- All dropdown constants in `panels/config.js`
- Use `static: {}` for non-reactive panel constants
- Initialize CSS panel local state in `mounted()`, NOT in `watch` (causes reactive loop)
- Debounce CSS style handlers (300ms) to prevent field-clearing while typing

### Forbidden
- Sub-path imports from goodt packages
- Un-scoped CSS
- Inline `style=""` attributes
- Magic numbers without `// eslint-disable-line no-magic-numbers`
- `!` on non-boolean values
- Unused data/computed/methods
- Long property chains
- SVG `<text>` for user-facing text
- Shared default objects (use factory `() => ({})`)
- `setTimeout` for animations (use `requestAnimationFrame`)
- Animation without `cancelAnimationFrame` cleanup in `beforeDestroy`
- Direct `props.varAliases` access in panels

---

## 4. Common Patterns

### Descriptor
```js
import { StoreOperation } from '@goodt-wcore/elem';
import { useDatasetMeta } from '@goodt-common/data';
import panels, { DatasetPanelMixin } from './panels';
import cssVars from './styles/css-vars';

export const descriptor = () => ({
    props: {
        dremio: { type: Array, default: () => [] },
        valueFontSize: { type: Object, default: () => ({ size: 40, unit: 'px' }) }, // eslint-disable-line no-magic-numbers
    },
    vars: {},
    dataset: { vars: { dimension: { operation: StoreOperation.ALL } } }
});

export const meta = useDatasetMeta(
    { descriptor, isChildAllowed: false, slotNames: [], cssVars, panels },
    { panel: { isMultiple: false, mixins: [DatasetPanelMixin] } }
);
```

### Vue Component
```js
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetBaseMixin, ElemDatasetBaseMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
const DatasetMixin = useElemDatasetBaseMixin({ drilldown: false });
export default {
    extends: Elem, mixins: [DatasetMixin], meta,
    hooks: { then(results) { this.results = results; /* redraw */ } },
    data() { return { isLoading: false, error: null, results: [], ...ElemDatasetBaseMixinTypes }; },
    async loadData(requests = this.requests) {
        this.$requestCancel(requests); this.isLoading = true;
        try {
            const res = await Promise.all(requests.map(r => r?.send()));
            this.results = res; this.$options.hooks.then.call(this, res);
        } catch (e) { this.$handleError(e); } finally { this.isLoading = false; }
    },
    mounted() { this.updateDescriptorVars(); }
};
```

### Dataset / Store / Variables (5-step filter)
```js
handleFilterChange(dimensionName, value) {
    // 1. Register variable
    this.dimensionMetricVars = registerDescriptorVariable(this.descriptor, dimensionName, this.dimensionMetricVars);
    // 2. Update local state
    value == null ? this.$delete(this.columnFilters, dimensionName) : this.$set(this.columnFilters, dimensionName, { value });
    // 3. Build filter params
    const filterParams = value != null
        ? { [dimensionName]: { __t: -1, name: dimensionName, operator: QueryFilterOperator.EQ, value: [value] } }
        : { [dimensionName]: null };
    // 4. Commit to storage
    this.$storeCommit(filterParams);
    // 5. Apply to query
    this.$storeWatchHandler(filterParams);
    // 6. Persist to props
    this.$set(this.props, 'columnFilters', { ...this.columnFilters });
    this.propChanged('columnFilters');
}
```

### Panels
```js
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import { MY_OPTIONS } from './config';
export default {
    extends: Panel, mixins: [usePanelDatasetMixin()],
    meta: { name: 'Настройки', icon: 'settings' },
    static: { options: { myOptions: MY_OPTIONS } },
    methods: {
        handleChange(val) { this.props.someProp = val; this.propChanged('someProp'); }
    }
};
```

### Tooltip / Slots
- Descriptor: `isChildAllowed: true`, `slotNames: ['tooltip']`
- Template: `<w-elem :placeholder="$placeholder">`
- Custom tooltip data: `{ options: { appendToBody, data, coordinates, isFixed }, isShown }`
- Bind: `<w-tooltip :is-shown.sync="customTooltip.isShown" v-bind="customTooltip.options">`

### Styling
```js
// styles/css-vars.js
export const cssVars = ({ palette, typography }) => ({
    chartTitleColor: typography.heading.color,
});
// Before chart render:
chartInstance.setOption(convertCssVarToComputedValue(opts, getComputedStyle(this.$el)));
// Dimension computed style:
const px = this.takeUnit2Px({ value: fontSizeObj.size, unit: fontSizeObj.unit });
```

---

## 5. Anti-Patterns

| Bad | Fix |
|-----|-----|
| `default: { show: false }` (shared object) | `default: () => ({ show: false })` |
| Missing `propChanged()` after prop mutation | Always call `propChanged('name')` |
| `props.axis` without merging template | `props.axis.map(i => _merge(AxisTemplate(), i))` |
| `drilldownPop()` without `storeCommitNulls()` | Call `storeCommitNulls()` on pop |
| `chart.setOption(opts)` with CSS vars | `chart.setOption(convertCssVarToComputedValue(opts, style))` |
| Unchecked `results[0].rows[0]` | Guard: `if (!results?.length) return;` |
| `watch: { 'props.customStyles': ... }` in CSS panel | Init in `mounted()` only |
| Animation without cleanup | `cancelAnimationFrame(id)` in `beforeDestroy` |
| `!this.props.flag` on non-boolean | `this.props.flag === false` |
| Bare magic number | Add `// eslint-disable-line no-magic-numbers` |
| `this.props.varAliases = ...` in panel | Use `this.$storeMeta.setVar(...)` |
| Native `<select>` ignores click in editor | Add `@mousedown.stop @click.stop` |

---

## 6. Minimal Templates

### descriptor.js
```js
import { StoreOperation } from '@goodt-wcore/elem';
import { useDatasetMeta } from '@goodt-common/data';
import panels, { DatasetPanelMixin } from './panels';
import cssVars from './styles/css-vars';

export const descriptor = () => ({ props: {}, vars: {}, dataset: { vars: { dimension: { operation: StoreOperation.ALL } } } });
export const meta = useDatasetMeta({ descriptor, isChildAllowed: false, slotNames: [], cssVars, panels }, { panel: { isMultiple: false, mixins: [DatasetPanelMixin] } });
```

### Elem\<Name\>.vue
```vue
<template>
  <w-elem :placeholder="$placeholder">
    <div v-if="isLoading" class="curtain"><div class="curtain__preloader"></div></div>
    <div v-if="!props.dremio" class="message message--warn">no dataset selected</div>
  </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetBaseMixin, ElemDatasetBaseMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
const DatasetMixin = useElemDatasetBaseMixin({ drilldown: false });
export default {
  extends: Elem, mixins: [DatasetMixin], meta,
  hooks: { then(results) { this.results = results; } },
  data() { return { isLoading: false, results: [], ...ElemDatasetBaseMixinTypes }; },
  mounted() { this.updateDescriptorVars(); }
};
</script>
<style lang="pcss" module>
.container { position: relative; width: 100%; height: 100%; }
</style>
```

### \<Name\>Panel.vue
```vue
<template>
  <w-panel>
    <ui-container>
      <ui-select prop="myProp" :options="options.myOptions" label="Setting"></ui-select>
    </ui-container>
  </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';
import { MY_OPTIONS } from './config';
export default {
  extends: Panel, mixins: [usePanelDatasetMixin()],
  meta: { name: 'Настройки', icon: 'settings' },
  static: { options: { myOptions: MY_OPTIONS } }
};
</script>
```

---

## 7. Session Usage

- Load this file + `ai-playbook-summary.json` at session start as hard context
- JSON = machine-readable hard rules; MD = conceptual reference
- When JSON and MD conflict, JSON wins
- Before finalizing any widget code: validate against `hard_rules` in JSON
- For deep detail: reference source files in `docs/ai-playbook/` by section number
- Reference widgets: `src/ElemMultiSpline/` (chart), `src/ElemWowTable/` (table)
