<template>
    <div class="accordion-section" :class="{ 'accordion-section--collapsed': collapsed }">
        <div class="accordion-section__header" @click="$emit('toggle')">
            <i :class="`mdi mdi-${icon}`" class="accordion-section__icon" />
            <span class="accordion-section__title">{{ title }}</span>
            <span v-if="showCount" class="accordion-section__count">
                {{ enabledCount }}/{{ totalCount }}
            </span>
            <i
                class="mdi accordion-section__chevron"
                :class="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'"
            />
        </div>
        <div v-show="!collapsed" class="accordion-section__content">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: 'AccordionSection',

    props: {
        /**
         * Section title displayed in header
         */
        title: {
            type: String,
            required: true
        },

        /**
         * MDI icon name (without 'mdi-' prefix)
         * Example: 'palette', 'format-text', 'blur'
         */
        icon: {
            type: String,
            required: true
        },

        /**
         * Whether section is collapsed
         */
        collapsed: {
            type: Boolean,
            default: false
        },

        /**
         * Number of enabled/filled fields (for counter)
         */
        enabledCount: {
            type: Number,
            default: 0
        },

        /**
         * Total number of fields (for counter)
         */
        totalCount: {
            type: Number,
            default: 0
        },

        /**
         * Whether to show the N/M counter
         */
        showCount: {
            type: Boolean,
            default: true
        }
    },

    emits: ['toggle']
};
</script>

<style scoped>
.accordion-section {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin: 0 0 8px 0 !important;
    padding: 0 !important;
    overflow: hidden;
    background: #ffffff;
}

.accordion-section:last-child {
    margin-bottom: 0 !important;
}

.accordion-section__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f9fafb;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s ease;
}

.accordion-section__header:hover {
    background: #f3f4f6;
}

.accordion-section__icon {
    font-size: 14px;
    color: #6b7280;
}

.accordion-section__title {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
}

.accordion-section__count {
    font-size: 11px;
    color: #9ca3af;
    background: #e5e7eb;
    padding: 2px 6px;
    border-radius: 4px;
}

.accordion-section__chevron {
    font-size: 16px;
    color: #9ca3af;
    transition: transform 0.2s ease;
}

.accordion-section__content {
    padding: 12px;
    border-top: 1px solid #e5e7eb;
}
</style>
