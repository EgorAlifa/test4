export const DeviationType = Object.freeze({
    ABS: 'absolute',
    PCT: 'percent'
});

export const DeviationFormula = Object.freeze({
    [DeviationType.ABS]: (a, b) => Number(a) - Number(b),
    [DeviationType.PCT]: (a, b) => DeviationFormula[DeviationType.ABS](a, b) / Number(b)
});
