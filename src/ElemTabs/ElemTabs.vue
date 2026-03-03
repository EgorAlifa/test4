<template>
    <w-elem>
        <div
            class="elem-tabs"
        :class="[cssClass, `elem-tabs--pos-${props.tabPosition}`, `elem-tabs--ind-${props.indicatorType}`]"
        :style="[cssStyle, rootStyle]">

        <!-- Панель вкладок -->
        <div class="elem-tabs__bar" :style="barStyle">
            <button
                v-for="(tab, index) in props.tabs"
                :key="index"
                class="elem-tabs__tab"
                :class="{ 'elem-tabs__tab--active': activeIndex === index }"
                :style="tabStyles[index]"
                @click="setActive(index)">
                <i v-if="tab.icon" :class="tab.icon" class="elem-tabs__tab-icon" />
                <span>{{ tab.label }}</span>
            </button>
        </div>

        <!-- Содержимое активной вкладки -->
        <div class="elem-tabs__content" :style="contentStyle">
            <transition name="tabs-fade" mode="out-in">
                <div
                    :key="activeIndex"
                    class="elem-tabs__pane">
                    <div v-if="!hasSlotContent" v-html="activeTab.content" />
                    <slot />
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
        activeIndex: 0
    }),
    computed: {
        activeTab() {
            return this.props.tabs[this.activeIndex] || { content: '' };
        },
        rootStyle() {
            return {
                '--tabs-accent': this.props.tabIndicatorColor,
                '--tabs-border': this.props.borderColor
            };
        },
        barStyle() {
            return {
                background: this.props.tabBarBg,
                borderBottomColor: this.props.tabBarBorderColor,
                gap: this.props.tabGap || '2px'
            };
        },
        hasSlotContent() {
            return !!(this.$slots.default && this.$slots.default.length);
        },
        contentStyle() {
            return {
                background: this.props.contentBg,
                color: this.props.contentColor,
                fontSize: this.props.contentFontSize,
                padding: this.props.contentPadding,
                borderRadius: this.props.contentBorderRadius,
                border: this.props.showBorder
                    ? `1px solid ${this.props.borderColor}`
                    : 'none',
                borderTop: this.props.showBorder && this.props.tabPosition === 'top'
                    ? 'none'
                    : undefined
            };
        },
        tabStyles() {
            const { tabActiveBg, tabBg, tabActiveColor, tabColor,
                    tabFontSize, tabFontWeight, tabPadding,
                    tabBorderRadius, indicatorType } = this.props;
            const isPill = indicatorType === 'pill';
            return this.props.tabs.map((_, index) => {
                const isActive = this.activeIndex === index;
                return {
                    background: isActive ? tabActiveBg : tabBg,
                    color: isActive ? tabActiveColor : tabColor,
                    fontSize: tabFontSize,
                    fontWeight: tabFontWeight,
                    padding: tabPadding,
                    borderRadius: isPill ? tabBorderRadius : undefined
                };
            });
        },
        injectedCss() {
            const { tabIndicatorColor, indicatorType, tabActiveBg } = this.props;
            const parts = [];
            if (indicatorType === 'underline') {
                parts.push(`.elem-tabs__tab--active::after { background: ${tabIndicatorColor} !important; }`);
            } else if (indicatorType === 'pill') {
                parts.push(`.elem-tabs__tab--active { background: ${tabActiveBg || tabIndicatorColor + '22'} !important; }`);
            } else if (indicatorType === 'border') {
                parts.push(`.elem-tabs__tab--active { box-shadow: 0 0 0 2px ${tabIndicatorColor} !important; }`);
            }
            return parts.join('\n') || null;
        },
        customCssContent() {
            const styles = this.props.customStyles;
            if (!styles || typeof styles !== 'object') return null;
            const selectorMap = {
                root:      '.elem-tabs',
                bar:       '.elem-tabs__bar',
                tab:       '.elem-tabs__tab',
                tabActive: '.elem-tabs__tab--active',
                content:   '.elem-tabs__content'
            };
            const css = Object.entries(selectorMap)
                .filter(([key]) => styles[key])
                .map(([key, sel]) => `${sel} { ${styles[key]} }`)
                .join('\n');
            return css || null;
        }
    },
    watch: {
        'props.activeTab': {
            immediate: true,
            handler(val) {
                this.activeIndex = val ?? 0;
            }
        }
    },
    methods: {
        setActive(index) {
            this.activeIndex = index;
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
