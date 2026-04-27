import { isEmpty } from 'lodash';

export const resolveBorderRadius = (borderRadius) => {
    if (isEmpty(borderRadius)) {
        return null;
    }
    const { topLeft, topRight, bottomRight, bottomLeft } = borderRadius;
    return [topLeft, topRight, bottomLeft, bottomRight]
        .map((side) => (Number.isNaN(parseFloat(side)) ? '0px' : side))
        .join(' ');
};
