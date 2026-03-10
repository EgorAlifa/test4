import { PresetOrientation, PresetPosition, ResetAlign } from '../constants';

export const MarkPositionOptions = [
    { label: 'Наверху', value: 'mark-pos-top' },
    { label: 'Справа', value: 'flex-col mark-pos-right' },
    { label: 'Внизу', value: 'mark-pos-bottom' },
    { label: 'Слева', value: 'flex-col mark-pos-left' }
];

export const CaptionPositionOptions = [
    { label: 'Наверху', value: 'caption-top' },
    { label: 'Справа', value: 'caption-right' },
    { label: 'Внизу', value: 'caption-bottom' },
    { label: 'Слева', value: 'caption-left' }
];

export const IndexPositionOptions = [
    { label: 'Сверху', value: 'top' },
    { label: 'Снизу', value: 'bottom' }
];

export const IndexLocationsOptions = [
    { label: 'Слева', value: 'left' },
    { label: 'Справа', value: 'right' }
];

export const RulesOptions = ['<', '<=', '>=', '>', '=', '!='];

export const PresetBtnPositionOptions = [
    { label: 'Сверху', value: PresetPosition.TOP },
    { label: 'Справа', value: PresetPosition.RIGHT },
    { label: 'Снизу', value: PresetPosition.BOTTOM },
    { label: 'Слева', value: PresetPosition.LEFT }
];

export const PresetBtnOrientationOptions = [
    { label: 'По вертикали', value: PresetOrientation.VERTICAL },
    { label: 'По горизонтали', value: PresetOrientation.HORIZONTAL }
];

export const GradientDirectionOptions = [
    { value: 'to top', label: '↑' },
    { value: 'to left', label: '←' },
    { value: 'to right', label: '→' },
    { value: 'to bottom', label: '↓' },
    { value: 'to left top', label: '↖' },
    { value: 'to left bottom', label: '↙' },
    { value: 'to right top', label: '↗' },
    { value: 'to right bottom', label: '↘' }
];

export const AlignClassOptions = [
    { label: 'Слева', value: 'flex-h-start' },
    { label: 'По центру', value: 'flex-h-center' },
    { label: 'Справа', value: 'flex-h-end' }
];

export const ResetAlignOptions = [
    { value: ResetAlign.START, label: 'Слева' },
    { value: ResetAlign.CENTER, label: 'По центру' },
    { value: ResetAlign.END, label: 'Справа' }
];
