export const resolveSizeUnits = (value) => (typeof value === 'number' ? `${Math.trunc(value)}px` : value);
