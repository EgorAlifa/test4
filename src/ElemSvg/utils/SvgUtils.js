import { formatNumber } from '@goodt-widgets-insight/utils';
import { isEmpty } from 'lodash';
import { DEFAULT_OFFSET_Y } from '../constants';

export class SvgUtils {
    svgElement;

    constructor(svgElement) {
        this.svgElement = svgElement;
    }

    buildDivNode({ element, labelOffsetY, labelOffsetX, labelOffsetRight, lineClamp, labels }) {
        const divNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');

        const { width, height } = element.getBBox();

        divNode.style = `width: ${width}px;
        max-height: ${height}px;
        padding-left: ${labelOffsetX}px;
        padding-top: ${labelOffsetY}px;
        padding-right: ${labelOffsetRight}px;
        -webkit-line-clamp: ${lineClamp};
        color: ${labels[labels.length - 1]?.style?.color};
        font-size: ${labels[labels.length - 1]?.style?.fontSize}`;

        divNode.classList.add('labels');
        return divNode;
    }

    buildSubSpan({ text, style }) {
        return `<span
            style="color: ${style.color};
                font-family: ${style.fontFamily};
                font-size: ${style.fontSize};
                font-weight: ${style.fontWeight}">
            ${text}
        </span>`;
    }

    buildDiv({ words, style, prefix, postfix, offsetBetweenLabels, isLastLabel }) {
        if (words === '') {
            return '';
        }

        const prefixSpan = prefix.text !== '' ? this.buildSubSpan(prefix) : '';
        const postfixSpan = postfix.text !== '' ? this.buildSubSpan(postfix) : '';
        const lineHeight = style?.offsetY != null ? `${style?.offsetY}px` : '';
        return `<div style="color: ${style.color};
                    font-size: ${style.fontSize};
                    font-family: ${style.fontFamily};
                    font-weight: ${style.fontWeight};
                    line-height: ${lineHeight};
                    margin-bottom: ${isLastLabel ? 0 : `${offsetBetweenLabels}px`}">
                ${prefixSpan} ${words} ${postfixSpan}
            </div>`;
    }

    buildTextNode({ x, y }) {
        const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textNode.setAttributeNS(null, 'x', x);
        textNode.setAttributeNS(null, 'y', y);
        textNode.setAttributeNS(null, 'display', 'flex');

        textNode.style.cursor = 'pointer';
        return textNode;
    }

    formatData({ value, format, shouldSplitWords }) {
        const numberValue = Number(value);
        if (!Number.isNaN(numberValue) && Number.isFinite(numberValue)) {
            const formattedValue = formatNumber(numberValue, format);
            return shouldSplitWords ? formattedValue.split(' ') : formattedValue;
        }

        const formattedValue = String(value);
        return shouldSplitWords ? formattedValue.split(' ') : formattedValue;
    }

    resolveWords({ prefix, postfix, value, format, shouldSplitWords, isOnlyTitleText }) {
        return isOnlyTitleText
            ? this.formatData({ value, format, shouldSplitWords })
            : [prefix.text, ...this.formatData({ value, format, shouldSplitWords }), postfix.text];
    }

    buildTitles({ labels, row, shouldSplitWords, isOnlyTitleText }) {
        return labels.map(({ field, prefix, format, postfix, ...rest }) => {
            const isEmptyField = field == null || row[field] == null;
            const emptyWords = shouldSplitWords ? [] : '';
            return {
                ...rest,
                prefix,
                postfix,
                words: isEmptyField
                    ? emptyWords
                    : this.resolveWords({
                          prefix,
                          postfix,
                          value: row[field],
                          format,
                          shouldSplitWords,
                          isOnlyTitleText
                      })
            };
        });
    }

    buildForeignObjectNode(element) {
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');

        const { width, height, x: xCoordinate, y: yCoordinate } = element.getBBox();

        foreignObject.setAttribute('id', element.getAttribute('data-id'));
        foreignObject.setAttribute('x', xCoordinate);
        foreignObject.setAttribute('y', yCoordinate);
        foreignObject.setAttribute('style', `width: ${width}px; height: ${height}px; cursor: pointer;`);

        return foreignObject;
    }

    buildTitleTSpan({ text, style, x, isFirstLine = false, isFirstLineInLabel, offsetBetweenLabels }) {
        const offsetY = isFirstLineInLabel ? offsetBetweenLabels : style.offsetY || DEFAULT_OFFSET_Y;
        return `<tspan
                stroke="${style.color}"
                fill="${style.color}"
                font-size="${style.fontSize}"
                font-family="${style.fontFamily}"
                font-weight="${style.fontWeight}"
                x="${x}"
                dy="${isFirstLine && isFirstLineInLabel ? 0 : offsetY}"
                stroke-width="0"
                filter="unset"
                alignment-baseline="hanging">
                ${text}
            </tspan>`;
    }

    buildTSpan({ text, style }) {
        return `<tspan
                    stroke="${style.color}"
                    font-family="${style.fontFamily}"
                    font-size="${style.fontSize}"
                    font-weight="${style.fontWeight}"
                    fill="${style.color}"
                    alignment-baseline="hanging">
                    ${text}
                </tspan>`;
    }

    buildTreeDots({ style }) {
        return `<tspan
                    font-size="${style.fontSize}"
                    font-weight="${style.fontWeight}"
                    stroke="${style.color}"
                    fill="${style.color}"
                    alignment-baseline="hanging">
                    ...
                </tspan>`;
    }

    buildTestLine({ line, idx, prefix, postfix, word, wordsLength }) {
        if (idx === 0 && prefix.text !== '') {
            return `${this.buildTSpan({ text: prefix.text, style: prefix.style })} `;
        }

        if (idx === wordsLength - 1 && postfix.text !== '') {
            return `${line + this.buildTSpan({ text: postfix.text, style: postfix.style })} `;
        }

        return `${line + word} `;
    }

    resolveLineClamp({ element, limitSettings }) {
        const foundLimitSetting = limitSettings.find(({ id }) => id === element.id);
        if (foundLimitSetting?.isEnabled) {
            return foundLimitSetting.countRows;
        }

        return 'none';
    }

    resolveNodeStyle({ prefix = '', postfix = '', value, defaultValue = null }) {
        return isEmpty(value) || value === 'inherit' ? defaultValue : `${prefix}${value}${postfix}`;
    }
}
