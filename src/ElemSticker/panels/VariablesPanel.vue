<template>
    <w-panel>
        <ui-container>
            <!-- Presets Selector -->
            <div class="presets-section">
                <div class="form-label form-label-small">Быстрые настройки</div>
                <div class="presets-grid">
                    <button
                        v-for="preset in presetOptions"
                        :key="preset.name"
                        class="preset-btn"
                        :class="{ 'preset-btn--active': currentPreset === preset.name }"
                        :title="preset.description"
                        @click="applyPreset(preset.name)"
                    >
                        <i :class="`mdi mdi-${preset.icon}`" class="preset-btn__icon" />
                        <span class="preset-btn__label">{{ preset.label }}</span>
                    </button>
                </div>
            </div>

            <!-- Listen Section (Incoming Variables) -->
            <div class="section-header">
                <span class="section-header__icon">📥</span>
                <span class="section-header__title">СЛУШАЕТ</span>
                <span class="section-header__subtitle">(входящие)</span>
            </div>

            <div class="bindings-container">
                <template v-for="(group, groupId) in sortedGroups">
                    <div
                        :key="groupId"
                        class="binding-group"
                        :class="{ 'binding-group--collapsed': isGroupCollapsed(groupId) }"
                    >
                        <div class="binding-group__header" @click="toggleGroup(groupId)">
                            <i :class="`mdi mdi-${group.icon || 'folder'}`" class="binding-group__icon" />
                            <span class="binding-group__title">{{ group.label }}</span>
                            <span class="binding-group__count">{{ getGroupEnabledCount(groupId) }}/{{ getGroupPropsCount(groupId) }}</span>
                            <i
                                class="mdi binding-group__chevron"
                                :class="isGroupCollapsed(groupId) ? 'mdi-chevron-right' : 'mdi-chevron-down'"
                            />
                        </div>

                        <div v-show="!isGroupCollapsed(groupId)" class="binding-group__content">
                            <div
                                v-for="(binding, propName) in getPropsForGroup(groupId)"
                                :key="propName"
                                class="binding-row"
                                :class="{ 'binding-row--active': isListenEnabled(propName) }"
                            >
                                <label class="binding-row__header">
                                    <input
                                        type="checkbox"
                                        :checked="isListenEnabled(propName)"
                                        @change="toggleListenBinding(propName, $event.target.checked)"
                                    />
                                    <span class="binding-row__label">{{ binding.label }}</span>
                                    <code v-if="!isListenEnabled(propName)" class="binding-row__hint">{{ binding.defaultVarName }}</code>
                                </label>
                                <input
                                    v-if="isListenEnabled(propName)"
                                    type="text"
                                    class="binding-row__input"
                                    :value="getListenVarName(propName)"
                                    :placeholder="binding.defaultVarName"
                                    @change="setListenVarName(propName, $event.target.value)"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Write Section (Outgoing Variables) -->
            <div class="section-header section-header--write">
                <span class="section-header__icon">📤</span>
                <span class="section-header__title">ПИШЕТ</span>
                <span class="section-header__subtitle">(исходящие)</span>
            </div>

            <div class="bindings-container">
                <div
                    v-for="(action, actionName) in writeActions"
                    :key="actionName"
                    class="action-row"
                >
                    <div class="action-row__header">
                        <label class="action-row__checkbox">
                            <input
                                type="checkbox"
                                :checked="isWriteEnabled(actionName)"
                                @change="toggleWriteBinding(actionName, $event.target.checked)"
                            />
                            <i :class="`mdi mdi-${action.icon || 'flash'}`" class="action-row__icon" />
                            <span class="action-row__label">{{ action.label }}</span>
                        </label>
                    </div>

                    <div v-if="isWriteEnabled(actionName)" class="action-row__config">
                        <div class="action-row__field">
                            <label class="field-label">Переменная</label>
                            <input
                                type="text"
                                class="binding-row__input"
                                :value="getWriteVarName(actionName)"
                                :placeholder="action.defaultVarName"
                                @change="setWriteVarName(actionName, $event.target.value)"
                            />
                        </div>
                        <div class="action-row__field">
                            <ui-select
                                :value="getWriteValue(actionName)"
                                :options="action.valueOptions"
                                label="Записывать"
                                @input="setWriteValue(actionName, $event)"
                            />
                        </div>
                        <div v-if="getWriteValue(actionName) === 'custom'" class="action-row__field">
                            <label class="field-label">Значение</label>
                            <input
                                type="text"
                                class="binding-row__input"
                                :value="getWriteCustomValue(actionName)"
                                placeholder="Введите значение"
                                @change="setWriteCustomValue(actionName, $event.target.value)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Help Tooltip -->
            <div class="help-section">
                <i class="mdi mdi-lightbulb-outline help-section__icon" />
                <span class="help-section__text">
                    Переменные позволяют связывать виджеты между собой.
                    <a href="#" class="help-section__link" @click.prevent="showHelp">Подробнее</a>
                </span>
            </div>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { VAR_BINDING_PRESETS } from '../../common/mixins/varBindingsMixin';

