import { resolveBorderRadius } from '../utils';

export const cssVars = {
    menu_height: 'sizeHeight',
    'menu_bg-color': 'widgetColor',
    'menu_border-radius': ({ borderRadius: { topLeft, topRight, bottomRight, bottomLeft } }) =>
        `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`,
    'menu_box-shadow': ({ shadowStyles: { color, blur, shiftX, shiftY, type } }) =>
        `${shiftX} ${shiftY} ${blur} ${color} ${type !== '' ? 'inset' : ''}`,
    'menu-opened_width': 'openWidth',
    'placeholder--active_color': 'backlight',
    placeholder_color: 'placeholderStyles.color',
    'placeholder_font-size': 'placeholderStyles.fontSize',
    'placeholder-font-weight': ['placeholderStyles.fontWeight', 'inherit'],
    'placeholder-font-family': 'placeholderStyles.fontFamily',
    'placeholder--multiselect_font-size': 'textPlaceholderMultiCount.fontSize',
    'placeholder--multiselect_color': 'textPlaceholderMultiCount.color',
    'placeholder--multiselect_font-weight': 'textPlaceholderMultiCount.fontWeight',
    'placeholder--multiselect_font-family': 'textPlaceholderMultiCount.fontFamily',
    'embedded-input-search_color': 'embeddedSearch.color',
    'embedded-input-search_font-size': 'embeddedSearch.fontSize',
    'embedded-input-search_font-weight': 'embeddedSearch.fontWeight',
    'embedded-input-search_font-family': 'embeddedSearch.fontFamily',
    'icon_font-size': 'iconFontSize',
    'input-search_bg-color': 'inputBackgroundColor',
    'input-search_color': 'searchModeInput.color',
    'input-search_font-weight': 'searchModeInput.fontWeight',
    'input-search_font-size': 'searchModeInput.fontSize',
    'input-search_font-family': 'searchModeInput.fontFamily',
    'input-search_margin-left': 'searchModeInput.marginLeft',
    'input-search-prefix_color': 'searchModeInput.prefixColor',
    'input-search-prefix_font-size': 'searchModeInput.prefixFontSize',
    'input-search-prefix_margin-left': 'searchModeInput.prefixMarginLeft',
    'input-search-postfix_font-size': 'searchModeInput.postfixFontSize',
    'input-search-postfix_color': 'searchModeInput.postfixColor',
    'input-search-postfix_margin-right': 'searchModeInput.postfixMarginRight',
    'input-search_border-width': 'searchModeInput.borderWidth',
    'input-search_border-color': 'searchModeInput.borderColor',
    'input-search_border-radius': 'searchModeInput.borderRadius',
    'sort_font-size': 'sort.fontSize',
    sort_color: 'sort.color',
    'sort_font-weight': 'sort.fontWeight',
    'sort_font-family': 'sort.fontFamily',
    option_color: 'dimensionsStyles.color',
    'option_font-size': 'dimensionsStyles.fontSize',
    'option_font-weight': ['dimensionsStyles.fontWeight', 'inherit'],
    'option_font-family': 'dimensionsStyles.fontFamily',
    'option_color-hover': ({ optionHover: { isEnabled, color } }) => (isEnabled ? color : 'inherit'),
    'option_background-hover': ({ optionHover: { isEnabled, background } }) => (isEnabled ? background : 'inherit'),
    'selected-option_color': 'selectedDimensionBacklightColor',

    'btn-clear_color': 'btnClear.color',
    'btn-clear_bg-color': 'btnClear.background',
    'btn-clear_font-size': 'btnClear.fontSize',
    'btn-clear_font-weight': 'btnClear.fontWeight',
    'btn-clear_font-family': 'btnClear.fontFamily',
    'btn-clear__icon_position': 'btnClear.icon.position',
    'btn-clear__icon_color': 'btnClear.icon.style.color',
    'btn-clear__icon_font-size': 'btnClear.icon.style.fontSize',
    'btn-clear__icon_margin': 'btnClear.icon.style.margin',
    'btn-clear__border-width': ({ btnClear: { border } }) => (border.isEnabled ? border.borders.width ?? null : null),
    'btn-clear__border-color': ({ btnClear: { border } }) => (border.isEnabled ? border.borders.color ?? null : null),
    'btn-clear__border-style': ({ btnClear: { border } }) => (border.isEnabled ? border.borders.style ?? null : null),
    'btn-clear__border-radius': ({ btnClear: { border } }) =>
        border.isEnabled ? resolveBorderRadius(border.borderRadius) : null,
    'btn-clear__box-shadow': ({ btnClear: { border } }) => (border.isEnabled ? null : 'none'),

    'btn-do_color': 'btnDo.color',
    'btn-do_bg-color': 'btnDo.background',
    'btn-do_font-size': 'btnDo.fontSize',
    'btn-do_font-weight': 'btnDo.fontWeight',
    'btn-do_font-family': 'btnDo.fontFamily',
    'btn-do__icon_position': 'btnDo.icon.position',
    'btn-do__icon_color': 'btnDo.icon.style.color',
    'btn-do__icon_font-size': 'btnDo.icon.style.fontSize',
    'btn-do__icon_margin': 'btnDo.icon.style.margin',
    'btn-do__border-width': ({ btnDo: { border } }) => (border.isEnabled ? border.borders.width ?? null : null),
    'btn-do__border-color': ({ btnDo: { border } }) => (border.isEnabled ? border.borders.color ?? null : null),
    'btn-do__border-style': ({ btnDo: { border } }) => (border.isEnabled ? border.borders.style ?? null : null),
    'btn-do__border-radius': ({ btnDo: { border } }) =>
        border.isEnabled ? resolveBorderRadius(border.borderRadius) : null,
    'btn-do__box-shadow': ({ btnDo: { border } }) => (border.isEnabled ? null : 'none'),

    'btn-cancel_color': 'btnCancel.color',
    'btn-cancel_bg-color': 'btnCancel.background',
    'btn-cancel_font-size': 'btnCancel.fontSize',
    'btn-cancel_font-weight': 'btnCancel.fontWeight',
    'btn-cancel_font-family': 'btnCancel.fontFamily',
    'btn-cancel__icon_position': 'btnCancel.icon.position',
    'btn-cancel__icon_color': 'btnCancel.icon.style.color',
    'btn-cancel__icon_font-size': 'btnCancel.icon.style.fontSize',
    'btn-cancel__icon_margin': 'btnCancel.icon.style.margin',
    'btn-cancel__border-width': ({ btnCancel: { border } }) => (border.isEnabled ? border.borders.width ?? null : null),
    'btn-cancel__border-color': ({ btnCancel: { border } }) => (border.isEnabled ? border.borders.color ?? null : null),
    'btn-cancel__border-style': ({ btnCancel: { border } }) => (border.isEnabled ? border.borders.style ?? null : null),
    'btn-cancel__border-radius': ({ btnCancel: { border } }) =>
        border.isEnabled ? resolveBorderRadius(border.borderRadius) : null,
    'btn-cancel__box-shadow': ({ btnCancel: { border } }) => (border.isEnabled ? null : 'none'),

    'btn-all_color': 'btnSelectAll.color',
    'btn-all_bg-color': 'btnSelectAll.background',
    'btn-all_font-size': 'btnSelectAll.fontSize',
    'btn-all_font-weight': 'btnSelectAll.fontWeight',
    'btn-all_font-family': 'btnSelectAll.fontFamily',
    'btn-all__icon_position': 'btnSelectAll.icon.position',
    'btn-all__icon_color': 'btnSelectAll.icon.style.color',
    'btn-all__icon_font-size': 'btnSelectAll.icon.style.fontSize',
    'btn-all__icon_margin': 'btnSelectAll.icon.style.margin',
    'btn-all__border-width': ({ btnSelectAll: { border } }) => (border.isEnabled ? border.borders.width ?? null : null),
    'btn-all__border-color': ({ btnSelectAll: { border } }) => (border.isEnabled ? border.borders.color ?? null : null),
    'btn-all__border-style': ({ btnSelectAll: { border } }) => (border.isEnabled ? border.borders.style ?? null : null),
    'btn-all__border-radius': ({ btnSelectAll: { border } }) =>
        border.isEnabled ? resolveBorderRadius(border.borderRadius) : null,
    'btn-all__box-shadow': ({ btnSelectAll: { border } }) => (border.isEnabled ? null : 'none'),

    'btn-paste-from-clipboard_color': 'btnPasteFromClipboard.color',
    'btn-paste-from-clipboard_bg-color': 'btnPasteFromClipboard.background',
    'btn-paste-from-clipboard_font-size': 'btnPasteFromClipboard.fontSize',
    'btn-paste-from-clipboard_font-weight': 'btnPasteFromClipboard.fontWeight',
    'btn-paste-from-clipboard_font-family': 'btnPasteFromClipboard.fontFamily',
    'btn-paste-from-clipboard__icon_position': 'btnPasteFromClipboard.icon.position',
    'btn-paste-from-clipboard__icon_color': 'btnPasteFromClipboard.icon.style.color',
    'btn-paste-from-clipboard__icon_font-size': 'btnPasteFromClipboard.icon.style.fontSize',
    'btn-paste-from-clipboard__icon_margin': 'btnPasteFromClipboard.icon.style.margin',
    'btn-paste-from-clipboard__border-width': ({ btnPasteFromClipboard: { border } }) =>
        border.isEnabled ? border.borders.width ?? null : null,
    'btn-paste-from-clipboard__border-color': ({ btnPasteFromClipboard: { border } }) =>
        border.isEnabled ? border.borders.color ?? null : null,
    'btn-paste-from-clipboard__border-style': ({ btnPasteFromClipboard: { border } }) =>
        border.isEnabled ? border.borders.style ?? null : null,
    'btn-paste-from-clipboard__border-radius': ({ btnPasteFromClipboard: { border } }) =>
        border.isEnabled ? resolveBorderRadius(border.borderRadius) : null,
    'btn-paste-from-clipboard__box-shadow': ({ btnPasteFromClipboard: { border } }) =>
        border.isEnabled ? null : 'none',

    'checkbox_font-size': 'checkboxFontSize',
    'radiobutton_font-size': 'radioButtonSettings.size',
    radiobutton_color: 'radioButtonSettings.backlight',
    header_padding: 'headerPadding',
    content_padding: 'contentPadding',
    'content_box-shadow': 'contentBoxShadow',
    'pagination-font-family': 'paginationOptions.fontFamily',
    'pagination-font-size': 'paginationOptions.fontSize',
    'pagination-color': 'paginationOptions.color',
    'pagination-active-color': 'paginationOptions.activeColor',
    'pagination-active-background': 'paginationOptions.activeBackground',
    'pagination-inactive-background': 'paginationOptions.inactiveBackground',
    'pagination-font-weight': 'paginationOptions.fontWeight',
    'pagination-height': ['paginationOptions.height', '24px'],
    'pagination-width': ['paginationOptions.width', '24px'],
    'pagination-border-radius': ({
        paginationOptions: {
            borderRadius: { topLeft, topRight, bottomRight, bottomLeft }
        }
    }) => `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`,

    'pagination-padding': ({ paginationOptions }) => {
        const isCustomPadding = paginationOptions.padding.some(Boolean);

        if (!isCustomPadding) {
            return '0 calc(var(--unit)*2)';
        }

        return paginationOptions.padding.map((padding) => padding ?? '0rem').join(' ');
    },
    'pagination-gap': 'paginationOptions.gap',
    'pagination-justify': 'paginationOptions.justify',
    'input-smart-search-height': ({ isSmartSearch, smartSearchHeight }) =>
        isSmartSearch ? smartSearchHeight ?? '100%' : '100%',
    'multi-count-size-unit': 'multiCountSizeUnit',
    'metric-color': ['metricOptions.color', 'rgba(0, 0, 0, 1)'],
    'metric-font-family': ['metricOptions.fontFamily', 'inherit'],
    'metric-font-size': 'metricOptions.fontSize',
    'metric-font-weight': ['metricOptions.fontWeight', 'inherit'],
    'metric-background-color': 'metricOptions.backgroundColor',
    'metric-text-align': 'metricOptions.textAlign'
};
