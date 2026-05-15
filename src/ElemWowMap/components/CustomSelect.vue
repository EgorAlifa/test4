<template>
    <div class="custom-select-wrapper" ref="selectWrapper">
        <div 
            ref="trigger"
            class="custom-select-trigger" 
            @click="toggleDropdown"
            tabindex="0"
            @keydown.enter.prevent="toggleDropdown"
            @keydown.space.prevent="toggleDropdown"
            @keydown.esc="closeDropdown"
            :aria-label="computedAriaLabel"
            role="button"
            :class="{ 'is-open': isOpen, 'has-value': value != null }"
        >
            <span v-if="!value && placeholder" class="trigger-placeholder">{{ placeholder }}</span>
            <span v-else class="trigger-value">
                <span :style="showFontPreview ? { fontFamily: value } : {}">{{ selectedLabel }}</span>
            </span>
            <svg
                class="dropdown-arrow"
                :class="{ 'arrow-open': isOpen }"
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        
        <transition name="dropdown">
            <div 
                v-if="isOpen" 
                class="custom-select-dropdown"
                :style="dropdownStyle" 
                @click.stop
                ref="dropdown"
                tabindex="-1"
                @keydown="handleKeydown"
            >
                <div 
                    v-for="(option, index) in options" 
                    :key="option.value"
                    class="custom-select-option"
                    :class="{ 
                        'is-selected': option.value === value,
                        'is-highlighted': index === highlightedIndex
                    }"
                    @click.stop="selectOption(option)"
                >
                    <span class="option-label">
                        <span :style="showFontPreview ? { fontFamily: option.value } : {}">{{ option.label }}</span>
                    </span>
                    <svg
                        v-if="option.value === value"
                        class="check-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none">
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'CustomSelect',
    
    props: {
        value: {
            type: [String, Number],
            default: null
        },
        options: {
            type: Array,
            required: true,
            // Array of { value: any, label: string }
        },
        placeholder: {
            type: String,
            default: 'Выберите опцию'
        },
        showFontPreview: {
            type: Boolean,
            default: false
        }
    },
    
    data() {
        return {
            isOpen: false,
            highlightedIndex: -1,
            dropdownStyle: {}
        };
    },
    
    computed: {
        selectedLabel() {
            const selected = this.options.find(opt => opt.value === this.value);
            const label = selected ? selected.label : '';
            return label;
        },
        computedAriaLabel() {
            // Fallback chain: selectedLabel -> lookup from options -> default
            if (this.selectedLabel) {
                return this.selectedLabel;
            }
            if (this.value != null) {
                const foundOption = this.options.find(opt => opt.value === this.value);
                if (foundOption != null) {
                    return foundOption.label;
                }
            }
            return 'Select option';
        }
    },
    
    watch: {
        value() {
            // Value changed - no action needed
        }
    },
    
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        window.addEventListener('scroll', this.handleScroll, true);
        window.addEventListener('resize', this.handleResize);
        this.moveDropdownToBody();
    },
    
    updated() {
        this.moveDropdownToBody();
    },
    
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('scroll', this.handleScroll, true);
        window.removeEventListener('resize', this.handleResize);
        this.removeDropdownFromBody();
    },
    
    methods: {
        moveDropdownToBody() {
            // Move dropdown to body to avoid overflow clipping
            this.$nextTick(() => {
                const { dropdown } = this.$refs;
                if (dropdown && dropdown.parentNode !== document.body) {
                    document.body.appendChild(dropdown);
                }
            });
        },
        
        removeDropdownFromBody() {
            const { dropdown } = this.$refs;
            if (dropdown && dropdown.parentNode === document.body) {
                document.body.removeChild(dropdown);
            }
        },
        
        calculateDropdownPosition() {
            const { trigger } = this.$refs;
            if (trigger == null) {
                return;
            }
            
            const rect = trigger.getBoundingClientRect();
            const dropdownMaxHeight = 200; // Match max-height from CSS
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            // Determine if dropdown should open upward or downward
            const openUpward = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;
            
            this.dropdownStyle = {
                position: 'fixed',
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: 101000
            };
            
            if (openUpward) {
                this.dropdownStyle.bottom = `${viewportHeight - rect.top + 4}px`;
                this.dropdownStyle.maxHeight = `${Math.min(dropdownMaxHeight, spaceAbove - 8)}px`;
            } else {
                this.dropdownStyle.top = `${rect.bottom + 4}px`;
                this.dropdownStyle.maxHeight = `${Math.min(dropdownMaxHeight, spaceBelow - 8)}px`;
            }
        },
        
        toggleDropdown() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                // Calculate dropdown position
                this.$nextTick(() => {
                    this.calculateDropdownPosition();
                    
                    const { dropdown } = this.$refs;
                    // Set highlighted index to currently selected option or 0, handle empty options
                    if (this.options.length === 0) {
                        this.highlightedIndex = -1;
                    } else {
                        const selectedIndex = this.options.findIndex(opt => opt.value === this.value);
                        this.highlightedIndex = selectedIndex >= 0 ? selectedIndex : 0;
                        // Scroll highlighted option into view
                        if (this.highlightedIndex >= 0 && dropdown) {
                            const options = dropdown.querySelectorAll('.custom-select-option');
                            if (options && options[this.highlightedIndex]) {
                                options[this.highlightedIndex].scrollIntoView({ block: 'nearest' });
                            }
                        }
                    }
                });
            } else {
                this.highlightedIndex = -1;
            }
        },
        
        closeDropdown() {
            this.isOpen = false;
            this.highlightedIndex = -1;
        },
        
        selectOption(option) {
            if (option == null) {
                return;
            }
            this.$emit('input', option.value);
            this.$emit('change', option.value);
            this.highlightedIndex = -1;
            this.isOpen = false;
        },
        
        scrollHighlightedIntoView() {
            this.$nextTick(() => {
                const { dropdown } = this.$refs;
                if (dropdown == null || this.highlightedIndex < 0) {
                    return;
                }
                const options = dropdown.querySelectorAll('.custom-select-option');
                if (options && options[this.highlightedIndex]) {
                    options[this.highlightedIndex].scrollIntoView({ block: 'nearest' });
                }
            });
        },
        
        handleKeydown(event) {
            if (!this.isOpen) {
                return;
            }
            
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.options.length - 1);
                    this.scrollHighlightedIntoView();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
                    this.scrollHighlightedIntoView();
                    break;
                case 'Enter':
                case ' ':
                    if (this.highlightedIndex >= 0 && this.highlightedIndex < this.options.length) {
                        event.preventDefault();
                        this.selectOption(this.options[this.highlightedIndex]);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.closeDropdown();
                    break;
                default:
                    // Other keys are not handled
                    break;
            }
        },
        
        handleClickOutside(event) {
            const { selectWrapper, dropdown } = this.$refs;
            // Check if click is outside both the wrapper and the dropdown
            const isOutsideWrapper = selectWrapper != null && selectWrapper.contains(event.target) === false;
            const isOutsideDropdown = dropdown != null && dropdown.contains(event.target) === false;
            
            if (isOutsideWrapper && isOutsideDropdown) {
                this.closeDropdown();
            }
        },
        
        handleScroll() {
            if (this.isOpen) {
                this.calculateDropdownPosition();
            }
        },
        
        handleResize() {
            if (this.isOpen) {
                this.calculateDropdownPosition();
            }
        }
    }
};
</script>