export default {
    extends: Panel,

    meta: { name: 'Переменные', icon: 'variable' },

    data() {
        return {
            collapsedGroups: {},
            presetOptions: [
                VAR_BINDING_PRESETS.none,
                VAR_BINDING_PRESETS.readOnly,
                VAR_BINDING_PRESETS.interactive,
                VAR_BINDING_PRESETS.fullBinding
            ]
        };
    },

    computed: {
        /**
         * Get varBindings schema from descriptor
         */
        varBindingsSchema() {
            return this.elem?.meta?.varBindings || this.descriptor?.varBindings || null;
        },

        /**
         * Get current varBindings state from props
         */
        varBindingsState() {
            return this.props.varBindings || { listen: {}, write: {} };
        },

        /**
         * Get groups sorted by order
         */
        sortedGroups() {
            const groups = this.varBindingsSchema?.groups || {};
            return Object.fromEntries(
                Object.entries(groups).sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            );
        },

        /**
         * Get listen bindings schema
         */
        listenBindings() {
            return this.varBindingsSchema?.listen || {};
        },

        /**
         * Get write actions schema
         */
        writeActions() {
            return this.varBindingsSchema?.write || {};
        },

        /**
         * Determine current preset based on state
         */
        currentPreset() {
            const state = this.varBindingsState;
            const listenKeys = Object.keys(state.listen || {}).filter(k => state.listen[k]?.enabled);
            const writeKeys = Object.keys(state.write || {}).filter(k => state.write[k]?.enabled);

            if (listenKeys.length === 0 && writeKeys.length === 0) {
                return 'none';
            }

            const schema = this.varBindingsSchema;
            const allListenKeys = Object.keys(schema?.listen || {});
            const allWriteKeys = Object.keys(schema?.write || {});
            const defaultEnabledKeys = Object.entries(schema?.listen || {})
                .filter(([, v]) => v.defaultEnabled)
                .map(([k]) => k);

            // Check for fullBinding
            if (listenKeys.length === allListenKeys.length && writeKeys.length === allWriteKeys.length) {
                return 'fullBinding';
            }

            // Check for interactive (default enabled + all writes)
            const hasAllDefaults = defaultEnabledKeys.every(k => listenKeys.includes(k));
            if (hasAllDefaults && writeKeys.length === allWriteKeys.length) {
                return 'interactive';
            }

            // Check for readOnly (only default enabled, no writes)
            if (hasAllDefaults && listenKeys.length === defaultEnabledKeys.length && writeKeys.length === 0) {
                return 'readOnly';
            }

            return null; // Custom configuration
        }
    },

    created() {
        // Initialize collapsed state from schema
        Object.entries(this.sortedGroups).forEach(([groupId, group]) => {
            this.$set(this.collapsedGroups, groupId, group.collapsed !== false);
        });
        // First group is always expanded
        const firstGroup = Object.keys(this.sortedGroups)[0];
        if (firstGroup) {
            this.$set(this.collapsedGroups, firstGroup, false);
        }
    },

    methods: {
        // ─────────────────────────────────────────────────────────────────────
        // GROUP MANAGEMENT
        // ─────────────────────────────────────────────────────────────────────

        isGroupCollapsed(groupId) {
            return this.collapsedGroups[groupId] ?? true;
        },

        toggleGroup(groupId) {
            this.$set(this.collapsedGroups, groupId, !this.collapsedGroups[groupId]);
        },

        getPropsForGroup(groupId) {
            const result = {};
            Object.entries(this.listenBindings).forEach(([prop, binding]) => {
                if (binding.group === groupId) {
                    result[prop] = binding;
                }
            });
            return result;
        },

        getGroupPropsCount(groupId) {
            return Object.keys(this.getPropsForGroup(groupId)).length;
        },

        getGroupEnabledCount(groupId) {
            const props = this.getPropsForGroup(groupId);
            return Object.keys(props).filter(prop => this.isListenEnabled(prop)).length;
        },

        // ─────────────────────────────────────────────────────────────────────
        // LISTEN BINDINGS
        // ─────────────────────────────────────────────────────────────────────

        isListenEnabled(propName) {
            return this.varBindingsState.listen?.[propName]?.enabled ?? false;
        },

        getListenVarName(propName) {
            return this.varBindingsState.listen?.[propName]?.varName ||
                   this.listenBindings[propName]?.defaultVarName || '';
        },

        toggleListenBinding(propName, enabled) {
            this.updateListenBinding(propName, { enabled });
        },

        setListenVarName(propName, varName) {
            this.updateListenBinding(propName, { varName });
        },

        updateListenBinding(propName, updates) {
            const current = this.varBindingsState.listen?.[propName] || {
                enabled: false,
                varName: this.listenBindings[propName]?.defaultVarName || ''
            };

            const newState = {
                ...this.varBindingsState,
                listen: {
                    ...this.varBindingsState.listen,
                    [propName]: { ...current, ...updates }
                }
            };

            this.props.varBindings = newState;
            this.propChanged('varBindings');
        },

        // ─────────────────────────────────────────────────────────────────────
        // WRITE BINDINGS
        // ─────────────────────────────────────────────────────────────────────

        isWriteEnabled(actionName) {
            return this.varBindingsState.write?.[actionName]?.enabled ?? false;
        },

        getWriteVarName(actionName) {
            return this.varBindingsState.write?.[actionName]?.varName ||
                   this.writeActions[actionName]?.defaultVarName || '';
        },

        getWriteValue(actionName) {
            return this.varBindingsState.write?.[actionName]?.writeValue ||
                   this.writeActions[actionName]?.valueOptions?.[0]?.value || 'html';
        },

        getWriteCustomValue(actionName) {
            return this.varBindingsState.write?.[actionName]?.customValue || '';
        },

        toggleWriteBinding(actionName, enabled) {
            this.updateWriteBinding(actionName, { enabled });
        },

        setWriteVarName(actionName, varName) {
            this.updateWriteBinding(actionName, { varName });
        },

        setWriteValue(actionName, writeValue) {
            this.updateWriteBinding(actionName, { writeValue });
        },

        setWriteCustomValue(actionName, customValue) {
            this.updateWriteBinding(actionName, { customValue });
        },

        updateWriteBinding(actionName, updates) {
            const actionSchema = this.writeActions[actionName];
            const current = this.varBindingsState.write?.[actionName] || {
                enabled: false,
                varName: actionSchema?.defaultVarName || '',
                writeValue: actionSchema?.valueOptions?.[0]?.value || 'html'
            };

            const newState = {
                ...this.varBindingsState,
                write: {
                    ...this.varBindingsState.write,
                    [actionName]: { ...current, ...updates }
                }
            };

            this.props.varBindings = newState;
            this.propChanged('varBindings');
        },

        // ─────────────────────────────────────────────────────────────────────
        // PRESETS
        // ─────────────────────────────────────────────────────────────────────

        applyPreset(presetName) {
            // Call the mixin method if available
            if (typeof this.elem?.applyVarBindingsPreset === 'function') {
                this.elem.applyVarBindingsPreset(presetName);
            } else {
                // Fallback: apply preset directly
                const preset = VAR_BINDING_PRESETS[presetName];
                if (!preset) return;

                const config = preset.getConfig(this.varBindingsSchema);

                // Build new state
                const newState = { listen: {}, write: {} };

                // Apply listen bindings
                Object.keys(this.listenBindings).forEach(prop => {
                    const defaultBinding = this.listenBindings[prop];
                    if (config.listen[prop]) {
                        newState.listen[prop] = {
                            enabled: true,
                            varName: config.listen[prop].varName || defaultBinding.defaultVarName
                        };
                    } else {
                        newState.listen[prop] = {
                            enabled: false,
                            varName: defaultBinding.defaultVarName
                        };
                    }
                });

                // Apply write bindings
                Object.keys(this.writeActions).forEach(action => {
                    const defaultAction = this.writeActions[action];
                    if (config.write[action]) {
                        newState.write[action] = {
                            enabled: true,
                            varName: config.write[action].varName || defaultAction.defaultVarName,
                            writeValue: config.write[action].writeValue || defaultAction.valueOptions?.[0]?.value
                        };
                    } else {
                        newState.write[action] = {
                            enabled: false,
                            varName: defaultAction.defaultVarName,
                            writeValue: defaultAction.valueOptions?.[0]?.value
                        };
                    }
                });

                this.props.varBindings = newState;
                this.propChanged('varBindings');
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // HELP
        // ─────────────────────────────────────────────────────────────────────

        showHelp() {
            // Could open a modal or external documentation
        }
    }
};
</script>

<style scoped>
/* Base styles */
.form-label-small {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

/* Presets Section */
.presets-section {
    margin-bottom: 16px;
}

.presets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.preset-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
}

.preset-btn:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
}

.preset-btn--active {
    border-color: #3b82f6;
    background: #eff6ff;
}

.preset-btn__icon {
    font-size: 16px;
    color: #6b7280;
}

.preset-btn--active .preset-btn__icon {
    color: #3b82f6;
}

.preset-btn__label {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
}

.preset-btn--active .preset-btn__label {
    color: #1d4ed8;
}

/* Section Headers */
.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    margin-top: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.section-header__icon {
    font-size: 14px;
}

.section-header__title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #374151;
}

