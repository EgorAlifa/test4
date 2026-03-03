<template>
    <div>
        <div class="p">
            <div class="form-label">Активное состояние</div>
            <select
                class="select select-small w-100"
                v-model="props.activeState"
                @change="propChanged('activeState')"
            >
                <option v-for="state in props.states" :value="state.name" :key="state.name">
                    {{ state.name }}
                </option>
            </select>
        </div>
        <div class="p">
            <div class="form-label">Новое состояние</div>
            <div class="p cf">
                <form class="row row-collapse" @submit.prevent="addState">
                    <div class="col">
                        <div class="form-control w-100">
                            <input
                                class="input input-small w-100"
                                type="text"
                                placeholder="Имя состояния"
                                v-model="stateName"
                            />
                        </div>
                    </div>
                    <div class="col col-auto">
                        <button class="btn btn-ghost btn-icon btn-small">
                            <i class="mdi mdi-plus"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div class="p">
            <div class="form-label">Состояния:</div>
        </div>
        <hr class="p" />
        <div class="p" v-for="state in props.states" :key="state.name">
            <div class="p">
                <div class="row row-collapse">
                    <div class="col">
                        <div class="mar-bot-3">
                            <code class="cursor-pointer" @click="setActiveState(state)">{{
                                state.name
                            }}</code>
                        </div>
                        <div class="form-control form-control-icon-left w-100">
                            <input
                                class="input input-small w-100"
                                type="text"
                                placeholder="Событие, отображающее состояние"
                                v-model="state.event"
                                @change="propChanged('states')"
                            />
                            <div class="icon">
                                <i class="mdi mdi-flash color-grey"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col col-auto">
                        <div
                            class="btn btn-ghost btn-icon btn-small"
                            :class="{ disabled: !canDeleteState(state) }"
                            @click.stop="removeState(state)"
                        >
                            <i class="mdi mdi-close"></i>
                        </div>
                    </div>
                </div>
            </div>
            <hr class="p" />
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
            editState: null
        };
    },
    computed: {
        activeState() {
            return this.props.activeState;
        }
    },
    methods: {
        setActiveState(state) {
            this.props.activeState = state.name;
            this.propChanged();
        },
        addState() {
            let newState = { name: this.stateName, event: '' };
            if (!newState.name || this.hasState(newState)) {
                return;
            }
            if (!this.props.states.length) {
                this.props.activeState = newState.name;
            }
            this.props.states.push(newState);
            this.stateName = '';
            this.propChanged();
        },
        hasState(state) {
            return this.props.states.find(s => s.name === state.name) != null;
        },
        removeState(state) {
            this.props.states = this.props.states.filter(s => s.name !== state.name);
            if (this.props.activeState === state.name) {
                this.props.activeState = this.props.states[0].name;
            }
            this.propChanged();
        },
        canDeleteState(state) {
            return this.props.states.length > 1 && !this.elementInstance.$slots[state.name];
        }
    }
};
</script>