<style scoped>
.custom-select-wrapper {
    position: relative;
    width: 100%;
    overflow: visible;
    z-index: auto;
}

.custom-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--filterPanelBorder, #d1d5db);
    border-radius: 6px;
    font-size: 13px;
    background: var(--filterPanelBg, #ffffff);
    cursor: pointer;
    transition: all 0.2s;
    color: var(--bodyColor, #111827);
    font-weight: 400;
    line-height: 1.5;
    min-height: 38px;
    box-sizing: border-box;
}

/* Force light theme colors */
:global(.elemwowmap-widget-root.theme-light) .custom-select-trigger {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: #d1d5db !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-trigger .trigger-value {
    color: #111827 !important;
}

.custom-select-trigger:hover {
    border-color: var(--controlsPanelBorder, #9ca3af);
    background-color: var(--controlsPanelBg, #f9fafb);
}

.custom-select-trigger.is-open {
    border-color: var(--primaryButtonBg, #2d7ff9);
    background-color: var(--filterPanelBg, #ffffff);
    box-shadow: 0 0 0 3px rgba(45, 127, 249, 0.1);
}

.custom-select-trigger.has-value .trigger-value {
    color: var(--bodyColor, #111827);
}

.trigger-placeholder {
    color: var(--captionColor, #6b7280);
}

.trigger-value {
    flex: 1;
    text-align: left;
}

.dropdown-arrow {
    flex-shrink: 0;
    margin-left: 8px;
    transition: transform 0.2s;
    color: var(--bodyColor, #6b7280);
}

.dropdown-arrow.arrow-open {
    transform: rotate(180deg);
}

.custom-select-dropdown {
    /* Position is set dynamically via inline style (fixed positioning) */
    background: var(--filterPanelBg, #ffffff);
    border: 1px solid var(--filterPanelBorder, #d1d5db);
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow-y: auto;
}

/* Force light theme dropdown background */
:global(.elemwowmap-widget-root.theme-light) .custom-select-dropdown {
    background: #ffffff !important;
    border-color: #d1d5db !important;
}

.custom-select-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    font-size: 13px;
    color: var(--bodyColor, #374151);
    cursor: pointer;
    transition: background-color 0.15s;
}

/* Force light theme option colors */
:global(.elemwowmap-widget-root.theme-light) .custom-select-option {
    background: #ffffff !important;
    color: #374151 !important;
}

.custom-select-option:hover {
    background-color: var(--controlsPanelBg, #f9fafb);
}

.custom-select-option.is-highlighted:not(.is-selected) {
    background-color: var(--chartBg, #f3f4f6);
    color: var(--bodyColor, #374151);
}

.custom-select-option.is-selected {
    background-color: var(--primaryButtonBg, #eff6ff);
    color: var(--primaryButtonColor, #1e40af);
    font-weight: 500;
}

.option-label {
    flex: 1;
    text-align: left;
}

.check-icon {
    flex-shrink: 0;
    margin-left: 8px;
    color: var(--primaryButtonBg, #1e40af);
}

.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.15s, transform 0.15s;
}

.dropdown-enter,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* Scrollbar styling */
.custom-select-dropdown::-webkit-scrollbar {
    width: 6px;
}

.custom-select-dropdown::-webkit-scrollbar-track {
    background: var(--controlsPanelBg, #f9fafb);
    border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb {
    background: var(--filterPanelBorder, #d1d5db);
    border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb:hover {
    background: var(--controlsPanelBorder, #9ca3af);
}

/* Light theme adjustments - using !important to override any conflicting styles */
:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-trigger,
:global(.elemwowmap-widget-root.theme-light) .custom-select-trigger {
    background: #ffffff !important;
    color: #111827 !important;
    border-color: #d1d5db !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-trigger:hover,
:global(.elemwowmap-widget-root.theme-light) .custom-select-trigger:hover {
    background-color: #f9fafb !important;
    border-color: #9ca3af !important;
    color: #374151 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-trigger.is-open,
:global(.elemwowmap-widget-root.theme-light) .custom-select-trigger.is-open {
    border-color: #3498db !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
    color: #111827 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-trigger.is-open .trigger-value,
:global(.elemwowmap-widget-root.theme-light) .custom-select-trigger.is-open .trigger-value {
    color: #111827 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-dropdown,
:global(.elemwowmap-widget-root.theme-light) .custom-select-dropdown {
    background: #ffffff !important;
    border-color: #d1d5db !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-option,
:global(.elemwowmap-widget-root.theme-light) .custom-select-option {
    background: #ffffff !important;
    color: #374151 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-option:hover,
:global(.elemwowmap-widget-root.theme-light) .custom-select-option:hover {
    background-color: #f9fafb !important;
    color: #374151 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-option.is-highlighted:not(.is-selected),
:global(.elemwowmap-widget-root.theme-light) .custom-select-option.is-highlighted:not(.is-selected) {
    background-color: #f3f4f6 !important;
    color: #374151 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .custom-select-option.is-selected,
:global(.elemwowmap-widget-root.theme-light) .custom-select-option.is-selected {
    background-color: #dbeafe !important;
    color: #1e40af !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .check-icon,
:global(.elemwowmap-widget-root.theme-light) .check-icon {
    color: #3498db !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .dropdown-arrow,
:global(.elemwowmap-widget-root.theme-light) .dropdown-arrow {
    color: #6b7280 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .trigger-placeholder,
:global(.elemwowmap-widget-root.theme-light) .trigger-placeholder {
    color: #6b7280 !important;
}

:global(.elemwowmap-widget-root.theme-light) .custom-select-wrapper .trigger-value,
:global(.elemwowmap-widget-root.theme-light) .trigger-value {
    color: #111827 !important;
}

/* Dark theme adjustments */
:global(.elemwowmap-widget-root.theme-dark) .custom-select-trigger.is-open {
    box-shadow: 0 0 0 3px rgba(45, 127, 249, 0.2);
}

:global(.elemwowmap-widget-root.theme-dark) .custom-select-option.is-selected {
    background-color: rgba(45, 127, 249, 0.2);
    color: var(--primaryButtonColor, #60a5fa);
}

:global(.elemwowmap-widget-root.theme-blue) .custom-select-trigger.is-open {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

:global(.elemwowmap-widget-root.theme-blue) .custom-select-option.is-selected {
    background-color: rgba(59, 130, 246, 0.2);
    color: var(--primaryButtonColor, #60a5fa);
}

:global(.elemwowmap-widget-root.theme-blue) .custom-select-wrapper .trigger-placeholder,
:global(.elemwowmap-widget-root.theme-blue) .trigger-placeholder {
    color: rgba(255, 255, 255, 0.7) !important;
}
</style>

