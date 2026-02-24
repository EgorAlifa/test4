/* place constant values, magic number semantic explanations here */

export const IMAGE_SOURCE_TYPES = {
    DATASET: 'dataset',
    MANUAL: 'manual'
};

export const IMAGE_FIT_OPTIONS = [
    { value: 'contain', label: 'Содержать (contain)' },
    { value: 'cover', label: 'Покрывать (cover)' },
    { value: 'fill', label: 'Заполнить (fill)' }
];

export const DEFAULT_CURRENT_INDEX = 0;
export const DEFAULT_TRANSITION_DURATION = 300; // eslint-disable-line no-magic-numbers
export const DEFAULT_ARROW_SIZE = { size: 48, unit: 'px' }; // eslint-disable-line no-magic-numbers
export const DEFAULT_ARROW_COLOR = '#ffffff';
export const DEFAULT_ARROW_BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.5)';
export const DEFAULT_INDICATOR_COLOR = '#3b82f6';

