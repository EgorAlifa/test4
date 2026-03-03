<template>
    <ui-panel-container>
        <ui-container>

            <!-- ── Режим работы ──────────────────────────────────────────── -->
            <ui-select prop="mode" :options="modeOptions">Режим работы</ui-select>

            <!-- ── GALLERY mode settings ────────────────────────────────── -->
            <template v-if="isGalleryMode">
                <ui-has-panel>
                    <ui-checkbox prop="awaitStoreFilter">
                        {{ descriptor.props.awaitStoreFilter.label }}
                    </ui-checkbox>
                    <template #panel>
                        <ui-panel :groups="[{ name: 'Настройка переменных', slot: 'default' }]">
                            <ui-select
                                prop="awaitVariableModeVariables"
                                :options="awaitModeVariableOptions"
                                multiple>
                                Переменные
                            </ui-select>
                        </ui-panel>
                    </template>
                </ui-has-panel>

                <ui-switch prop="isUseSkeleton">
                    {{ descriptor.props.isUseSkeleton.label }}
                </ui-switch>

                <ui-input
                    v-model="props.events.updateData"
                    @change="propChanged('events')">
                    {{ descriptor.props.events.label.updateData }}
                </ui-input>

                <ui-switch prop="isShowDefaultSlot">
                    <template #hint>
                        Отображает дефолтный слот когда ни одно из условий не выполняется.
                    </template>
                </ui-switch>

                <ui-switch v-model="isDevMode">Показать все слоты</ui-switch>
            </template>

            <!-- ── STACK mode settings ───────────────────────────────────── -->
            <template v-else-if="isStackMode">
                <div class="form-label">Активное состояние</div>
                <select
                    class="select select-small w-100"
                    v-model="props.activeState"
                    @change="propChanged('activeState')">
                    <option v-for="state in props.states" :value="state.name" :key="state.name">
                        {{ state.name }}
                    </option>
                </select>

                <div class="form-label mt-2">Добавить состояние</div>
                <form class="row row-collapse" @submit.prevent="addState">
                    <div class="col">
                        <input
                            class="input input-small w-100"
                            type="text"
                            placeholder="Имя состояния"
                            v-model="newStateName"
                        />
                    </div>
                    <div class="col col-auto">
                        <button class="btn btn-ghost btn-icon btn-small" type="submit">
                            <i class="mdi mdi-plus"></i>
                        </button>
                    </div>
                </form>

                <div class="form-label mt-2">Состояния</div>
                <div v-for="state in props.states" :key="state.name" class="stack-state-row">
                    <code
                        class="cursor-pointer stack-state-row__name"
                        @click="previewState(state)">
                        {{ state.name }}
                    </code>
                    <div class="form-control form-control-icon-left flex-1">
                        <input
                            class="input input-small w-100"
                            type="text"
                            placeholder="Событие для активации"
                            v-model="state.event"
                            @change="propChanged('states')"
                        />
                        <div class="icon"><i class="mdi mdi-flash color-grey"></i></div>
                    </div>
                    <button
                        class="btn btn-ghost btn-icon btn-small"
                        :class="{ disabled: props.states.length <= 1 }"
                        @click.stop="removeState(state)">
                        <i class="mdi mdi-close"></i>
                    </button>
                </div>
            </template>

            <!-- ── CONTAINER mode settings ───────────────────────────────── -->
            <template v-else-if="isContainerMode">
                <ui-switch prop="initShow">
                    {{ descriptor.props.initShow.label }}
                </ui-switch>
                <ui-switch prop="showMode">
                    {{ descriptor.props.showMode.label }}
                </ui-switch>

                <template v-if="!props.showMode">
                    <ui-input prop="eventShow">{{ descriptor.props.eventShow.label }}</ui-input>
                    <ui-input prop="eventHide">{{ descriptor.props.eventHide.label }}</ui-input>
                </template>
                <template v-else>
                    <ui-input prop="eventShowHide">{{ descriptor.props.eventShowHide.label }}</ui-input>
                    <ui-switch prop="reverseEvent">{{ descriptor.props.reverseEvent.label }}</ui-switch>
                </template>

                <!-- Preview toggle for editor -->
                <ui-switch v-if="isEditorMode" v-model="containerPreview">
                    Показать в редакторе
                </ui-switch>
            </template>

        </ui-container>
    </ui-panel-container>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { Mode } from '../constants';
import UiContainer from './components/UiContainer.vue';

const MODE_OPTIONS = [
    { value: Mode.GALLERY,   label: 'Галерея (условия по данным)' },
    { value: Mode.STACK,     label: 'Стек (событийное переключение)' },
    { value: Mode.CONTAINER, label: 'Контейнер (показ/скрытие)' }
];

export default {
    extends: Panel,
    components: { UiContainer },
    meta: { name: 'Настройки', icon: 'cog-outline' },

    data: () => ({
        newStateName: ''
    }),

    computed: {
        modeOptions: () => MODE_OPTIONS,

        isGalleryMode()   { return this.props.mode === Mode.GALLERY || !this.props.mode; },
        isStackMode()     { return this.props.mode === Mode.STACK; },
        isContainerMode() { return this.props.mode === Mode.CONTAINER; },

        isDevMode: {
            get() { return this.elementInstance?.isDevMode ?? false; },
            set(val) { if (this.elementInstance) this.elementInstance.isDevMode = val; }
        },

        containerPreview: {
            get() { return this.elementInstance?.containerVisible ?? false; },
            set(val) { if (this.elementInstance) this.elementInstance.containerVisible = val; }
        },

        awaitModeVariableOptions() {
            return Object.keys({
                ...this.descriptor.vars,
                ...this.elementInstance?.descriptor.vars
            }).sort();
        }
    },

    methods: {
        addState() {
            const name = this.newStateName.trim();
            if (!name) return;
            const exists = this.props.states.some((s) => s.name === name);
            if (exists) return;
            this.props.states.push({ name, event: '' });
            this.newStateName = '';
            this.propChanged('states');
        },

        removeState(state) {
            if (this.props.states.length <= 1) return;
            this.props.states = this.props.states.filter((s) => s.name !== state.name);
            if (this.props.activeState === state.name) {
                this.props.activeState = this.props.states[0].name;
                this.propChanged('activeState');
            }
            this.propChanged('states');
        },

        previewState(state) {
            if (this.elementInstance) {
                this.elementInstance.activeStackSlot = state.name;
            }
        }
    }
};
</script>

<style scoped>
.mt-2 { margin-top: 8px; }
.flex-1 { flex: 1; }

.stack-state-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
}

.stack-state-row__name {
    min-width: 60px;
    flex-shrink: 0;
}
</style>
