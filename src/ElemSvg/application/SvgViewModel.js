import { reactive } from '@goodt-common/utils';
import { BaseViewModel } from '@goodt-common/layers';
import { isEmpty } from 'lodash';
import { SvgUtils } from '../utils/SvgUtils';
import { SVG_STYLES } from '../config';

export class SvgViewModel extends BaseViewModel {
    svgElement;

    svgUtils;

    widget;

    _state = reactive({
        selectedNode: null,
        textNodes: [],
        svgNodes: []
    });

    constructor({ svgElement, widget }) {
        super();
        this.svgElement = svgElement;
        this.svgUtils = new SvgUtils(svgElement);
        this.widget = widget;
        this.extendContentWithStyles();
    }

    get selectedNode() {
        return this._state.selectedNode;
    }

    get textNodes() {
        return this._state.textNodes;
    }

    setWidget(widget) {
        this.widget = widget;
    }

    extendContentWithStyles() {
        const styleTag = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleTag.textContent = SVG_STYLES;
        this.svgElement.appendChild(styleTag);
    }

    buildNodeOptions() {
        const svg = this.svgElement;
        return [...svg.children]
            .flatMap((node) => {
                if (node.children.length > 0) {
                    return this.getChildrenIds(node);
                }

                return node.id;
            })
            .filter((id) => id !== '')
            .map((id, idx) => ({ label: id, value: idx }));
    }

    getChildrenIds(parentNode) {
        return [
            parentNode.id,
            [...parentNode.children].flatMap((node) => {
                if (node.children.length > 0) {
                    return this.getChildrenIds(node);
                }

                return node.id;
            })
        ].flat();
    }

    resolveSvgElementSize(svgElement) {
        const boxSize = svgElement.getBBox();
        return {
            width: Math.max(boxSize.width ?? 0, svgElement.getComputedTextLength() ?? 0),
            height: boxSize.height ?? 0
        };
    }

    updateSvg(result) {
        this._state.selectedNode = null;
        if (this.svgElement == null) {
            return;
        }

        this._state.textNodes.forEach((node) => {
            node.remove();
        });

        // reset event listeners
        this._state.svgNodes.forEach((node) => {
            node.replaceWith(node.cloneNode(true));
        });

        const { rows } = result;
        const {
            nodes,
            fields: { metricId },
            labels
        } = this.widget.props;
        const svg = this.svgElement;
        this._state.svgNodes = this.buildDefaultNodes({ svg, rows });
        this._state.textNodes = [];
        const filteredNodes = nodes.filter(({ id }) => id !== '');
        this.updateNodes({ nodes: filteredNodes, rows, labels, metricId, svg });
    }

    updateNodes({ nodes, rows, labels, metricId, svg }) {
        const { cardMode, factorPanel } = this.widget.props;
        nodes.forEach(({ id, isVisible }) => {
            const element = svg.getElementById(id);
            if (element == null || element.style == null) {
                return;
            }

            if (!isVisible) {
                element.style.display = 'none';
                return;
            }

            element.style.display = 'inherit';
            const row = rows.find(({ [metricId]: rowId }) => rowId === element.getAttribute('data-id'));
            if (row == null) {
                const {
                    hoverSettings: { shouldHoverAllElements, shouldUseSettings },
                    selectSettings: { isEnabled, shouldSelectAllElements },
                    colorSettings: { defaultColor, defaultStroke }
                } = this.widget.props;
                element.style.cursor =
                    (shouldUseSettings && shouldHoverAllElements) || (isEnabled && shouldSelectAllElements)
                        ? 'pointer'
                        : 'default';

                if (isEmpty(defaultColor) === false) {
                    element.style.fill = this.svgUtils.resolveNodeStyle({ value: defaultColor });
                }

                if (isEmpty(defaultStroke) === false) {
                    element.style.stroke = this.svgUtils.resolveNodeStyle({ value: defaultStroke });
                }

                element.setAttribute('data-style', element.style.cssText);
                return;
            }

            element.style.cursor = 'pointer';
            const isFactorPanel = factorPanel.enabled && factorPanel.nodeIds.includes(element.getAttribute('data-id'));
            if (isFactorPanel) {
                this._state.textNodes.push(this.createFactorPanelNode({ element, row, rows, metricId, svg }));
            } else if (cardMode) {
                this.applyCardHighlight({ element, row });
                this._state.textNodes.push(this.createValueCardNode({ element, row, svg }));
            } else if (labels.length > 0) {
                const { shouldDrawForeignObject } = this.widget.props;
                this._state.textNodes.push(
                    shouldDrawForeignObject
                        ? this.createForeignObjectNode({ element, row, svg })
                        : this.createTextNode({ element, row, svg })
                );
            }

            element.setAttribute('data-style', element.style.cssText);
        });
    }

