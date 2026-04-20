import { NumberFormat } from './constants';

export const mixinGauge = {
    methods: {
        getValueByFormat(value, limit, format, percentFormat) {
            switch (format) {
                case NumberFormat.LIMIT:
                    return Math.round(value);
                case NumberFormat.SEGMENT:
                case NumberFormat.SEGMENT_DATA:
                    return `${Math.round(value)} / ${Math.round(limit)}`;
                case NumberFormat.DELTA:
                    return Math.max(0, limit - value);
                case NumberFormat.PERCENT:
                    return (Math.round((value / limit) * 100) || 0).toFixed(percentFormat);
                default:
                    return 0;
            }
        }
    }
};
