<template>
    <w-elem>
        <div
            class="elem-tabs"
            :class="[cssClass, `elem-tabs--pos-${props.tabPosition}`, `elem-tabs--ind-${props.indicatorType}`]"
            :style="[cssStyle, rootStyle]">

            <!-- Панель вкладок -->
            <div class="elem-tabs__bar" :style="barStyle">
                <button
                    v-for="tab in visibleTabs"
                    :key="tab.origIndex"
                    class="elem-tabs__tab"
                    :class="{ 'elem-tabs__tab--active': activeIndex === tab.origIndex }"
                    :style="tabStyles[tab.origIndex]"
                    @click="setActive(tab.origIndex)">
                    <i v-if="tab.icon" :class="tab.icon" class="elem-tabs__tab-icon" />
                    <span>{{ tab.label }}</span>
                </button>
            </div>

            <!-- Содержимое: все панели в DOM, показываем нужную через v-show -->
            <div class="elem-tabs__content" :style="contentStyle">
                <div
                    v-for="tab in visibleTabs"
                    :key="`pane-${tab.origIndex}`"
                    v-show="activeIndex === tab.origIndex"
                    class="elem-tabs__pane">
                    <slot :name="`tab-${tab.origIndex}`">
                        <div v-html="tab.content" />
                    </slot>
                </div>
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
        visibleTabs() {
            return this.props.tabs
                .map((tab, i) => ({ ...tab, origIndex: i }))
                .filter(tab => tab.enabled !== false);
        },
        rootStyle() {
            const pos = this.props.tabPosition || 'top';
            return {
                '--tabs-accent': this.props.tabIndicatorColor,
                '--tabs-border': this.props.borderColor,
                display: 'flex',
                flexDirection: pos === 'bottom' ? 'column-reverse' : pos === 'left' ? 'row' : 'column'
            };
        },
        barStyle() {
            const isLeft = this.props.tabPosition === 'left';
            return {
                display: 'flex',
                flexWrap: isLeft ? 'nowrap' : 'wrap',
                flexDirection: isLeft ? 'column' : 'row',
                alignItems: 'stretch',
                background: this.props.tabBarBg,
                borderBottom: !isLeft ? `1.5px solid ${this.props.tabBarBorderColor || '#e2e8f0'}` : 'none',
                borderRight: isLeft ? `1.5px solid ${this.props.tabBarBorderColor || '#e2e8f0'}` : 'none',
                gap: this.props.tabGap || '2px',
                flexShrink: isLeft ? '0' : undefined
            };
        },
        contentStyle() {
            const pos = this.props.tabPosition || 'top';
            const isLeft = pos === 'left';
            return {
                flex: isLeft ? '1' : undefined,
                minWidth: isLeft ? '0' : undefined,
                background: this.props.contentBg,
                color: this.props.contentColor,
                fontSize: this.props.contentFontSize,
                padding: this.props.contentPadding,
                borderRadius: this.props.contentBorderRadius,
                border: this.props.showBorder ? `1px solid ${this.props.borderColor}` : 'none',
                borderTop: this.props.showBorder && pos === 'top' ? 'none' : undefined,
                borderBottom: this.props.showBorder && pos === 'bottom' ? 'none' : undefined,
                borderLeft: this.props.showBorder && isLeft ? 'none' : undefined
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