    // Setting fill/stroke via CSS (element.style...) on a wrapping <g> only
    // visually works if none of its descendant shapes carry their own fill/
    // stroke presentation attribute - a plain SVG attribute on a shape counts
    // as that shape's own "specified value" and blocks inheritance from an
    // ancestor's style, even one set at runtime via JS. Any card box whose
    // <rect> has an explicit fill="..."/stroke="..." (ours does, and so do
    // plenty of hand-authored/exported SVGs) would silently ignore this -
    // the color computed here would be correct in the DOM but invisible on
    // screen. Setting it on the shape descendants too sidesteps that: an
    // inline style always wins over that same element's own attribute.
    applyPaintStyle({ element, fill, stroke }) {
        element.style.fill = fill;
        element.style.stroke = stroke;
        element.querySelectorAll('rect, path, circle, ellipse, polygon, polyline, line').forEach((shape) => {
            shape.style.fill = fill;
            shape.style.stroke = stroke;
        });
    }

    // ── Value-card mode ──────────────────────────────────────────────
    // Applies the highlighted vs. normal background/border to the bound
    // shape itself, based on cardFields.highlightField on the matched row.
    applyCardHighlight({ element, row }) {
        const { cardFields, cardStyle } = this.widget.props;
        const isHighlighted = cardFields.highlightField != null && Boolean(row[cardFields.highlightField]);
        this.applyPaintStyle({
            element,
            fill: isHighlighted ? cardStyle.highlightBg : cardStyle.bg,
            stroke: isHighlighted ? cardStyle.highlightBorder : cardStyle.border
        });
    }

    // Value/plan/diff resolution shared by rendering and (later) tooltip use.
    resolveCardDiff({ row, cardFields }) {
        const rawValue = cardFields.valueField != null ? row[cardFields.valueField] : null;
        const rawPlan = cardFields.planField != null ? row[cardFields.planField] : null;
        const value = Number(rawValue);
        const plan = Number(rawPlan);
        const hasValue = rawValue != null && !Number.isNaN(value);
        const hasPlan = rawPlan != null && !Number.isNaN(plan);
        const diff = hasValue && hasPlan ? value - plan : null;

        let percent = null;
        if (cardFields.percentField != null && row[cardFields.percentField] != null) {
            percent = Number(row[cardFields.percentField]);
        } else if (diff != null && plan !== 0) {
            percent = Math.abs(diff / plan);
        }

        return { value, plan, hasValue, hasPlan, diff, percent };
    }

    // Arrow glyph + "is this a good deviation" flag, honoring per-row
    // positiveDirectionField (mirrors the source model's positive_log: which
    // sign of the diff should read as green vs. red).
    resolveCardDirection({ diff, row, cardFields }) {
        const rawDirection = cardFields.positiveDirectionField != null ? row[cardFields.positiveDirectionField] : null;
        const isUpGood = rawDirection == null || rawDirection === 'up' || rawDirection === '≥ 0' || rawDirection === true;

        if (diff == null) {
            return { arrow: '', isGood: true };
        }
        if (diff === 0) {
            return { arrow: isUpGood ? '▲' : '▼', isGood: true };
        }
        const isUp = diff > 0;
        return { arrow: isUp ? '▲' : '▼', isGood: isUp === isUpGood };
    }

