<template>
    <w-elem>
        <div
            class="elem-tabs"
            :class="[cssClass, `elem-tabs--pos-${props.tabPosition}`, `elem-tabs--ind-${props.indicatorType}`]"
            :style="[cssStyle, rootStyle]">

            <!-- Панель вкладок (уровень 0) -->
            <div class="elem-tabs__bar" :style="barStyle">
                <button
                    v-for="tab in visibleRootTabs"
                    :key="tab.origIndex"
                    class="elem-tabs__tab"
                    :class="{ 'elem-tabs__tab--active': activeIndex === tab.origIndex }"
                    :style="tabStyles[tab.origIndex]"
                    @click="setActive(tab.origIndex)">
                    <i v-if="tab.icon" :class="tab.icon" class="elem-tabs__tab-icon" />
                    <span>{{ tab.label }}</span>
                </button>
            </div>

            <!-- Панель под-вкладок (уровень 1, показывается когда у активной вкладки есть дети) -->
            <div v-if="activeSubTabs.length" class="elem-tabs__subbar">
                <button
                    v-for="(sub, si) in activeSubTabs"
                    :key="sub.origIndex"
                    class="elem-tabs__subtab"
                    :class="{ 'elem-tabs__subtab--active': activeSubIndex === si }"
                    @click="activeSubIndex = si">
                    <i v-if="sub.icon" :class="sub.icon" class="elem-tabs__tab-icon" />
                    <span>{{ sub.label }}</span>
                </button>
            </div>

            <!-- Содержимое активной вкладки -->
            <div class="elem-tabs__content" :style="contentStyle">
                <transition name="tabs-fade" mode="out-in">
                    <div :key="activeSlotName" class="elem-tabs__pane">
                        <slot :name="activeSlotName">
                            <div v-html="activeTab.content" />
                        </slot>
                    </div>
                </transition>
                <slot />
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
        activeIndex: 0,
        activeSubIndex: 0
    }),
    computed: {
        visibleRootTabs() {
            return this.props.tabs
                .map((tab, i) => ({ ...tab, origIndex: i }))
                .filter(tab => (tab.level || 0) === 0 && tab.enabled !== false);
        },
        activeSubTabs() {
            const result = [];
            let found = false;
            for (let i = 0; i < this.props.tabs.length; i++) {
                const tab = this.props.tabs[i];
                if (i === this.activeIndex) { found = true; continue; }
                if (found) {
                    const level = tab.level || 0;
                    if (level === 0) break;
                    if (level === 1 && tab.enabled !== false) {
                        result.push({ ...tab, origIndex: i });
                    }
                }
            }
            return result;
        },
        activeTab() {
            if (this.activeSubTabs.length > 0) {
                const sub = this.activeSubTabs[this.activeSubIndex] || this.activeSubTabs[0];
                if (sub) return sub;
            }
            return this.props.tabs[this.activeIndex] || { content: '' };
        },
        activeSlotName() {
            if (this.activeSubTabs.length > 0) {
                const sub = this.activeSubTabs[this.activeSubIndex] || this.activeSubTabs[0];
                if (sub) return `tab-${sub.origIndex}`;
            }
            return `tab-${this.activeIndex}`;
        },
        rootStyle() {
            return {
                '--tabs-accent': this.props.tabIndicatorColor,
                '--tabs-border': this.props.borderColor
            };
        },
        barStyle() {
            return {
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'stretch',
                background: this.props.tabBarBg,
                borderBottom: `1.5px solid ${this.props.tabBarBorderColor || '#e2e8f0'}`,
                gap: this.props.tabGap || '2px'
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
        },
        activeIndex() {
            this.activeSubIndex = 0;
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
