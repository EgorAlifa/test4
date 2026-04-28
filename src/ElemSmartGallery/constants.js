/* eslint-disable eqeqeq */
/* eslint-disable id-length */
/* place constant values, magic number semantic explanations here */

export const DEFAULT_SOURCE_LIMIT = 1;

export const DEFAULT_SLOT_NAME = 'default';

export const Metric = {
    NAME: 'name'
};

export const MetricMeta = {
    [Metric.NAME]: { label: 'имя' }
};

export const SlotConditionType = {
    INPUT: 'i',
    STORE: 's',
    METRIC: 'm'
};

export const SlotConditionTypeMeta = {
    [SlotConditionType.INPUT]: { label: 'ввод', icon: 'mdi-format-text' },
    [SlotConditionType.STORE]: { label: 'ключ хранилища', icon: 'mdi-variable' },
    [SlotConditionType.METRIC]: { label: 'ключ из метрики', icon: 'mdi-size-m' }
};

export const SlotConditionOperator = {
    EQ: '=',
    NEQ: '!=',
    GT: '>',
    GTE: '>=',
    LT: '<',
    LTE: '<=',
    LIKE: 'lk',
    IS: 'is',
    ISN: 'isn',
    IN: 'in',
    NOT_IN: 'not in'
};

export const SlotConditionOperatorMeta = {
    [SlotConditionOperator.EQ]: { label: '=', resolve: (a, b) => Number(a) == Number(b) },
    [SlotConditionOperator.NEQ]: { label: '!=', resolve: (a, b) => Number(a) != Number(b) },
    [SlotConditionOperator.GT]: { label: '>', resolve: (a, b) => Number(a) > Number(b) },
    [SlotConditionOperator.GTE]: { label: '>=', resolve: (a, b) => Number(a) >= Number(b) },
    [SlotConditionOperator.LT]: { label: '<', resolve: (a, b) => Number(a) < Number(b) },
    [SlotConditionOperator.LTE]: { label: '<=', resolve: (a, b) => Number(a) <= Number(b) },
    [SlotConditionOperator.LIKE]: { label: 'like', resolve: (a, b) => String(a).includes(String(b)) },
    [SlotConditionOperator.IS]: { label: 'is null', resolve: (a) => a === null },
    [SlotConditionOperator.ISN]: { label: 'is not null', resolve: (a) => a !== null },
    [SlotConditionOperator.IN]: {
        label: 'in',
        resolve: (a, b) => {
            if (b == null) {
                return false;
            }

            const items = Array.isArray(b) ? b : b.split(',').map((item) => item.trim());
            return items.map(String).includes(String(a));
        }
    },
    [SlotConditionOperator.NOT_IN]: {
        label: 'not in',
        resolve: (a, b) => {
            if (b == null) {
                return false;
            }

            const items = Array.isArray(b) ? b : b.split(',').map((item) => item.trim());
            return !items.map(String).includes(String(a));
        }
    }
};

export class SlotCondition {
    constructor({
        a = '',
        b = '',
        op = SlotConditionOperator.EQ,
        type = SlotConditionType.INPUT,
        typeForLeftField = SlotConditionType.METRIC
    } = {}) {
        this.a = a;
        this.b = b;
        this.op = op;
        this.type = type;
        this.typeForLeftField = typeForLeftField;
    }

    clone() {
        const { a, b, op, type, typeForLeftField } = this;
        return new SlotCondition({ a, b, op, type, typeForLeftField });
    }

    toString() {
        return SlotCondition.toString(this);
    }

    static fromString(str) {
        const ops = Object.values(SlotConditionOperator).join('|');
        const types = Object.values(SlotConditionType).join('|');
        const reg = new RegExp(`^'(.*?)'\\|?(${types})? (${ops}) '(.*)'\\|(${types})$`);
        const match = str.match(reg);
        if (match == null) {
            return null;
        }
        const [, a, typeForLeftField, op, b, type] = match;
        return new SlotCondition({ a, b, op, type, typeForLeftField });
    }

    static toString(condition) {
        const { a, b, op, type, typeForLeftField } = condition;
        return `'${a}'|${typeForLeftField} ${op} '${b}'|${type}`;
    }
}
