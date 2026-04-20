<template>
    <g :style="groupStyle">
        <path
            :d="limitArc"
            fill="none"
            :stroke="limitColor"
            :stroke-width="limitWidth"
            :style="strokeStyle"
            v-on="limitListeners" />
        <path
            :d="valueArc"
            ref="arc"
            fill="none"
            :stroke="valueColor"
            :stroke-width="valueWidth"
            :style="strokeStyle"
            v-on="valueListeners" />
    </g>
</template>
<script>
import gsap from 'gsap';

const Geom = {
    polarToCartesian: (cx, cy, r, angleDeg) => {
        // eslint-disable-next-line no-param-reassign
        angleDeg = angleDeg === 360 ? 359.999 : angleDeg;
        const rad = ((angleDeg - 90) * Math.PI) / 180.0;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        };
    },
    arc: (x, y, radius, startAngle, endAngle) => {
        const start = Geom.polarToCartesian(x, y, radius, startAngle);
        const end = Geom.polarToCartesian(x, y, radius, endAngle);
        const sweep = endAngle - startAngle <= 180 ? 0 : 1;
        return ['M', start.x, start.y, 'A', radius, radius, 0, sweep, 1, end.x, end.y].join(' ');
    }
};
const clamp = (n, min, max) => (Number(n) < min ? min : n > max ? max : n);
const abs = (n) => (n > 0 ? n : -n);
const num = (n) => (Number.isNaN(Number(n)) ? 0 : Number(n));

export default {
    props: {
        radius: { type: Number, default: 50 },
        value: { type: Number, default: 0 },
        valueWidth: { type: Number, default: 10 },
        valueColor: { type: String, default: '#4FC08D' },
        limit: { type: Number, default: 0 },
        limitWidth: { type: Number, default: 10 },
        limitColor: { type: String, default: '#DDD' },
        useSegments: { type: Boolean, default: false },
        segmentOffset: { type: Number, default: 2 },
        linecap: { type: String, default: 'butt' },
        duration: { type: Number, default: 2 },
        ease: { type: String, default: 'expo.out' },
        limitListeners: {
            type: Object,
            default() {
                return {};
            }
        },
        valueListeners: {
            type: Object,
            default() {
                return {};
            }
        },
        dropShadow: { type: String, default: '' }
    },
    data() {
        return { valueArc: '', twobj: { val: 0 } };
    },
    computed: {
        limitArc() {
            return this.calcArc(360);
        },
        strokeStyle() {
            const { useSegments, segmentLen, segmentOffset, pathLen, linecap } = this;
            const style = { 'stroke-linecap': linecap };
            if (useSegments) {
                style['stroke-dasharray'] = `${segmentLen - segmentOffset} ${segmentOffset}`;
            }
            return style;
        },
        groupStyle() {
            if (this.dropShadow !== '') {
                return { filter: `drop-shadow(${this.dropShadow})` };
            }
            return {};
        },
        pathLen() {
            const { radius } = this;
            return 2 * Math.PI * radius;
        },
        segmentLen() {
            const { pathLen, limit } = this;
            return pathLen / limit;
        }
    },
    watch: {
        value: {
            handler(v, vo) {
                const { limit, duration, ease } = this;
                v = clamp(num(v), 0, limit);
                vo = clamp(num(vo), 0, limit);
                this.tween = gsap.to(this.twobj, {
                    val: v,
                    duration: duration * (abs(v - vo) / limit),
                    ease,
                    overwrite: true,
                    onUpdate: ({ val }) => {
                        const percent = val / limit;
                        this.valueArc = this.calcArc(percent * 360);
                    },
                    onUpdateParams: [this.twobj]
                });
            },
            immediate: true
        },
        limit(limit) {
            const { value } = this;
            const percent = clamp(num(value), 0, limit) / num(limit);
            this.valueArc = this.calcArc(percent * 360);
        },
        radius() {
            const { value, limit } = this;
            const percent = clamp(num(value), 0, limit) / num(limit);
            this.valueArc = this.calcArc(percent * 360);
        }
    },
    created() {
        this.tween = null;
    },
    destroyed() {
        this.tween && this.tween.kill();
    },
    methods: {
        calcArc(angleDeg) {
            const { radius } = this;
            return Geom.arc(radius, radius, radius, 0, angleDeg);
        }
    }
};
</script>