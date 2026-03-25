import { bootstrap as bootstrapNumber } from './number'

export { formatNumber, NUMBER_FORMAT_DEFAULT } from './number';
export { DremioNormalizeMixin } from '../mixins/DremioNormalizeMixin';

export const bootstrap = () => {
    bootstrapNumber();
};