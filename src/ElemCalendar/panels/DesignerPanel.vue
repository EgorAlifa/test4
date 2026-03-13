<template>
    <w-panel>
        <ui-container>

            <div class="p-section__label">Я дизайнер — CSS для каждого элемента</div>

            <!-- Справка по переменным -->
            <div class="vars-box">
                <div class="vars-box__title">Доступные CSS-переменные</div>
                <div class="vars-grid">
                    <code v-for="v in cssVarsList" :key="v">{{ v }}</code>
                </div>
            </div>

            <!-- Блоки элементов -->
            <div class="blocks-list">
                <div
                    v-for="block in blocks"
                    :key="block.key"
                    class="block">
                    <div
                        class="block__hd"
                        @click="toggle(block.key)">
                        <div class="block__hd-left">
                            <i class="mdi mdi-circle-small block__dot" :class="hasValue(block.key) ? 'block__dot--active' : ''" />
                            <span class="block__label">{{ block.label }}</span>
                        </div>
                        <div class="block__hd-right">
                            <code class="block__sel">{{ block.sel }}</code>
                            <i class="mdi block__chevron" :class="isOpen(block.key) ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                        </div>
                    </div>
                    <div v-if="isOpen(block.key)" class="block__body">
                        <textarea
                            class="block__textarea"
                            :value="getVal(block.key)"
                            :placeholder="block.hint || 'color: red;\nfont-size: 14px;'"
                            spellcheck="false"
                            @input="setVal(block.key, $event.target.value)" />
                        <div v-if="hasValue(block.key)" class="block__actions">
                            <button class="block__reset" @click="setVal(block.key, '')">Сбросить</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Свободный CSS на весь виджет -->
            <div class="block block--global">
                <div class="block__hd" @click="globalOpen = !globalOpen">
                    <div class="block__hd-left">
                        <i class="mdi mdi-circle-small block__dot" :class="props.calCustomCss ? 'block__dot--active' : ''" />
                        <span class="block__label">Весь виджет (свободный CSS)</span>
                    </div>
                    <div class="block__hd-right">
                        <code class="block__sel">.elem-cal</code>
                        <i class="mdi block__chevron" :class="globalOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                    </div>
                </div>
                <div v-if="globalOpen" class="block__body">
                    <textarea
                        class="block__textarea"
                        :value="localGlobalCss"
                        placeholder="border: 2px solid #4f6aff;&#10;font-family: 'Roboto', sans-serif;"
                        spellcheck="false"
                        @input="onGlobalCss($event.target.value)" />
                    <div v-if="props.calCustomCss" class="block__actions">
                        <button class="block__reset" @click="onGlobalCss('')">Сбросить</button>
                    </div>
                </div>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

const BLOCKS = [
    {
        key: 'header',
        label: 'Шапка',
        sel: '.elem-cal__header',
        hint: 'padding: 12px 20px;\nborder-bottom: 2px solid #4f6aff;'
    },
    {
        key: 'title',
        label: 'Заголовок периода',
        sel: '.elem-cal__title',
        hint: 'font-size: 1.3em;\nletter-spacing: 0.05em;'
    },
    {
        key: 'navBtn',
        label: 'Кнопки навигации',
        sel: '.elem-cal__nav-btn',
        hint: 'border-radius: 50%;\nbackground: rgba(255,255,255,0.25);'
    },
    {
        key: 'viewBtn',
        label: 'Переключатель вида',
        sel: '.elem-cal__view-btn',
        hint: 'border-radius: 20px;\nfont-weight: 700;'
    },
    {
        key: 'weekday',
        label: 'Подписи дней недели',
        sel: '.elem-cal__weekday',
        hint: 'color: #4f6aff;\nfont-size: 0.8em;'
    },
    {
        key: 'cell',
        label: 'Ячейка дня',
        sel: '.elem-cal__cell',
        hint: 'border-radius: 0;\nborder: 1px solid #e0e7ff;'
    },
    {
        key: 'dayNum',
        label: 'Число дня',
        sel: '.elem-cal__day-num',
        hint: 'border-radius: 4px;\nfont-weight: 700;'
    },
    {
        key: 'todayCell',
        label: 'Сегодня',
        sel: '.elem-cal__cell--today',
        hint: 'outline: 2px solid var(--cal-accent);\noutline-offset: -2px;'
    },
    {
        key: 'selectedCell',
        label: 'Выбранный день',
        sel: '.elem-cal__cell--selected',
        hint: 'background: var(--cal-selected-bg) !important;'
    },
    {
        key: 'event',
        label: 'Событие (месяц)',
        sel: '.elem-cal__event',
        hint: 'border-radius: 6px;\npadding: 2px 6px;'
    },
    {
        key: 'weekEvent',
        label: 'Событие (неделя/день)',
        sel: '.elem-cal__week-event',
        hint: 'border-radius: 6px;\nbox-shadow: 0 2px 6px rgba(0,0,0,0.15);'
    },
    {
        key: 'agendaEvent',
        label: 'Событие (список)',
        sel: '.elem-cal__agenda-event',
        hint: 'border-radius: 10px;\nbox-shadow: 0 1px 4px rgba(0,0,0,0.08);'
    }
];

