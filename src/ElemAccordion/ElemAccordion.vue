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
                :style="headerStyle"
                @click="toggle(index)">
                <i
                    v-if="props.iconPosition === 'left'"
                    class="elem-accordion__icon elem-accordion__icon--left"
                    :class="iconClass(index)" />
                <span class="elem-accordion__title">{{ item.title }}</span>
                <i
                    v-if="props.iconPosition !== 'left'"
                    class="elem-accordion__icon elem-accordion__icon--right"
                    :class="iconClass(index)" />
            </div>
            <!-- Контент с анимацией -->
            <transition name="acc-expand">
                <div
                    v-if="isOpen(index)"
                    class="elem-accordion__body"
                    :style="bodyStyle">
                    <div class="elem-accordion__content" v-html="item.content" />
                </div>
            </transition>
        </div>
            <component v-if="accentCss" :is="'style'" v-html="accentCss" />
            <component v-if="customCss" :is="'style'" v-html="customCss" />
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
        headerStyle() {
            return {
                background: this.props.headerBg,
                color: this.props.headerColor,
                fontSize: this.props.headerFontSize,
                fontWeight: this.props.headerFontWeight,
                padding: this.props.headerPadding
            };
        },
        bodyStyle() {
            return {
                background: this.props.contentBg,
                color: this.props.contentColor,
                fontSize: this.props.contentFontSize,
                padding: this.props.contentPadding
            };
        },
        customCss() {
            const { cssRoot, cssItem, cssHeader, cssHeaderOpen, cssBody } = this.props;
            const parts = [];
            if (cssRoot) parts.push(`.elem-accordion { ${cssRoot} }`);
            if (cssItem) parts.push(`.elem-accordion__item { ${cssItem} }`);
            if (cssHeader) parts.push(`.elem-accordion__header { ${cssHeader} }`);
            if (cssHeaderOpen) parts.push(`.elem-accordion__item--open .elem-accordion__header { ${cssHeaderOpen} }`);
            if (cssBody) parts.push(`.elem-accordion__body { ${cssBody} }`);
            return parts.join('\n');
        },
        accentCss() {
            return `.elem-accordion__item--open .elem-accordion__header {
                border-bottom: 1px solid ${this.props.borderColor};
                color: ${this.props.accentColor};
            }
            .elem-accordion__icon { color: ${this.props.accentColor}; }`;
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
        },
        iconClass(index) {
            return this.isOpen(index)
                ? (this.props.iconOpen || 'mdi mdi-chevron-up')
                : (this.props.iconClosed || 'mdi mdi-chevron-down');
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
