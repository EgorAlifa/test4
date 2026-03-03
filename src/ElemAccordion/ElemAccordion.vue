<template>
    <w-elem>
        <div class="elem-accordion" :class="cssClass" :style="[cssStyle, rootStyle]">
        <div
            v-for="(item, index) in props.items"
            :key="index"
            class="elem-accordion__item"
            :class="{ 'elem-accordion__item--open': isOpen(index) }"
            :style="itemStyle">
            <!-- Заголовок -->
            <div
                class="elem-accordion__header"
                :style="headerStyles[index]"
                @click="toggle(index)">
                <i
                    v-if="props.iconPosition === 'left'"
                    class="elem-accordion__icon elem-accordion__icon--left"
                    :class="iconClasses[index]" />
                <span class="elem-accordion__title">{{ item.title }}</span>
                <i
                    v-if="props.iconPosition !== 'left'"
                    class="elem-accordion__icon elem-accordion__icon--right"
                    :class="iconClasses[index]" />
            </div>
            <!-- Контент с анимацией -->
            <transition name="acc-expand">
                <div
                    v-if="isOpen(index)"
                    class="elem-accordion__body"
                    :style="bodyStyle">
                    <div v-if="!hasSlotContent" class="elem-accordion__content" v-html="item.content" />
                    <slot v-else />
                </div>
            </transition>
        </div>
            <component v-if="injectedCss" :is="'style'" v-html="injectedCss" />
            <component v-if="customCssContent" :is="'style'" v-html="customCssContent" />
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    extends: Elem,
    meta,
    data: () => ({
        ...ElemInstanceTypeDescriptor,
        openIndexes: []
    }),
    computed: {
        rootStyle() {
            return {
                '--acc-accent': this.props.accentColor,
                '--acc-border': this.props.borderColor,
                '--acc-radius': this.props.borderRadius,
                '--acc-gap': this.props.itemGap
            };
        },
        itemStyle() {
            return {
                border: `1px solid ${this.props.borderColor}`,
                borderRadius: this.props.borderRadius,
                overflow: 'hidden',
                marginBottom: this.props.itemGap
            };
        },
        headerStyles() {
            const openSet = new Set(this.openIndexes);
            const base = {
                background: this.props.headerBg,
                fontSize: this.props.headerFontSize,
                fontWeight: this.props.headerFontWeight,
                padding: this.props.headerPadding
            };
            return this.props.items.map((_, i) => ({
                ...base,
                color: openSet.has(i)
                    ? (this.props.accentColor || '#4f6aff')
                    : this.props.headerColor
            }));
        },
        bodyStyle() {
            return {
                background: this.props.contentBg,
                color: this.props.contentColor,
                fontSize: this.props.contentFontSize,
                padding: this.props.contentPadding
            };
        },
        hasSlotContent() {
            return !!(this.$slots.default && this.$slots.default.length);
        },
        iconClasses() {
            const open = this.props.iconOpen || 'mdi mdi-chevron-up';
            const closed = this.props.iconClosed || 'mdi mdi-chevron-down';
            const openSet = new Set(this.openIndexes);
            return this.props.items.map((_, i) => openSet.has(i) ? open : closed);
        },
        injectedCss() {
            const { accentColor, borderColor } = this.props;
            return [
                `.elem-accordion__item--open .elem-accordion__header { border-bottom: 1px solid ${borderColor}; }`,
                `.elem-accordion__icon { color: ${accentColor}; }`
            ].join('\n');
        },
        customCssContent() {
            const styles = this.props.customStyles;
            if (!styles || typeof styles !== 'object') return null;
            const selectorMap = {
                root:       '.elem-accordion',
                item:       '.elem-accordion__item',
                header:     '.elem-accordion__header',
                headerOpen: '.elem-accordion__item--open .elem-accordion__header',
                body:       '.elem-accordion__body'
            };
            const css = Object.entries(selectorMap)
                .filter(([key]) => styles[key])
                .map(([key, sel]) => `${sel} { ${styles[key]} }`)
                .join('\n');
            return css || null;
        }
    },
    watch: {
        'props.defaultOpenIndex': {
            immediate: true,
            handler(val) {
                this.openIndexes = val >= 0 ? [val] : [];
            }
        }
    },
    methods: {
        isOpen(index) {
            return this.openIndexes.includes(index);
        },
        toggle(index) {
            if (this.isOpen(index)) {
                this.openIndexes = this.openIndexes.filter((i) => i !== index);
            } else {
                this.openIndexes = this.props.multipleOpen
                    ? [...this.openIndexes, index]
                    : [index];
            }
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
