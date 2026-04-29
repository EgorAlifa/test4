/* eslint-disable no-restricted-syntax,no-magic-numbers */

export const TooltipOptions = {
    show: false,
    position: 'top',
    offsetX: 0,
    offsetY: 5,
    hideDelay: 100,
    autoWidth: true
};

export const CloseMode = {
    SIMPLE: 'simple',
    CLICK: 'click',
    NO_CLICK: 'noClick',
    STORE: 'store'
};

export const AlignOptions = [
    { label: 'Сверху', value: 'flex-start' },
    { label: 'Посредине', value: 'center' },
    { label: 'Снизу', value: 'flex-end' }
];

export const JustifyOptions = [
    { label: 'По левому краю', value: 'flex-start' },
    { label: 'По ширине', value: 'space-between' },
    { label: 'По правому краю', value: 'flex-end' }
];

export const SizeUnits = ['%', 'px', 'rem', 'em'];

export const CloseOptions = Object.freeze([
    {
        value: CloseMode.SIMPLE,
        label: 'простой'
    },
    {
        value: CloseMode.CLICK,
        label: 'закрытие по клику'
    },
    {
        value: CloseMode.NO_CLICK,
        label: 'без закрытия'
    },
    {
        value: CloseMode.STORE,
        label: 'пользовательский + шина'
    }
]);

export const DatasetFieldTypes = Object.freeze({
    NUMBER_TYPES: ['INTEGER', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL'],
    STRING_TYPES: ['VARCHAR', 'VARBINARY', 'DATE']
});

export const NonExistentValues = Object.freeze({
    NUMBER: 12345678987654321,
    STRING: '!@#$%^&*()'
});

export const Buttons = ['btnClear', 'btnDo', 'btnSelectAll', 'btnCancel', 'btnPasteFromClipboard'];

export const IconPositionOptions = [
    { label: 'Слева', value: 'row' },
    { label: 'Справа', value: 'row-reverse' },
    { label: 'Сверху', value: 'column' },
    { label: 'Снизу', value: 'column-reverse' }
];

export const SeparatorOptions = [
    { label: '10000', value: null },
    { label: '10 000', value: 'ru-RU' },
    { label: '10,000', value: 'en-EN' },
    { label: '10.000', value: 'de-DE' }
];

export const STRING_LIST_DELIMITER = ',';
export const EXCEL_PASTE_DELIMITER_RE = /[\n\t]+/g;