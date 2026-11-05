<template>
    <w-panel>
        <ui-container>

            <div class="dp-title">Я дизайнер — CSS для каждого элемента</div>

            <!-- Справка по переменным -->
            <div class="dp-vars">
                <div class="dp-vars__title">Доступные CSS-переменные</div>
                <div class="dp-vars__grid">
                    <code v-for="v in cssVarsList" :key="v">{{ v }}</code>
                </div>
            </div>

            <!-- Элементы для текущего режима (полный ИЛИ компактный) -->
            <div class="dp-list">
                <template v-for="block in activeBlocks">
                <!-- заголовок раздела — перед первым блоком группы -->
                <div v-if="block.groupStart" :key="`g-${block.key}`" class="dp-group">{{ block.group }}</div>
                <div
                    :key="block.key"
                    class="dp-block">
                    <div
                        class="dp-block__hd"
                        @click="toggle(block.key)">
                        <i class="mdi mdi-circle-small dp-block__dot" :class="hasValue(block.key) ? 'dp-block__dot--active' : ''" />
                        <span class="dp-block__label">{{ block.label }}</span>
                        <i class="mdi dp-block__chevron" :class="isOpen(block.key) ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                    </div>
                    <div v-if="isOpen(block.key)" class="dp-block__body">
                        <code class="dp-block__sel">{{ block.sel }}</code>
                        <textarea
                            class="dp-block__textarea"
                            :value="getVal(block.key)"
                            :placeholder="block.hint || 'color: red;\nfont-size: 14px;'"
                            spellcheck="false"
                            @input="setVal(block.key, $event.target.value)" />
                        <div v-if="hasValue(block.key)" class="dp-block__actions">
                            <button class="dp-block__reset" @click="setVal(block.key, '')">Сбросить</button>
                        </div>
                    </div>
                </div>
                </template>
            </div>

            <!-- Свободный CSS на весь виджет -->
            <div class="dp-block dp-block--global">
                <div class="dp-block__hd" @click="globalOpen = !globalOpen">
                    <i class="mdi mdi-circle-small dp-block__dot" :class="props.calCustomCss ? 'dp-block__dot--active' : ''" />
                    <span class="dp-block__label">Весь виджет (свободный CSS)</span>
                    <i class="mdi dp-block__chevron" :class="globalOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="globalOpen" class="dp-block__body">
                    <code class="dp-block__sel">.elem-cal</code>
                    <textarea
                        class="dp-block__textarea"
                        :value="localGlobalCss"
                        placeholder="border: 2px solid #4f6aff;&#10;font-family: 'Roboto', sans-serif;"
                        spellcheck="false"
                        @input="onGlobalCss($event.target.value)" />
                    <div v-if="props.calCustomCss" class="dp-block__actions">
                        <button class="dp-block__reset" @click="onGlobalCss('')">Сбросить</button>
                    </div>
                </div>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';
import { DESIGNER_BLOCKS } from '../constants';

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'palette' },

    data: () => ({
        // таблица общая с виджетом: селекторы здесь и в генерируемом CSS всегда совпадают
        blocks: DESIGNER_BLOCKS.full,
        compactBlocks: DESIGNER_BLOCKS.compact,
        openKeys: [],
        globalOpen: false,
        localGlobalCss: '',
        debounceDesigner: null,
        debounceGlobalCss: null,
        cssData: {}
    }),

    computed: {
        activeBlocks() {
            const list = this.props.calMode === 'compact' ? this.compactBlocks : this.blocks;
            // блоки, которых нет на экране в текущей конфигурации (when(props) в DESIGNER_BLOCKS), скрыты;
            // их уже заданный CSS виджет применяет как раньше
            const visible = list.filter((b) => !b.when || b.when(this.props));
            // groupStart — первый блок своей группы (перед ним выводится заголовок раздела)
            return visible.map((b, i) => ({
                ...b,
                // подпись может зависеть от режима (например, «Начало диапазона» / «Выбранный день»)
                label: typeof b.label === 'function' ? b.label(this.props) : b.label,
                groupStart: Boolean(b.group) && (i === 0 || visible[i - 1].group !== b.group)
            }));
        },

        cssVarsList() {
            return [
                '--cal-bg', '--cal-header-bg', '--cal-header-color',
                '--cal-accent', '--cal-today-bg', '--cal-today-color',
                '--cal-selected-bg', '--cal-selected-color', '--cal-range-bg',
                '--cal-cell-bg', '--cal-cell-hover-bg', '--cal-cell-border',
                '--cal-weekend-color', '--cal-radius', '--cal-event-radius',
                '--cal-shadow', '--cal-font-size', '--cal-font-weight'
            ];
        }
    },

    mounted() {
        this.localGlobalCss = this.props.calCustomCss || '';
        try {
            this.cssData = JSON.parse(this.props.calDesignerCss || '{}');
        } catch (e) {
            this.cssData = {};
        }
    },

    methods: {
        isOpen(key) { return this.openKeys.includes(key); },
        toggle(key) {
            const idx = this.openKeys.indexOf(key);
            if (idx >= 0) this.openKeys = this.openKeys.filter((_, i) => i !== idx);
            else this.openKeys = [...this.openKeys, key];
        },

        getVal(key) { return this.cssData[key] || ''; },
        hasValue(key) { return Boolean(this.cssData[key]); },

        setVal(key, val) {
            if (val) this.$set(this.cssData, key, val);
            else this.$delete(this.cssData, key);
            this._saveDesigner();
        },

        _saveDesigner() {
            clearTimeout(this.debounceDesigner);
            this.debounceDesigner = setTimeout(() => {
                this.props.calDesignerCss = JSON.stringify(this.cssData);
                this.propChanged('calDesignerCss');
            }, 300);
        },

        onGlobalCss(val) {
            this.localGlobalCss = val;
            clearTimeout(this.debounceGlobalCss);
            this.debounceGlobalCss = setTimeout(() => {
                this.props.calCustomCss = val;
                this.propChanged('calCustomCss');
            }, 300);
        }
    }
};
</script>