.section-header__subtitle {
    font-size: 11px;
    color: #9ca3af;
}

.section-header--write {
    margin-top: 20px;
}

/* Bindings Container */
.bindings-container {
    margin-top: 8px;
}

/* Binding Group */
.binding-group {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;
}

.binding-group__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f9fafb;
    cursor: pointer;
    user-select: none;
}

.binding-group__header:hover {
    background: #f3f4f6;
}

.binding-group__icon {
    font-size: 14px;
    color: #6b7280;
}

.binding-group__title {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
}

.binding-group__count {
    font-size: 11px;
    color: #9ca3af;
    background: #e5e7eb;
    padding: 2px 6px;
    border-radius: 4px;
}

.binding-group__chevron {
    font-size: 16px;
    color: #9ca3af;
    transition: transform 0.2s ease;
}

.binding-group__content {
    padding: 8px 12px;
    border-top: 1px solid #e5e7eb;
}

/* Binding Row */
.binding-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
}

.binding-row:last-child {
    border-bottom: none;
}

.binding-row--active {
    background: #f0f9ff;
    margin: 0 -12px;
    padding: 8px 12px;
    border-radius: 6px;
    border-bottom: none;
}

.binding-row__header {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.binding-row__header input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    flex-shrink: 0;
}

.binding-row__label {
    font-size: 13px;
    color: #374151;
    flex-shrink: 0;
}

