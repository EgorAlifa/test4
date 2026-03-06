<template>
    <w-elem>
        <div class="elem-accordion" :class="cssClass" :style="[cssStyle, rootStyle]">
            <template v-for="group in groupedItems">
                <div
                    :key="group.index"
                    class="elem-accordion__item"
                    :class="{ 'elem-accordion__item--open': isOpen(group.index) }"
                    :style="itemStyle">

                    <!-- Заголовок -->
                    <div
                        class="elem-accordion__header"
                        :style="headerStyles[group.index]"
                        @click="toggle(group.index)">
                        <i
                            v-if="props.iconPosition === 'left'"
                            class="elem-accordion__icon elem-accordion__icon--left"
                            :class="iconClasses[group.index]" />
                        <span class="elem-accordion__title">{{ group.item.title }}</span>
                        <i
                            v-if="props.iconPosition !== 'left'"
                            class="elem-accordion__icon elem-accordion__icon--right"
                            :class="iconClasses[group.index]" />
                    </div>

                    <!-- Контент: всегда в DOM, показывается через v-show для корректной работы дроп-зон -->
                    <div
                        v-show="isOpen(group.index)"
                        class="elem-accordion__body"
                        :style="bodyStyle">

                        <!-- Именованный слот с fallback на HTML -->
                        <slot :name="`item-${group.index}`">
                            <div class="elem-accordion__content" v-html="group.item.content" />
                        </slot>

                        <!-- Вложенные разделы (level 1) -->
                        <div v-if="group.subItems.length" class="elem-accordion__subitems">
                            <div
                                v-for="sub in group.subItems"
                                :key="sub.index"
                                class="elem-accordion__item elem-accordion__item--sub"
                                :class="{ 'elem-accordion__item--open': isOpen(sub.index) }">

                                <div
                                    class="elem-accordion__header elem-accordion__header--sub"
                                    :style="subHeaderStyles[sub.index]"
                                    @click.stop="toggle(sub.index)">
                                    <i v-if="props.iconPosition === 'left'" class="elem-accordion__icon" :class="iconClasses[sub.index]" />
                                    <span class="elem-accordion__title">{{ sub.item.title }}</span>
                                    <i v-if="props.iconPosition !== 'left'" class="elem-accordion__icon" :class="iconClasses[sub.index]" />
                                </div>

                                <div
                                    v-show="isOpen(sub.index)"
                                    class="elem-accordion__body elem-accordion__body--sub"
                                    :style="bodyStyle">
                                    <slot :name="`item-${sub.index}`">
                                        <div class="elem-accordion__content" v-html="sub.item.content" />
                                    </slot>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Общий слот — всегда в DOM для определения drop-зоны -->
            <slot />
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
        groupedItems() {
            const groups = [];
            let currentGroup = null;
            this.props.items.forEach((item, i) => {
                if (item.enabled === false) return;
                const level = item.level || 0;
                if (level === 0) {
                    currentGroup = { index: i, item, subItems: [] };
                    groups.push(currentGroup);
                } else if (level === 1 && currentGroup) {
                    currentGroup.subItems.push({ index: i, item });
                }
            });
            return groups;
        },
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
        subHeaderStyles() {
            const openSet = new Set(this.openIndexes);
            return this.props.items.map((_, i) => ({
                background: this.props.headerBg,
                fontSize: this.props.headerFontSize,
                fontWeight: '500',
                padding: '10px 16px',
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
