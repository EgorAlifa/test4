<template>
    <div>
        <!-- ── Active state ──────────────────────────────────────── -->
        <div class="sp-section">
            <div class="sp-label">Активное состояние</div>
            <div class="sp-hint">
                Выберите состояние, затем перетащите виджеты в контейнер — они попадут в нужный слот.
            </div>
            <div class="state-cards">
                <div
                    v-for="state in props.states"
                    :key="state.name"
                    class="state-card"
                    :class="{ 'state-card--active': props.activeState === state.name }"
                    @click="setActiveState(state)">
                    <div class="state-card__name">{{ state.name }}</div>
                    <div class="state-card__badge" v-if="props.activeState === state.name">
                        <i class="mdi mdi-eye" /> активный
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Event bindings ────────────────────────────────────── -->
        <div class="sp-section">
            <div class="sp-label">Привязка событий</div>
            <div class="sp-hint">
                Укажите событие, по которому каждое состояние становится активным.
            </div>
            <div v-for="state in props.states" :key="`ev-${state.name}`" class="event-row">
                <div class="event-row__name">{{ state.name }}</div>
                <div class="event-row__input-wrap">
                    <i class="mdi mdi-flash event-row__icon" />
                    <input
                        class="event-row__input"
                        type="text"
                        placeholder="имя события"
                        v-model="state.event"
                        @change="propChanged('states')" />
                </div>
                <button
                    class="event-row__del"
                    :disabled="!canDeleteState(state)"
                    @click.stop="removeState(state)">
                    <i class="mdi mdi-close" />
                </button>
            </div>
        </div>

        <!-- ── CSS per state ─────────────────────────────────────── -->
        <div class="sp-section">
            <div class="sp-label">CSS для состояний</div>
            <div class="sp-hint">
                Стили применяются к обёртке контейнера, когда данное состояние активно.
            </div>
            <div v-for="state in props.states" :key="`css-${state.name}`" class="css-row">
                <div
                    class="css-row__hd"
                    @click="cssOpen[state.name] = !cssOpen[state.name]">
                    <span class="css-row__name">{{ state.name }}</span>
                    <i class="mdi" :class="cssOpen[state.name] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="cssOpen[state.name]" class="css-row__body">
                    <textarea
                        class="css-row__textarea"
                        spellcheck="false"
                        placeholder="background: #f0f4ff;&#10;padding: 12px;"
                        :value="stateStyles[state.name] || ''"
                        @input="setStateCss(state.name, $event.target.value)" />
                </div>
            </div>
        </div>

        <!-- ── Add state ─────────────────────────────────────────── -->
        <div class="sp-section">
            <div class="sp-label">Новое состояние</div>
            <form class="add-row" @submit.prevent="addState">
                <input
                    class="add-row__input"
                    type="text"
                    placeholder="Имя состояния"
                    v-model="stateName" />
                <button class="add-row__btn" type="submit" :disabled="!stateName.trim()">
                    <i class="mdi mdi-plus" />
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import { Panel } from 'goodt-wcore';

export default {
    extends: Panel,
    data() {
        return {
            $meta: { name: 'Настройки виджета', icon: 'widgets' },
            stateName: '',
            cssOpen: {}
        };
    },
    computed: {
        stateStyles() {
            try {
                return JSON.parse(this.props.stateStyles || '{}');
            } catch (e) {
                return {};
            }
        }
    },
    methods: {
        setActiveState(state) {
            this.props.activeState = state.name;
            this.propChanged('activeState');
        },
        addState() {
            const name = this.stateName.trim();
            if (!name || this.props.states.find((s) => s.name === name)) return;
            this.props.states.push({ name, event: '' });
            // Auto-activate the new state so widgets land in it
            this.props.activeState = name;
            this.stateName = '';
            this.propChanged('states');
            this.propChanged('activeState');
        },
        removeState(state) {
            if (!this.canDeleteState(state)) return;
            this.props.states = this.props.states.filter((s) => s.name !== state.name);
            if (this.props.activeState === state.name) {
                this.props.activeState = this.props.states[0]?.name || 'default';
                this.propChanged('activeState');
            }
            this.propChanged('states');
        },
        canDeleteState(state) {
            return (
                this.props.states.length > 1 &&
                !this.elementInstance.$slots[state.name]
            );
        },
        setStateCss(name, value) {
            const current = this.stateStyles;
            if (value.trim()) {
                current[name] = value;
            } else {
                delete current[name];
            }
            this.props.stateStyles = JSON.stringify(current);
            this.propChanged('stateStyles');
        }
    }
};
</script>

<style scoped>
/* ── Section ────────────────────────────────────────────────── */
.sp-section { padding: 10px 12px; border-bottom: 1px solid #f0f4f8; }
.sp-section:last-child { border-bottom: none; }
.sp-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 6px;
}
.sp-hint {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 8px;
}

/* ── State cards ────────────────────────────────────────────── */
.state-cards { display: flex; flex-direction: column; gap: 5px; }
.state-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    background: #fff;
    transition: border-color 0.15s, background 0.15s;
}
.state-card:hover { border-color: #a5b4fc; background: #f5f7ff; }
.state-card--active { border-color: #4f6aff; background: #eff2ff; }
.state-card__name { font-size: 13px; font-weight: 600; color: #1e293b; }
.state-card--active .state-card__name { color: #4f6aff; }
.state-card__badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    color: #4f6aff;
    background: #e0e7ff;
    padding: 2px 8px;
    border-radius: 20px;
}
.state-card__badge .mdi { font-size: 12px; }

/* ── Event rows ─────────────────────────────────────────────── */
.event-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
}
.event-row__name {
    min-width: 72px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    flex-shrink: 0;
}
.event-row__input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
    transition: border-color 0.15s;
}
.event-row__input-wrap:focus-within { border-color: #4f6aff; }
.event-row__icon { font-size: 14px; color: #94a3b8; padding: 0 6px; flex-shrink: 0; }
.event-row__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 12px;
    color: #1e293b;
    padding: 6px 6px 6px 0;
    min-width: 0;
}
.event-row__del {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    color: #94a3b8;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.event-row__del:hover:not(:disabled) { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
.event-row__del:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── CSS per state ──────────────────────────────────────────── */
.css-row { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 6px; }
.css-row__hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
    transition: background 0.12s;
}
.css-row__hd:hover { background: #f1f5ff; }
.css-row__name { font-size: 12px; font-weight: 600; color: #334155; }
.css-row__hd .mdi { font-size: 16px; color: #94a3b8; }
.css-row__body { padding: 8px; background: #fff; border-top: 1px solid #e2e8f0; }
.css-row__textarea {
    width: 100%;
    height: 68px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 11px;
    line-height: 1.5;
    padding: 7px 9px;
    background: #f8fafc;
    color: #1e293b;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    resize: vertical;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}
.css-row__textarea:focus { border-color: #4f6aff; background: #fff; }

/* ── Add state ──────────────────────────────────────────────── */
.add-row { display: flex; gap: 6px; }
.add-row__input {
    flex: 1;
    height: 32px;
    padding: 0 10px;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    font-size: 12px;
    color: #1e293b;
    background: #fff;
    outline: none;
    min-width: 0;
    transition: border-color 0.15s;
}
.add-row__input:focus { border-color: #4f6aff; }
.add-row__btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 7px;
    background: #4f6aff;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    transition: background 0.12s, opacity 0.12s;
}
.add-row__btn:hover { background: #3b57e8; }
.add-row__btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
