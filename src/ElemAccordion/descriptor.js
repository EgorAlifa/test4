import panels from './panels';

export const descriptor = () => ({
    props: {
        // ── Элементы ───────────────────────────────────────────────────
        items: {
            type: Array,
            default() {
                return [
                    { title: 'Раздел 1', content: '<p>Содержимое первого раздела. Поддерживается <strong>HTML</strong> и изображения.</p>', enabled: true, level: 0 },
                    { title: 'Раздел 2', content: '<p>Содержимое второго раздела.</p>', enabled: true, level: 0 },
                    { title: 'Раздел 3', content: '<p>Содержимое третьего раздела.</p>', enabled: true, level: 0 }
                ];
            },
            factory() {
                return { title: 'Новый раздел', content: '', enabled: true, level: 0 };
            }
        },
        // ── Поведение ──────────────────────────────────────────────────
        multipleOpen: {
            type: Boolean,
            default: false
        },
        defaultOpenIndex: {
            type: Number,
            default: 0
        },
        // ── Иконка ────────────────────────────────────────────────────
        iconPosition: {
            type: String,
            default: 'right'
        },
        iconClosed: {
            type: String,
            default: 'mdi mdi-chevron-down'
        },
        iconOpen: {
            type: String,
            default: 'mdi mdi-chevron-up'
        },
        // ── Заголовок ─────────────────────────────────────────────────
        headerBg: {
            type: String,
            default: '#ffffff'
        },
        headerColor: {
            type: String,
            default: '#1e293b'
        },
        headerFontSize: {
            type: String,
            default: '15px'
        },
        headerFontWeight: {
            type: String,
            default: '600'
        },
        headerPadding: {
            type: String,
            default: '16px 20px'
        },
        // ── Контент ───────────────────────────────────────────────────
        contentBg: {
            type: String,
            default: '#f8fafc'
        },
        contentColor: {
            type: String,
            default: '#475569'
        },
        contentFontSize: {
            type: String,
            default: '14px'
        },
        contentPadding: {
            type: String,
            default: '12px 20px 16px'
        },
        // ── Акцент и обводка ──────────────────────────────────────────
        accentColor: {
            type: String,
            default: '#4f6aff'
        },
        borderColor: {
            type: String,
            default: '#e2e8f0'
        },
        borderRadius: {
            type: String,
            default: '12px'
        },
        itemGap: {
            type: String,
            default: '8px'
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
        const items = (props && props.items) || [];
        return ['default', ...items.map((_, i) => `item-${i}`)];
    }
};

export default descriptor;
