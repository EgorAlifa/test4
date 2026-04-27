const resolveTemplateColumns = ({ cardsMode: { card, columnCount } }) => {
    const hasCardWidth = card.width != null;

    if (hasCardWidth) {
        return `repeat(auto-fill, ${card.width})`;
    }

    return columnCount === 0 ? 'repeat(auto-fill, minmax(2rem, max-content))' : `repeat(${columnCount}, 1fr)`;
};

export const cssVars = {
    'table-zebra_bg-color': ['zebraStyle.bgColor', 'var(--color-grey-lighter)'],
    'table-zebra_color': ['zebraStyle.color', 'var(--color-body)'],
    'cards-grid_template-columns': resolveTemplateColumns,
    'cards-grid_auto-rows': ({ cardsMode: { card } }) => (card.height == null ? 'minmax(2rem, auto)' : card.height),
    'cards-grid_gap': ({ cardsMode: { gap } }) => gap.map((value) => value ?? '0.5rem').join(' '),
    'result-row_inset': ({ resultRow: { position } }) => (position === 'bottom' ? 'auto 0 0' : '0 0 auto'),
    'result-row_order': ({ resultRow: { position } }) => (position === 'bottom' ? '1' : '-1')
};
