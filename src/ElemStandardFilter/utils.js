export const buildCssStyle = (styles) =>
    styles.reduce((acc, styleItem) => {
        const cssProperties = styleItem.split(':');
        const cssValue = cssProperties[1]?.trim();
        return cssValue == null ? acc : { ...acc, [cssProperties[0].trim()]: cssValue };
    }, {});
