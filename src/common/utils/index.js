import { bootstrap as bootstrapNumber } from './number'

export { formatNumber, NUMBER_FORMAT_DEFAULT } from './number';

export const bootstrap = () => {
    bootstrapNumber();
};