<style scoped>
.dp-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
}

/* ── CSS vars reference ───────────────────────────────────────── */
.dp-vars {
    background: #fef9ec;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 12px;
}
.dp-vars__title {
    font-size: 10px;
    font-weight: 700;
    color: #92400e;
    margin-bottom: 7px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.dp-vars__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}
.dp-vars__grid code {
    font-family: monospace;
    font-size: 10px;
    background: #fef3c7;
    color: #78350f;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #fde68a;
}

/* ── Blocks list ─────────────────────────────────────────────── */
/* Все классы с префиксом dp-: глобальный CSS платформы (goodt-framework-styles) задаёт
   .block { margin-bottom: var(--spacer-layout3) } — из-за этого между строками были
   разрывы ~30px. Общие имена (.block, .title, .row…) в панелях использовать нельзя. */
.dp-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 4px;
}

.dp-group {
    margin: 8px 0 0;
    padding: 0 2px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #64748b;
}
.dp-group:first-child { margin-top: 0; }

.dp-block {
    margin: 0;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.12s;
}
.dp-block:has(.dp-block__dot--active) {
    border-color: #a5b4fc;
}
.dp-block--global { margin-top: 8px; }

.dp-block__hd {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    box-sizing: border-box;
    padding: 6px 10px;
    line-height: 18px;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
    transition: background 0.12s;
}
.dp-block__hd:hover { background: #f1f5ff; }

.dp-block__dot {
    font-size: 18px;
    color: #e2e8f0;
    flex-shrink: 0;
    line-height: 1;
}
.dp-block__dot--active { color: #4f6aff; }

.dp-block__label {
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    flex: 1;
    min-width: 0;
}

.dp-block__sel {
    display: block;
    font-family: monospace;
    font-size: 10px;
    color: #4f6aff;
    background: #eef2ff;
    padding: 2px 7px;
    border-radius: 4px;
    margin-bottom: 6px;
    width: fit-content;
}
.dp-block__chevron { font-size: 16px; line-height: 1; color: #94a3b8; flex-shrink: 0; }
/* у mdi ::before по умолчанию 24px/1 — иначе иконка раздувает строку */
.dp-block__dot::before,
.dp-block__chevron::before { font-size: inherit; line-height: 1; }

.dp-block__body {
    padding: 10px;
    background: #fff;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.dp-block__textarea {
    width: 100%;
    min-height: 72px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 11px;
    line-height: 1.6;
    padding: 8px 10px;
    background: #f8fafc;
    color: #1e293b;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    resize: vertical;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}
.dp-block__textarea:focus { border-color: #4f6aff; background: #fff; }

.dp-block__actions { display: flex; }
.dp-block__reset {
    padding: 4px 12px;
    border: 1.5px solid #fca5a5;
    border-radius: 6px;
    background: #fff;
    color: #dc2626;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.12s;
}
.dp-block__reset:hover { background: #fef2f2; }
</style>