    escapeXml(value) {
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    createValueCardNode({ element, row, svg }) {
        const { cardFields, cardStyle } = this.widget.props;
        const { width, x, y } = element.getBBox();
        const pad = 16;

        const title1 = cardFields.titleField != null ? row[cardFields.titleField] : '';
        const title2 = cardFields.titleField2 != null ? row[cardFields.titleField2] : null;
        const hasTitle2 = title2 != null && String(title2).trim() !== '';

        const { hasValue, plan, hasPlan, diff, percent } = this.resolveCardDiff({ row, cardFields });
        const { arrow, isGood } = this.resolveCardDirection({ diff, row, cardFields });

        // Display-override fields take precedence over the computed/formatted text —
        // useful when rows need different decimal precision (e.g. "716" vs "22,00" vs
        // "5,0") that a single widget-wide number format can't express at once.
        const valueDisplay = cardFields.valueDisplayField != null ? row[cardFields.valueDisplayField] : null;
        const planDisplay = cardFields.planDisplayField != null ? row[cardFields.planDisplayField] : null;
        const percentDisplay = cardFields.percentDisplayField != null ? row[cardFields.percentDisplayField] : null;

        const valueText =
            valueDisplay != null
                ? String(valueDisplay)
                : hasValue
                ? this.svgUtils.formatData({
                      value: row[cardFields.valueField],
                      format: cardFields.valueFormat,
                      shouldSplitWords: false
                  })
                : '—';
        const planText =
            planDisplay != null
                ? String(planDisplay)
                : hasPlan
                ? this.svgUtils.formatData({
                      value: plan,
                      format: cardFields.planFormat || cardFields.valueFormat,
                      shouldSplitWords: false
                  })
                : '—';
        const percentText =
            percentDisplay != null
                ? String(percentDisplay)
                : percent != null
                ? `${this.svgUtils.formatData({
                      value: percent * 100,
                      format: cardFields.percentFormat,
                      shouldSplitWords: false
                  })}%`
                : '';

        const titleY1 = pad + 11;
        const titleY2 = pad + 33;
        const valueY = hasTitle2 ? pad + 70 : pad + 48;
        const planY = valueY + 24;

        const NS = 'http://www.w3.org/2000/svg';
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('id', element.getAttribute('data-id'));
        g.setAttribute('transform', `translate(${x}, ${y})`);
        g.style.pointerEvents = 'none';

        const titleNode = document.createElementNS(NS, 'text');
        titleNode.setAttribute('font-family', cardStyle.fontFamily);
        titleNode.setAttribute('font-size', cardStyle.titleFontSize);
        titleNode.setAttribute('fill', cardStyle.titleColor);
        titleNode.setAttribute('xml:space', 'preserve');
        let titleHtml = `<tspan x="${pad}" y="${titleY1}">${this.escapeXml(title1 ?? '')}</tspan>`;
        if (hasTitle2) {
            titleHtml += `<tspan x="${pad}" y="${titleY2}">${this.escapeXml(title2)}</tspan>`;
        }
        titleNode.innerHTML = titleHtml;
        g.appendChild(titleNode);

        const valueNode = document.createElementNS(NS, 'text');
        valueNode.setAttribute('x', pad);
        valueNode.setAttribute('y', valueY);
        valueNode.setAttribute('font-family', cardStyle.fontFamily);
        valueNode.setAttribute('font-size', cardStyle.valueFontSize);
        valueNode.setAttribute('font-weight', '700');
        valueNode.setAttribute('fill', cardStyle.valueColor);
        valueNode.textContent = valueText;
        g.appendChild(valueNode);

        if (percentText !== '') {
            const percentNode = document.createElementNS(NS, 'text');
            percentNode.setAttribute('x', width - pad);
            percentNode.setAttribute('y', valueY);
            percentNode.setAttribute('text-anchor', 'end');
            percentNode.setAttribute('font-family', cardStyle.fontFamily);
            percentNode.setAttribute('font-size', cardStyle.percentFontSize);
            percentNode.setAttribute('font-weight', '700');
            percentNode.setAttribute('fill', isGood ? cardStyle.positiveColor : cardStyle.negativeColor);
            percentNode.textContent = `${arrow}${percentText}`;
            g.appendChild(percentNode);
        }

        if (hasPlan) {
            const planNode = document.createElementNS(NS, 'text');
            planNode.setAttribute('x', pad);
            planNode.setAttribute('y', planY);
            planNode.setAttribute('font-family', cardStyle.fontFamily);
            planNode.setAttribute('font-size', cardStyle.planFontSize);
            planNode.setAttribute('xml:space', 'preserve');
            planNode.innerHTML =
                `<tspan fill="${cardStyle.planLabelColor}">${this.escapeXml(cardFields.planLabel ?? 'План ')}</tspan>` +
                `<tspan fill="${cardStyle.planValueColor}">${this.escapeXml(planText)}</tspan>`;
            g.appendChild(planNode);
        }

        svg.appendChild(g);
        return g;
    }

    // ── Factor-breakdown panel mode ──────────────────────────────────
    // Renders a variable-length list of "deviation factor" lines (bold /
    // section / item rows) next to a total value, all pulled from the
    // dataset instead of baked into the SVG - so a period/filter change
    // that alters how many factors there are (or their values) is
    // reflected automatically, same as cardMode. The matched row (found
    // via fields.metricId, same as any other node) supplies the total;
    // the individual lines are OTHER rows sharing factorPanel.groupField
    // with that row's own id.
    createFactorPanelNode({ element, row, rows, metricId, svg }) {
        const { factorPanel, cardStyle } = this.widget.props;
        const { x, y, width } = element.getBBox();
        const pad = 16;

        const totalValue = factorPanel.totalField != null ? row[factorPanel.totalField] : null;
        const totalText =
            totalValue != null
                ? this.svgUtils.formatData({ value: totalValue, format: factorPanel.totalFormat, shouldSplitWords: false })
                : '—';

        const ownId = row[metricId];
        const factorRows =
            factorPanel.groupField != null ? rows.filter((r) => r[factorPanel.groupField] === ownId) : [];
        if (factorPanel.orderField != null) {
            factorRows.sort((a, b) => Number(a[factorPanel.orderField]) - Number(b[factorPanel.orderField]));
        }

        const NS = 'http://www.w3.org/2000/svg';
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('id', element.getAttribute('data-id'));
        g.setAttribute('transform', `translate(${x}, ${y})`);
        g.style.pointerEvents = 'none';

        const totalLabelNode = document.createElementNS(NS, 'text');
        totalLabelNode.setAttribute('x', pad);
        totalLabelNode.setAttribute('y', pad + 11);
        totalLabelNode.setAttribute('font-family', cardStyle.fontFamily);
        totalLabelNode.setAttribute('font-size', cardStyle.titleFontSize);
        totalLabelNode.setAttribute('fill', cardStyle.titleColor);
        totalLabelNode.textContent = factorPanel.totalLabel ?? '';
        g.appendChild(totalLabelNode);

        const totalValueNode = document.createElementNS(NS, 'text');
        totalValueNode.setAttribute('x', pad);
        totalValueNode.setAttribute('y', pad + 46);
        totalValueNode.setAttribute('font-family', cardStyle.fontFamily);
        totalValueNode.setAttribute('font-size', cardStyle.valueFontSize);
        totalValueNode.setAttribute('font-weight', '700');
        totalValueNode.setAttribute('fill', cardStyle.valueColor);
        totalValueNode.textContent = totalText;
        g.appendChild(totalValueNode);

        let cy = pad + 80;
        const lineGap = { bold: 30, section: 26, itemLabel: 20, itemValue: 30 };
        factorRows.forEach((factorRow) => {
            const type = factorPanel.typeField != null ? factorRow[factorPanel.typeField] : 'item';
            const label = factorPanel.labelField != null ? factorRow[factorPanel.labelField] : '';

            if (type === 'bold') {
                const node = document.createElementNS(NS, 'text');
                node.setAttribute('x', pad);
                node.setAttribute('y', cy);
                node.setAttribute('font-family', cardStyle.fontFamily);
                node.setAttribute('font-size', '14px');
                node.setAttribute('font-weight', '700');
                node.setAttribute('fill', cardStyle.valueColor);
                node.textContent = label;
                g.appendChild(node);
                cy += lineGap.bold;
                return;
            }

            if (type === 'section') {
                const node = document.createElementNS(NS, 'text');
                node.setAttribute('x', pad);
                node.setAttribute('y', cy);
                node.setAttribute('font-family', cardStyle.fontFamily);
                node.setAttribute('font-size', '13px');
                node.setAttribute('fill', cardStyle.planValueColor);
                node.textContent = label;
                g.appendChild(node);
                cy += lineGap.section;
                return;
            }

            // 'item'
            const value = factorPanel.valueField != null ? factorRow[factorPanel.valueField] : null;
            const valueText =
                value != null ? this.svgUtils.formatData({ value, format: factorPanel.totalFormat, shouldSplitWords: false }) : '—';

            const labelNode = document.createElementNS(NS, 'text');
            labelNode.setAttribute('x', pad);
            labelNode.setAttribute('y', cy);
            labelNode.setAttribute('font-family', cardStyle.fontFamily);
            labelNode.setAttribute('font-size', '13px');
            labelNode.setAttribute('fill', cardStyle.titleColor);
            labelNode.textContent = label;
            g.appendChild(labelNode);
            cy += lineGap.itemLabel;

            const valueNode = document.createElementNS(NS, 'text');
            valueNode.setAttribute('x', pad);
            valueNode.setAttribute('y', cy);
            valueNode.setAttribute('font-family', cardStyle.fontFamily);
            valueNode.setAttribute('font-size', '15px');
            valueNode.setAttribute('font-weight', '700');
            valueNode.setAttribute('fill', cardStyle.valueColor);
            valueNode.textContent = valueText;
            g.appendChild(valueNode);
            cy += lineGap.itemValue;
        });

        // The panel's own shape was drawn at a fixed height in the static SVG -
        // resize it here so it grows/shrinks with however many factor lines
        // this period's data actually has, instead of clipping or leaving a gap.
        const rect = element.querySelector('rect');
        if (rect != null) {
            rect.setAttribute('height', String(cy + pad - 4));
        }

        svg.appendChild(g);
        return g;
    }

    resolveLabelsSettings({ element }) {
        const { labelOffsetY, labelOffsetX, labelOffsetRight, labelsSettings, offsetBetweenLabels } = this.widget.props;
        const foundLabel = labelsSettings.find(({ id }) => id === element.id);
        if (foundLabel?.useCustomLabelSettings) {
            return foundLabel;
        }

        return { labelOffsetY, labelOffsetX, labelOffsetRight, offsetBetweenLabels };
    }

    createTextNode({ element, row, svg }) {
        const { labels } = this.widget.props;
        const { labelOffsetY, labelOffsetX, labelOffsetRight, offsetBetweenLabels } = this.resolveLabelsSettings({
            element
        });
        const { width, height, x: xCoordinate, y: yCoordinate } = element.getBBox();
        const offsetX = xCoordinate + width * 0.01 * labelOffsetX;
        let offsetY = yCoordinate + height * 0.01 * labelOffsetY;

        if (typeof window !== 'undefined') {
            const isFirefoxBrowser = window.navigator.userAgent.toLowerCase().includes('firefox');

            if (isFirefoxBrowser) {
                offsetY += 20;
            }
        }

        const textNode = this.svgUtils.buildTextNode({
            y: offsetY,
            x: offsetX
        });
        textNode.setAttribute('id', element.getAttribute('data-id'));
        textNode.innerHTML = '<tspan id="PROCESSING"></tspan >';
        svg.appendChild(textNode);
        const titles = this.svgUtils.buildTitles({ labels, row, isOnlyTitleText: false, shouldSplitWords: true });
        let isFulled = false;
        let isFirstLine = true; // for offset by the first line
        let hasAddedPoints = false;
        let prevTitles = textNode.innerHTML;
        let isFirstLineInLabel = true; // for offset between labels
        titles.forEach(({ words, prefix, postfix, style }) => {
            if (isFulled) {
                return;
            }

            isFirstLineInLabel = true;
            let line = '';
            words.forEach((word, idx) => {
                if (isFulled) {
                    return;
                }

                const { tempTSpanWidth, testLine } = this.buildTextInfo({
                    line,
                    style,
                    xCoordinate,
                    postfix,
                    prefix,
                    idx,
                    word,
                    words,
                    offsetBetweenLabels
                });

                if (this.resolveSvgElementSize(textNode).height > height) {
                    isFulled = true;
                    hasAddedPoints = true;
                    textNode.innerHTML = prevTitles;
                    textNode.innerHTML += this.svgUtils.buildTreeDots({ style });
                    isFirstLine = false;
                    isFirstLineInLabel = false;
                    return;
                }

                if (tempTSpanWidth > width - (width / 100) * labelOffsetRight && idx > 0) {
                    if (line.trim() !== '') {
                        textNode.innerHTML += this.svgUtils.buildTitleTSpan({
                            text: line,
                            x: offsetX,
                            style,
                            isFirstLine,
                            isFirstLineInLabel,
                            offsetBetweenLabels
                        });
                    }
                    line = `${word} `;
                    isFirstLine = false;
                    isFirstLineInLabel = false;
                } else {
                    line = `${testLine} `;
                }

                if (idx === words.length - 1) {
                    textNode.innerHTML += this.svgUtils.buildTitleTSpan({
                        text:
                            postfix.text.trim() !== '' && line.trim() === postfix.text.trim()
                                ? this.svgUtils.buildTSpan({ text: postfix.text, style: postfix.style })
                                : line,
                        x: offsetX,
                        style,
                        isFirstLine,
                        isFirstLineInLabel,
                        offsetBetweenLabels
                    });

                    isFirstLine = false;
                    isFirstLineInLabel = false;
                }
                isFulled = this.resolveSvgElementSize(textNode).height > height;
                if (!isFulled) {
                    prevTitles = textNode.innerHTML;
                }
            });

            isFulled = this.resolveSvgElementSize(textNode).height > height;
            if (!hasAddedPoints && isFulled) {
                textNode.innerHTML = prevTitles;
                textNode.innerHTML += this.svgUtils.buildTreeDots({ style });
                hasAddedPoints = true;
                isFirstLine = false;
            }
        });

        this.svgElement.getElementById('PROCESSING')?.remove();
        return textNode;
    }

    createForeignObjectNode({ element, row, svg }) {
        const { labels, limitSettings } = this.widget.props;
        const { offsetBetweenLabels, labelOffsetRight, labelOffsetX, labelOffsetY } = this.resolveLabelsSettings({
            element
        });
        const divNode = this.svgUtils.buildDivNode({
            element,
            lineClamp: this.svgUtils.resolveLineClamp({ element, limitSettings }),
            labels,
            labelOffsetRight,
            labelOffsetX,
            labelOffsetY
        });

        const titles = this.svgUtils.buildTitles({ labels, row, isOnlyTitleText: true, shouldSplitWords: false });
        divNode.innerHTML = titles.reduce(
            (acc, { words, prefix, postfix, style }, idx) =>
                words === ''
                    ? acc
                    : acc +
                      this.svgUtils.buildDiv({
                          words,
                          style,
                          prefix,
                          postfix,
                          offsetBetweenLabels,
                          isLastLabel: titles.length - 1 === idx
                      }),
            ''
        );

        const foreignObject = this.svgUtils.buildForeignObjectNode(element);
        foreignObject.appendChild(divNode);
        svg.appendChild(foreignObject);

        return foreignObject;
    }

    buildDefaultNodes({ svg, rows }) {
        const { nodes } = this.widget.props;

        const svgNodes = [...svg.children].flatMap((node) => {
            if (node.children.length > 0) {
                return [node, ...this.getChildren(node)].flat();
            }

            return node;
        });
        return svgNodes
            .filter((node) => node.id != null && node.id !== '' && node.style != null)
            .map((node) => {
                // eslint-disable-next-line no-restricted-syntax
                const currentNode = nodes.find(({ id }) => id === node.id);
                if (currentNode == null) {
                    return node;
                }

                if (!currentNode.isVisible) {
                    return null;
                }

                const { id, newId, shouldChangeId } = currentNode;
                node.setAttribute('data-id', shouldChangeId ? newId : id);
                this.resolveNodeStyles({ node, rows });
                node.setAttribute('data-style', node.style.cssText);
                return node;
            })
            .filter(Boolean);
    }

    buildTextInfo({ line, word, postfix, prefix, idx, words, style, xCoordinate, offsetBetweenLabels }) {
        const tempTSpan = this.svgElement.getElementById('PROCESSING');
        const testLine = this.svgUtils.buildTestLine({
            line,
            word,
            postfix,
            idx,
            prefix,
            wordsLength: words.length
        });

        tempTSpan.innerHTML = this.svgUtils.buildTitleTSpan({
            text: `${testLine} ${this.svgUtils.buildTreeDots({ style })}`,
            style,
            isFirstLine: true,
            isFirstLineInLabel: false,
            x: xCoordinate,
            offsetBetweenLabels
        });

        const { width: tempTSpanWidth, height: tempTSpanHeight } = this.resolveSvgElementSize(tempTSpan);

        return { testLine, tempTSpanWidth, tempTSpanHeight };
    }

    setNodeStyleBySettings({ colorNodes, node }) {
        const colorNode = colorNodes.find(({ id: rowId }) => rowId === node.id);
        if (colorNode == null) {
            return;
        }

        const { fill } = colorNode;
        if (fill != null) {
            node.style.fill = this.svgUtils.resolveNodeStyle({ value: fill });
        }
    }

    setNodeStyleByRules({ node, rules, rows }) {
        const {
            fields: { metricColor, metricId }
        } = this.widget.props;
        const foundRow = rows.find(({ [metricId]: id }) => String(node.getAttribute('data-id')) === String(id));
        if (foundRow == null) {
            return;
        }

        const { [metricColor]: value } = foundRow;
        const foundRule = rules.find(({ from, to }) => Number(value) >= Number(from) && Number(value) < Number(to));
        if (foundRule == null) {
            node.style.fill = '';
            node.style.stroke = '';
            return;
        }

        node.style.fill = foundRule.fill;
        node.style.stroke = foundRule.stroke;
    }

    getChildren(parentNode) {
        // spread for specific svg elements
        return [...parentNode.children].flatMap((node) => {
            if (node.children.length > 0) {
                return [node, ...this.getChildren(node)].flat();
            }

            return node;
        });
    }

    onElementEnter({ element, settings }) {
        const { fill, stroke, strokeWidth, additionalFill, additionalStroke } = settings;
        if (isEmpty(additionalFill) === false && isEmpty(additionalFill) === false) {
            this._state.svgNodes.forEach((node) => {
                if (isEmpty(additionalFill) === false) {
                    node.style.fill = additionalFill;
                }

                if (isEmpty(additionalStroke) === false) {
                    node.style.stroke = additionalStroke;
                }
            });
        }

        element.style.fill = fill;
        element.style.stroke = stroke;
        element.style.strokeWidth = strokeWidth;
    }

    onElementLeave() {
        this._state.svgNodes.forEach((node) => {
            node.style.cssText = node.getAttribute('data-style');
        });
    }

    resetSelectedNode() {
        this._state.svgNodes.forEach((node) => {
            node.style.opacity = 1;
        });
        this._state.textNodes.forEach((textNode) => {
            textNode.style.opacity = 1;
        });
        this._state.selectedNode = null;
    }

    selectNewNode({ element, settings }) {
        const { blockOpacity, textOpacity } = settings;
        this._state.selectedNode = element.id;
        this._state.svgNodes.forEach((node) => {
            node.style.opacity = blockOpacity;
        });
        this._state.textNodes.forEach((textNode) => {
            textNode.style.opacity = textOpacity;
        });

        element.style.opacity = 1;
        const elementId = element.getAttribute('data-id');
        const textNode = this._state.textNodes.find((node) => node.id === elementId);
        if (textNode != null) {
            textNode.style.opacity = 1;
        }
    }

    resolveNodeStyles({ node, rows }) {
        const {
            generalSettings: { strokeWidth, stroke, boxShadow }
        } = this.widget.props;
        node.style.stroke = this.svgUtils.resolveNodeStyle({ value: stroke });
        node.style.strokeWidth = this.svgUtils.resolveNodeStyle({ value: strokeWidth, defaultValue: 0 });
        node.style.filter = this.svgUtils.resolveNodeStyle({
            prefix: 'drop-shadow(',
            postfix: ')',
            value: boxShadow
        });
        node.style.transition = 'all 0.5s';
        const {
            colorSettings: { nodes: colorNodes, shouldUseRules, rules },
            fields: { metricColor }
        } = this.widget.props;
        if (!shouldUseRules || metricColor == null) {
            this.setNodeStyleBySettings({ colorNodes, node });
            return;
        }

        this.setNodeStyleByRules({ node, rules, rows });
    }
}
