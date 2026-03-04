import panels from './panels';

export const descriptor = () => ({
    props: {
        // ── Вкладки ────────────────────────────────────────────────────
        tabs: {
            type: Array,
            default() {
                return [
                    { label: 'Раздел 1', content: '<p>Текст, изображения и любой <strong>HTML</strong>-контент.</p>', icon: '', enabled: true, level: 0 },
                    { label: 'Раздел 2', content: '', icon: '', enabled: true, level: 0 },
                    { label: 'Раздел 3', content: '', icon: '', enabled: true, level: 0 }
                ];
            },
            factory() {
                return { label: 'Новый раздел', content: '', icon: '', enabled: true, level: 0 };
            }
        },
        // ── Поведение ──────────────────────────────────────────────────
        activeTab: {
            type: Number,
            default: 0
        },
        // ── Расположение и тип ─────────────────────────────────────────
        tabPosition: {
            type: String,
            default: 'top'
        },
        indicatorType: {
            type: String,
            default: 'underline'
        },
        // ── Панель вкладок ─────────────────────────────────────────────
        tabBarBg: {
            type: String,
            default: '#ffffff'
        },
        tabBarBorderColor: {
            type: String,
            default: '#e2e8f0'
        },
        tabGap: {
            type: String,
            default: '2px'
        },
        // ── Неактивная вкладка ─────────────────────────────────────────
        tabBg: {
            type: String,
            default: 'transparent'
        },
        tabColor: {
            type: String,
            default: '#64748b'
        },
        tabFontSize: {
            type: String,
            default: '14px'
        },
        tabFontWeight: {
            type: String,
            default: '500'
        },
        tabPadding: {
            type: String,
            default: '10px 18px'
        },
        tabBorderRadius: {
            type: String,
            default: '8px'
        },
        // ── Активная вкладка ───────────────────────────────────────────
        tabActiveBg: {
            type: String,
            default: 'transparent'
        },
        tabActiveColor: {
            type: String,
            default: '#4f6aff'
        },
        tabIndicatorColor: {
            type: String,
            default: '#4f6aff'
        },
        // ── Содержимое ─────────────────────────────────────────────────
        contentBg: {
            type: String,
            default: '#ffffff'
        },
        contentColor: {
            type: String,
            default: '#334155'
        },
        contentFontSize: {
            type: String,
            default: '14px'
        },
        contentPadding: {
            type: String,
            default: '20px'
        },
        contentBorderRadius: {
            type: String,
            default: '0 0 12px 12px'
        },
        // ── Обводка ───────────────────────────────────────────────────
        borderColor: {
            type: String,
            default: '#e2e8f0'
        },
        showBorder: {
            type: Boolean,
            default: true
        },
        // ── Кастомный CSS (DesignerPanel) ─────────────────────────────
        customStyles: {
            type: Object,
            default: () => ({})
        }
    },
    vars: {},
    cssVars: {}
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: true,
    slotNames: ({ props }) => {
        const tabs = (props && props.tabs) || [];
        return ['default', ...tabs.map((_, i) => `tab-${i}`)];
    }
};

export default descriptor;
