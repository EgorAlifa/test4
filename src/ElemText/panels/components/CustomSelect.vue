<template>
    <div class="custom-select" :class="{ 'custom-select--open': isOpen, 'custom-select--disabled': disabled }">
        <div class="custom-select__trigger" @click="toggle">
            <div class="custom-select__value" :style="selectedStyle">
                {{ selectedLabel }}
            </div>
            <div class="custom-select__arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
        </div>

        <transition name="custom-select-dropdown">
            <div v-if="isOpen" class="custom-select__dropdown">
                <div v-if="showFontPreview" class="custom-select__categories">
                    <template v-for="(fonts, category) in groupedOptions">
                        <div :key="category" class="custom-select__category">
                            <div class="custom-select__category-label">
                                {{ getCategoryLabel(category) }}
                            </div>
                            <div
                                v-for="option in fonts"
                                :key="option.value"
                                class="custom-select__option"
                                :class="{ 'custom-select__option--selected': option.value === value }"
                                :style="{ fontFamily: option.preview }"
                                @click="selectOption(option)"
                            >
                                {{ option.label }}
                            </div>
                        </div>
                    </template>
                </div>

                <div v-else class="custom-select__options">
                    <div
                        v-for="option in options"
                        :key="option.value"
                        class="custom-select__option"
                        :class="{ 'custom-select__option--selected': option.value === value }"
                        @click="selectOption(option)"
                    >
                        {{ option.label }}
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import { categoryLabels } from '../../constants/fontFamilyOptions';

export default {
    name: 'WCustomSelect',

    model: {
        prop: 'value',
        event: 'input'
    },

    props: {
        value: {
            type: String,
            default: ''
        },
        options: {
            type: Array,
            required: true
        },
        placeholder: {
            type: String,
            default: 'Выберите...'
        },
        disabled: {
            type: Boolean,
            default: false
        },
        showFontPreview: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            isOpen: false
        };
    },

    computed: {
        selectedOption() {
            return this.options.find(opt => opt.value === this.value);
        },

        selectedLabel() {
            return this.selectedOption != null ? this.selectedOption.label : this.placeholder;
        },

        selectedStyle() {
            if (this.showFontPreview && this.selectedOption != null && this.selectedOption.preview) {
                return { fontFamily: this.selectedOption.preview };
            }
            return {};
        },

        groupedOptions() {
            if (!this.showFontPreview) return {};

            const groups = {};
            this.options.forEach(opt => {
                const cat = opt.category || 'other';
                if (groups[cat] == null) {
                    groups[cat] = [];
                }
                groups[cat].push(opt);
            });
            return groups;
        }
    },

    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },

    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },

    // Vue 2 compatibility
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
    },

    methods: {
        toggle() {
            if (!this.disabled) {
                this.isOpen = !this.isOpen;
            }
        },

        selectOption(option) {
            this.$emit('input', option.value);
            this.$emit('change', option.value);
            this.isOpen = false;
        },

        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.isOpen = false;
            }
        },

        getCategoryLabel(category) {
            return categoryLabels[category] || category;
        }
    }
};
</script>

<style scoped>
.custom-select {
    position: relative;
    width: 100%;
}

.custom-select__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.custom-select__trigger:hover {
    border-color: #93c5fd;
}

.custom-select--open .custom-select__trigger {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-select--disabled .custom-select__trigger {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
}

.custom-select__value {
    flex: 1;
    font-size: 13px;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.custom-select__arrow {
    margin-left: 8px;
    color: #9ca3af;
    transition: transform 0.2s ease;
}

.custom-select--open .custom-select__arrow {
    transform: rotate(180deg);
}

.custom-select__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 100;
    max-height: 280px;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.custom-select__category {
    padding: 4px 0;
}

.custom-select__category:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
}

.custom-select__category-label {
    padding: 8px 12px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: #9ca3af;
    letter-spacing: 0.5px;
}

.custom-select__option {
    padding: 8px 12px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    transition: background-color 0.1s ease;
}

.custom-select__option:hover {
    background: #f3f4f6;
}

.custom-select__option--selected {
    background: #eff6ff;
    color: #1d4ed8;
}

.custom-select__option--selected:hover {
    background: #dbeafe;
}

/* Dropdown animation */
.custom-select-dropdown-enter-active,
.custom-select-dropdown-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.custom-select-dropdown-enter-from,
.custom-select-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* Scrollbar styling */
.custom-select__dropdown::-webkit-scrollbar {
    width: 6px;
}

.custom-select__dropdown::-webkit-scrollbar-track {
    background: transparent;
}

.custom-select__dropdown::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.custom-select__dropdown::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>