export default {
    extends: Panel,
    meta: { name: 'Я дизайнер', icon: 'code-tags' },

    data: () => ({
        blocks: BLOCKS,
        openKeys: [],
        globalOpen: false,
        localGlobalCss: '',
        debounce: null,
        cssData: {}
    }),

    computed: {
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
            if (idx >= 0) this.openKeys.splice(idx, 1);
            else this.openKeys.push(key);
        },

        getVal(key) { return this.cssData[key] || ''; },
        hasValue(key) { return Boolean(this.cssData[key]); },

        setVal(key, val) {
            if (val) this.$set(this.cssData, key, val);
            else this.$delete(this.cssData, key);
            this._saveDesigner();
        },

        _saveDesigner() {
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => {
                this.props.calDesignerCss = JSON.stringify(this.cssData);
                this.propChanged('calDesignerCss');
            }, 300);
        },

        onGlobalCss(val) {
            this.localGlobalCss = val;
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => {
                this.props.calCustomCss = val;
                this.propChanged('calCustomCss');
            }, 300);
        }
    }
};
</script>

<style scoped>
.p-section__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
}

/* ── CSS vars reference ───────────────────────────────────────── */
.vars-box {
    background: #fef9ec;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 12px;
}
.vars-box__title {
    font-size: 10px;
    font-weight: 700;
    color: #92400e;
    margin-bottom: 7px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.vars-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}
.vars-grid code {
    font-family: monospace;
    font-size: 10px;
    background: #fef3c7;
    color: #78350f;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #fde68a;
}

/* ── Blocks list ─────────────────────────────────────────────── */
.blocks-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 4px;
}

.block {
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.12s;
}
.block:has(.block__dot--active) {
    border-color: #a5b4fc;
}
.block--global { margin-top: 8px; }

.block__hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
    transition: background 0.12s;
}
.block__hd:hover { background: #f1f5ff; }

.block__hd-left {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
}
.block__dot {
    font-size: 18px;
    color: #e2e8f0;
    flex-shrink: 0;
    line-height: 1;
}
.block__dot--active { color: #4f6aff; }

.block__label {
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.block__hd-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}
.block__sel {
    font-family: monospace;
    font-size: 10px;
    color: #334155;
    background: #e2e8f0;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
}
.block__chevron { font-size: 16px; color: #94a3b8; }

.block__body {
    padding: 10px;
    background: #fff;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.block__textarea {
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
.block__textarea:focus { border-color: #4f6aff; background: #fff; }

.block__actions { display: flex; }
.block__reset {
    padding: 4px 12px;
    border: 1.5px solid #fca5a5;
    border-radius: 6px;
    background: #fff;
    color: #dc2626;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.12s;
}
.block__reset:hover { background: #fef2f2; }
</style>
