export const TypeDataOptions = [
    {
        value: 'dimension',
        label: 'Измерение'
    },
    {
        value: 'metric',
        label: 'Метрика'
    }
];
export const MetricPositionOptions = [
    {
        value: 'left',
        label: 'Слева'
    },
    {
        value: 'center',
        label: 'По центру'
    },
    {
        value: 'right',
        label: 'Справа'
    }
];
export const BenchmarkPositionOptions = [
    {
        value: 'left',
        label: 'Слева'
    },
    {
        value: 'top',
        label: 'Сверху'
    },
    {
        value: 'right',
        label: 'Справа'
    },
    {
        value: 'bottom',
        label: 'Снизу'
    }
];
export const FormatOptions = [
    {
        value: 'n',
        label: 'Без формата'
    },
    {
        value: '0',
        label: '1000'
    },
    {
        value: '1',
        label: '1000,1'
    },
    {
        value: '2',
        label: '1000,12'
    },
    {
        value: '0%',
        label: '12%'
    },
    {
        value: '1%',
        label: '12,3%'
    },
    {
        value: '2%',
        label: '12,34%'
    }
];
export const DigitCapacityOptions = [
    {
        value: 'n',
        label: 'Без формата'
    },
    {
        value: '0',
        label: '10 000'
    },
    {
        value: '1',
        label: '10.000'
    },
    {
        value: '2',
        label: '10,000'
    }
];

export const IconPositionOptions = [
    {
        value: 'row',
        label: 'Слева'
    },
    {
        value: 'row-reverse',
        label: 'Справа'
    }
];

export const RuleDataType = {
    VALUE: 'value',
    FROM_DATASET: 'metric/dimension'
};

export const RuleDataTypeOptions = [
    { label: 'Ввод', value: RuleDataType.VALUE },
    { label: 'Метрика/измерение', value: RuleDataType.FROM_DATASET }
];

export const AbsoluteHintTemplate = () => ({
  isEnabled: false,
  positionX: 50,
  positionY: 50,
});
