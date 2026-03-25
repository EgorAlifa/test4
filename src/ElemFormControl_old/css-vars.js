import { ControlType } from '../shared/constants';

export const cssVars = {
    // eslint-disable-next-line no-restricted-syntax
    control_size: ['control.size', 'calc(var(--unit) * 3)'],
    'control_border-radius': ['control.borderRadius', 'var(--border-radius)'],
    'control_bg-color': ['control.bgColor', 'var(--color-white)'],
    'control_bg-color--active': ['control.bgColorActive', 'var(--color-primary)'],
    'control_bg-image': ({ control }) =>
        control.bgImage ?? control.type === ControlType.CHECKBOX ? 'var(--checkbox-icon)' : 'var(--radio-icon)'
};
