import { Managers } from '@goodt-wcore/core';
import { ColumnParamStyleTypes as StyleTypes, ColumnParamStyleValueTypes as StyleValueTypes } from './constants';

const { ConstManager } = Managers;

const $c = (constantName) => {
    if (typeof constantName !== 'string') {
        return constantName;
    }
    const manager = ConstManager.instance;
    return constantName.replace(/(%[^%]+%)/g, (match) => manager.getConstValue(match));
};

export function cssStrToObj(str) {
    if (str == null) {
        return {};
    }
    return str.split(';').reduce((obj, style) => {
        const [name, val] = style.split(':').map((el) => el.trim());
        if (name != null && val != null) {
            // пытаемся заменить константу
            obj[name] = $c(val);
        }
        return obj;
    }, {});
}

export const resolveStyle = (prop, deprecatedProp, propName) => prop[propName] || cssStrToObj(deprecatedProp)[propName];

export const buildIconCssVariables = ({ size, position, color, colorHover }) => ({
    'icon_font-size': size,
    icon_color: color,
    'icon--hover_color': colorHover,
    icon_order: position
});

export const buildQueryFromUrlParam = (urlParamName, urlParamValue) => {
    if (urlParamName.name != null && urlParamValue.name != null) {
        return { [urlParamName.name]: urlParamValue.format() };
    }
    return {};
};

export const shouldUseCssRule = ({ type, valueType, value, comparedValueType, comparedValue }, row, valueReplaced) => {
    const styleTypeInfo = StyleTypes[type];
    // нет типа?
    if (styleTypeInfo == null) {
        return false;
    }
    // обратная совместимость с уже настроенными виджетами
    // у которых в мета-данных стилей нет 'valueType'
    const styleValueTypeInfo = StyleValueTypes[valueType] ?? null;
    const styleComparedValueTypeInfo = StyleValueTypes[comparedValueType] ?? null;
    // в зависимости от типа, вызываем обработчик преобразования value
    const styleValue = styleValueTypeInfo?.handler(value, row) ?? value;
    let styleComparedValue = styleComparedValueTypeInfo?.handler(comparedValue, row) ?? comparedValue;
    styleComparedValue = styleComparedValue !== '' ? styleComparedValue : valueReplaced;

    return styleTypeInfo.handler(styleComparedValue, styleValue);
};
