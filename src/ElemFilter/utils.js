import { isEmpty } from 'lodash';

export const buildCssStyle = (styles) =>
    styles.reduce((acc, styleItem) => {
        const cssProperties = styleItem.split(':');
        const cssValue = cssProperties[1]?.trim();
        return cssValue == null ? acc : { ...acc, [cssProperties[0].trim()]: cssValue };
    }, {});

export const resolveBorderRadius = (borderRadius) => {
    if (isEmpty(borderRadius)) {
        return null;
    }
    const { topLeft, topRight, bottomRight, bottomLeft } = borderRadius;
    return [topLeft, topRight, bottomLeft, bottomRight]
        .map((side) => (Number.isNaN(parseFloat(side)) ? '0px' : side))
        .join(' ');
};

/**
 * @param {string[]} values
 * @return {string[]}
 */
export const composeSearchFilterLikeValue = (values) =>
    values.flatMap((value) => [
        `%${value}%`,
        `%${value
            .split(' ')
            .map((item) => item[0].toUpperCase() + item.slice(1).toLowerCase())
            .join(' ')}%`
    ]);

export const resolvePreviousSelected = ({
    isChangeCategoryResetValues,
    findDimensionList,
    multiSelectValues,
    newDimensionOptions
}) => {
    if (isChangeCategoryResetValues) {
        return multiSelectValues.reduce((acc, selectedValue) => {
            const actualOption = newDimensionOptions.find(({ name: optionName }) => optionName === selectedValue.name);
            if (actualOption == null) {
                return acc;
            }
            const currentSelectValue = {
                ...selectedValue,
                visible: true
            };

            return [...acc, currentSelectValue];
        }, []);
    }

    return multiSelectValues.map((item) => {
        // prettier-ignore
        const visible = findDimensionList.length === 0
            ? true
            : findDimensionList.some((part) => item.name.toLowerCase().includes(part));
        return {
            ...item,
            visible
        };
    });
};

export const normalizeEntityProp = (prop, entities) => {
    if (typeof prop === 'string') {
        const entityIndex = entities.indexOf(prop);
        return entityIndex === -1 ? 0 : entityIndex;
    }
    if (typeof prop === 'number') {
        const isEntityExist = entities[prop] != null;
        return isEntityExist ? prop : 0;
    }
    return prop;
};

export const moveSelectedDimensionSort = (a, b) => {
    if ((a.selected && b.selected) || (a.disabled && b.disabled)) {
        return a.index > b.index ? 1 : -1;
    }
    if (a.selected && b.selected === false) {
        return -1;
    }
    if (a.disabled && b.disabled === false) {
        return 1;
    }
    if (a.selected === false && b.selected) {
        return 1;
    }
    if (a.disabled === false && b.disabled) {
        return -1;
    }
    return a.index > b.index ? 1 : -1;
};

export const defaultDimensionSort = (a, b) => {
    if (a.disabled && b.disabled) {
        return a.index > b.index ? 1 : -1;
    }

    if (a.disabled && b.disabled === false) {
        return 1;
    }

    if (a.disabled === false && b.disabled) {
        return -1;
    }
    return a.index > b.index ? 1 : -1;
};
