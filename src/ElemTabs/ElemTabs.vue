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
                :style="tabStyle(index)"
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
                    class="elem-tabs__pane"
                    v-html="activeTab.content" />
            </transition>
        </div>

            <component v-if="indicatorCss" :is="'style'" v-html="indicatorCss" />
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
                borderBottomColor: this.props.tabBarBorderColor
            };
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
        indicatorCss() {
            const { tabIndicatorColor, indicatorType, tabActiveBg } = this.props;
            if (indicatorType === 'underline') {
                return `.elem-tabs__tab--active::after { background: ${tabIndicatorColor} !important; }`;
            }
            if (indicatorType === 'pill') {
                return `.elem-tabs__tab--active { background: ${tabActiveBg || tabIndicatorColor + '22'} !important; }`;
            }
            if (indicatorType === 'border') {
                return `.elem-tabs__tab--active { box-shadow: 0 0 0 2px ${tabIndicatorColor} !important; }`;
            }
            return '';
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
        },
        tabStyle(index) {
            const isActive = this.activeIndex === index;
            return {
                background: isActive ? this.props.tabActiveBg : this.props.tabBg,
                color: isActive ? this.props.tabActiveColor : this.props.tabColor,
                fontSize: this.props.tabFontSize,
                fontWeight: this.props.tabFontWeight,
                padding: this.props.tabPadding,
                borderRadius: this.props.indicatorType === 'pill' ? this.props.tabBorderRadius : undefined
            };
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
