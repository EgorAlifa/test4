import Leaflet from 'leaflet';
import { formatNumber } from '@goodt-widgets-insight/utils';

export class MapUtils {
    static createIconMaterial() {
        Leaflet.IconMaterial = {};

        Leaflet.IconMaterial.Icon = Leaflet.Icon.extend({
            options: {
                className: 'l-icon-material',
                icon: 'radio_button_checked',
                markerColor: 'white',
                iconColor: 'white',
                outlineColor: 'white',
                outlineWidth: '1',
                // eslint-disable-next-line no-restricted-syntax
                iconSize: [31, 42]
            },

            initialize(options) {
                Leaflet.Util.setOptions(this, options);
            },

            createIcon() {
                const options = Leaflet.Util.setOptions(this);
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                const icongroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');

                svg.setAttribute('width', options.iconSize[0]);
                svg.setAttribute('height', options.iconSize[1]);
                svg.setAttribute('viewBox', '0 0 31 42');
                svg.setAttribute('class', 'l-icon-material');
                svg.setAttribute(
                    'style',
                    `margin-left:-${Math.floor(options.iconSize[0] / 2)}px;margin-top:-${options.iconSize[1]}px`
                );
                svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');

                backgroundCircle.setAttribute('cx', '15.5');
                backgroundCircle.setAttribute('cy', '15');
                backgroundCircle.setAttribute('r', '11');
                backgroundCircle.setAttribute('fill', options.markerColor);

                path.setAttributeNS(
                    null,
                    'd',
                    'M15.6,1c-7.7,0-14,6.3-14,14c0,10.5,14,26,14,26s14-15.5,14-26C29.6,7.3,23.3,1,15.6,1z'
                );
                path.setAttribute('fill', options.markerColor);
                path.setAttribute('stroke', options.outlineColor);
                path.setAttribute('stroke-width', options.outlineWidth);

                icon.textContent = options.icon;
                icon.setAttribute('x', '4');
                icon.setAttribute('y', '30');
                icon.setAttribute('class', 'material-icons');
                icon.setAttribute('fill', options.iconColor);
                icon.setAttribute('font-family', 'Material Icons');

                svg.appendChild(path);
                svg.appendChild(backgroundCircle);
                icongroup.appendChild(icon);

                svg.appendChild(icongroup);
                svg.setAttribute(
                    'transform',
                    `matrix(1 0 0 1 -${Math.floor(options.iconSize[0] / 2)} ${Math.floor(options.iconSize[1])})`
                );

                return svg;
            }
        });

        Leaflet.IconMaterial.icon = function (options) {
            return new Leaflet.IconMaterial.Icon(options);
        };
    }

    static createCanvasMarker() {
        Leaflet.Canvas.include({
            _updateImg(layer) {
                const { img } = layer.options;
                // eslint-disable-next-line no-underscore-dangle
                const point = layer._point.round();
                point.x += img.offset.x;
                point.y += img.offset.y;
                if (img.rotate) {
                    this._ctx.save();
                    this._ctx.translate(point.x, point.y);
                    this._ctx.rotate((img.rotate * Math.PI) / 180);
                    this._ctx.drawImage(img.el, -img.size[0] / 2, -img.size[1] / 2, img.size[0], img.size[1]);
                    this._ctx.restore();
                } else {
                    this._ctx.drawImage(
                        img.el,
                        point.x - img.size[0] / 2,
                        point.y - img.size[1] / 2,
                        img.size[0],
                        img.size[1]
                    );
                }
            }
        });

        const angleCrds = (map, prevLatlng, latlng) => {
            if (latlng == null || prevLatlng == null) {
                return 0;
            }
            const pxStart = map.project(prevLatlng);
            const pxEnd = map.project(latlng);
            return (Math.atan2(pxStart.y - pxEnd.y, pxStart.x - pxEnd.x) / Math.PI) * 180 - 90;
        };

        const defaultImgOptions = {
            rotate: 0,
            // eslint-disable-next-line no-restricted-syntax
            size: [40, 40],
            offset: { x: 0, y: 0 }
        };

        const CanvasMarker = Leaflet.CircleMarker.extend({
            _updatePath() {
                if (this.options.img == null || this.options.img.url == null) {
                    return;
                }

                const { url } = this.options.img;

                if (this.options.img.el == null) {
                    this.options.img = { ...defaultImgOptions, ...this.options.img };
                    this.options.img.rotate += angleCrds(this._map, this.options.prevLatlng, this._latlng);
                    const img = document.createElement('img');
                    img.src = url;
                    // eslint-disable-next-line goodt-rules/no-long-prop-chains
                    this.options.img.el = img;
                    img.onload = () => {
                        this.redraw();
                    };
                    img.onerror = () => {
                        this.options.img = null;
                    };
                } else {
                    // eslint-disable-next-line no-underscore-dangle
                    this._renderer._updateImg(this);
                }
            }
        });

        Leaflet.canvasMarker = function (...opt) {
            try {
                const i = opt.findIndex((item) => typeof item === 'object' && item.img);
                if (i !== -1) {
                    if (opt[i].radius == null && opt[i].img != null && opt[i].img.size > 0) {
                        opt[i].radius = Math.ceil(Math.max(...opt[i].img.size) / 2);
                    }

                    if (opt[i].pane != null) {
                        delete opt[i].pane;
                    }
                }

                return new CanvasMarker(...opt);
            } catch (e) {
                return e;
            }
        };
    }

    static formatMetric(currentValue, format) {
        if (!Number.isNaN(parseFloat(currentValue)) && Number.isFinite(Number(currentValue))) {
            const valueIn = Number(currentValue);
            return formatNumber(valueIn, format);
        }

        return currentValue;
    }

    static isIntegerNumber = (value) => typeof value === 'number' && !Number.isNaN(value);
}