.binding-row--active .binding-row__label {
    font-weight: 500;
    color: #1d4ed8;
}

.binding-row__hint {
    font-size: 11px;
    color: #9ca3af;
    font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}

.binding-row__input {
    width: 100%;
    height: 32px;
    padding: 0 10px;
    border: 1px solid #93c5fd;
    border-radius: 6px;
    font-size: 13px;
    font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
    color: #1e40af;
    background: #ffffff;
}

.binding-row__input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.binding-row__input::placeholder {
    color: #9ca3af;
}

/* Action Row */
.action-row {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;
}

.action-row__header {
    padding: 10px 12px;
    background: #fef3c7;
}

.action-row__checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.action-row__checkbox input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.action-row__icon {
    font-size: 16px;
    color: #d97706;
}

.action-row__label {
    font-size: 13px;
    font-weight: 500;
    color: #92400e;
}

.action-row__config {
    padding: 12px;
    border-top: 1px solid #fde68a;
    background: #fffbeb;
}

.action-row__field {
    margin-bottom: 8px;
}

.action-row__field:last-child {
    margin-bottom: 0;
}

.field-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 4px;
}

/* Help Section */
.help-section {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 16px;
    padding: 12px;
    background: #f0f9ff;
    border-radius: 8px;
    border: 1px solid #bfdbfe;
}

.help-section__icon {
    font-size: 16px;
    color: #3b82f6;
    flex-shrink: 0;
}

.help-section__text {
    font-size: 12px;
    line-height: 1.5;
    color: #1e40af;
}

.help-section__link {
    color: #3b82f6;
    text-decoration: underline;
}

.help-section__link:hover {
    color: #1d4ed8;
}
</style>
