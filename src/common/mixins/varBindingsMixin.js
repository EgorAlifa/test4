/**
 * varBindingsMixin — VIBE 2.0
 *
 * Mixin for variable bindings support in widgets.
 * Provides interface for reading/writing cross-widget variables.
 */

export const VAR_BINDING_PRESETS = {
    none: {
        name: 'none',
        label: 'Нет',
        icon: 'cancel',
        description: 'Отключить все привязки',
        getConfig() {
            return { listen: {}, write: {} };
        }
    },
    readOnly: {
        name: 'readOnly',
        label: 'Только чтение',
        icon: 'eye-outline',
        description: 'Только входящие переменные',
        getConfig(schema) {
            const listen = {};
            Object.entries(schema?.listen || {}).forEach(([key, binding]) => {
                if (binding.defaultEnabled) {
                    listen[key] = { enabled: true, varName: binding.defaultVarName };
                }
            });
            return { listen, write: {} };
        }
    },
    interactive: {
        name: 'interactive',
        label: 'Интерактивный',
        icon: 'gesture-tap',
        description: 'Чтение и запись переменных',
        getConfig(schema) {
            const listen = {};
            const write = {};
            Object.entries(schema?.listen || {}).forEach(([key, binding]) => {
                if (binding.defaultEnabled) {
                    listen[key] = { enabled: true, varName: binding.defaultVarName };
                }
            });
            Object.entries(schema?.write || {}).forEach(([key, action]) => {
                write[key] = { enabled: true, varName: action.defaultVarName };
            });
            return { listen, write };
        }
    },
    fullBinding: {
        name: 'fullBinding',
        label: 'Полная',
        icon: 'link-variant-plus',
        description: 'Все привязки включены',
        getConfig(schema) {
            const listen = {};
            const write = {};
            Object.entries(schema?.listen || {}).forEach(([key, binding]) => {
                listen[key] = { enabled: true, varName: binding.defaultVarName };
            });
            Object.entries(schema?.write || {}).forEach(([key, action]) => {
                write[key] = { enabled: true, varName: action.defaultVarName };
            });
            return { listen, write };
        }
    }
};

export const varBindingsMixin = {
    computed: {
        varBindingsState() {
            return this.props?.varBindings || { listen: {}, write: {} };
        }
    },

    methods: {
        /**
         * Get prop value respecting variable binding (variable > props)
         */
        getBoundPropValue(propName) {
            return this.props?.[propName];
        },

        /**
         * Write a value to a bound variable (onClick, onChange, etc.)
         */
        commitBoundVar(/* actionName, value */) {
            // Requires platform store integration
        },

        /**
         * Apply a preset configuration to varBindings
         */
        applyVarBindingsPreset(presetName) {
            const preset = VAR_BINDING_PRESETS[presetName];
            if (!preset) return;

            const schema = this.meta?.varBindings || this.descriptor?.varBindings;
            if (!schema) return;

            const config = preset.getConfig(schema);
            const newState = { listen: {}, write: {} };

            Object.entries(schema.listen || {}).forEach(([prop, binding]) => {
                newState.listen[prop] = config.listen[prop]
                    ? { enabled: true, varName: config.listen[prop].varName || binding.defaultVarName }
                    : { enabled: false, varName: binding.defaultVarName };
            });

            Object.entries(schema.write || {}).forEach(([action, actionSchema]) => {
                newState.write[action] = config.write[action]
                    ? {
                        enabled: true,
                        varName: config.write[action].varName || actionSchema.defaultVarName,
                        writeValue: config.write[action].writeValue || actionSchema.valueOptions?.[0]?.value
                    }
                    : { enabled: false, varName: actionSchema.defaultVarName };
            });

            this.props.varBindings = newState;
            this.propChanged('varBindings');
        }
    }
};
