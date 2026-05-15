<template>
    <div class="marker-overlay-hidden"></div>
</template>

<script>
/**
 * MarkerOverlayLayer — renders SVG shape markers on a Leaflet map using DivIcon.
 *
 * Displays circle / pin / diamond / triangle / arrow shapes at given lat/lon positions.
 * Uses L.marker with L.divIcon containing an inline SVG so shapes match the
 * choropleth overlay exactly (same buildMarkerShape logic).
 */
import { yandexLatCorrection } from '../utils/mapHelpers';

export default {
    name: 'MarkerOverlayLayer',

    props: {
        map: { type: Object, default: null },
        markers: { type: Array, default: () => [] },
        symbol: { type: String, default: 'circle' },
        color: { type: String, default: '#e53935' },
        size: { type: Number, default: 10 },
        isYandexTiles: { type: Boolean, default: false }
    },

    data() {
        return { leafletMarkers: [] };
    },

    watch: {
        map(newMap) {
            if (newMap) this.rebuild();
        },
        markers: { handler() { this.rebuild(); }, deep: true },
        symbol() { this.rebuild(); },
        color()  { this.rebuild(); },
        size()   { this.rebuild(); }
    },

    beforeDestroy() {
        this.clearMarkers();
    },

    methods: {
        clearMarkers() {
            if (!this.map) return;
            for (const m of this.leafletMarkers) this.map.removeLayer(m);
            this.leafletMarkers = [];
        },

        buildSvg(sym, color, r) {
            const s = r * 2;
            const cx = r, cy = r;
            let shape = '';
            switch (sym) {
                case 'pin': {
                    const pr = r * 1.1;
                    shape = `<path d="M${cx},${cy + r} L${cx - pr * 0.62},${cy - pr * 0.5} A${pr * 0.88},${pr * 0.88} 0 1,1 ${cx + pr * 0.62},${cy - pr * 0.5} Z" fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>`;
                    break;
                }
                case 'diamond':
                    shape = `<polygon points="${cx},${cy - r * 1.45} ${cx + r},${cy} ${cx},${cy + r * 1.45} ${cx - r},${cy}" fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>`;
                    break;
                case 'triangle':
                    shape = `<polygon points="${cx},${cy - r * 1.3} ${cx + r * 1.15},${cy + r * 0.75} ${cx - r * 1.15},${cy + r * 0.75}" fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>`;
                    break;
                case 'arrow': {
                    const ar = r;
                    shape = `<path d="M${cx},${cy - ar * 2} L${cx + ar},${cy - ar * 0.5} L${cx + ar * 0.45},${cy - ar * 0.5} L${cx + ar * 0.45},${cy + ar} L${cx - ar * 0.45},${cy + ar} L${cx - ar * 0.45},${cy - ar * 0.5} L${cx - ar},${cy - ar * 0.5} Z" fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>`;
                    break;
                }
                default:
                    shape = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>`;
            }
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${shape}</svg>`;
        },

        rebuild() {
            if (!this.map) return;
            this.clearMarkers();
            if (!this.markers || this.markers.length === 0) return;

            const r = Math.max(4, (this.size || 10) * 0.6);
            const s = r * 2;

            for (const marker of this.markers) {
                if (marker.lat == null || marker.lon == null) continue;
                const lat = this.isYandexTiles ? yandexLatCorrection(marker.lat) : marker.lat;
                const svg = this.buildSvg(this.symbol, this.color, r);
                const icon = window.L.divIcon({
                    html: svg,
                    iconSize: [s, s],
                    iconAnchor: [r, r],
                    className: 'elemwowmap-marker-overlay'
                });
                const lm = window.L.marker([lat, marker.lon], {
                    icon,
                    title: marker.label || '',
                    zIndexOffset: 500
                });
                if (marker.label) {
                    lm.bindTooltip(marker.label, { sticky: true });
                }
                lm.addTo(this.map);
                this.leafletMarkers.push(lm);
            }
        }
    }
};
</script>
