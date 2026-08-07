/* Utility functions for gauge calculations and formatting */

/**
 * Fix number precision
 */
const fixNum = (num, frDigits) => {
    const multiplier = 10 ** frDigits;
    return Math.round(num * multiplier) / multiplier;
};

/**
 * Format number with locale separator
 */
const formatNum = (num, localeSep, frDigits) => {
    if (num === null || Number.isNaN(num)) return '—';
    
    return Intl.NumberFormat(localeSep, {
        minimumFractionDigits: frDigits
    }).format(num);
};

/**
 * Calculate percentage
 */
const calcPercentage = (value, sep, frDigits) => {
    const percentValue = fixNum(value * 100, frDigits);
    return `${formatNum(percentValue, sep, frDigits)}%`;
};

const separators = ['default', 'ru-RU', 'de-DE', 'en-EN'];

const availableFormats = {
    0: ({ value, sep }) => formatNum(fixNum(value, 0), sep, 0),
    1: ({ value, sep }) => formatNum(fixNum(value, 1), sep, 1),
    2: ({ value, sep }) => formatNum(fixNum(value, 2), sep, 2),
    3: ({ value, sep }) => formatNum(fixNum(value, 3), sep, 3),
    '0%': ({ value, sep }) => calcPercentage(value, sep, 0),
    '1%': ({ value, sep }) => calcPercentage(value, sep, 1),
    '2%': ({ value, sep }) => calcPercentage(value, sep, 2),
    '3%': ({ value, sep }) => calcPercentage(value, sep, 3)
};

/**
 * Format value based on format and separator
 * @param {number} value - The numeric value to format
 * @param {string} format - Format type from availableFormats
 * @param {string} separator - Separator type index
 * @param {string} prefix - Text to prepend
 * @param {string} postfix - Text to append
 * @returns {string} Formatted value
 */
export const formatGaugeValue = (value, format = '1%', separator = '1', prefix = '', postfix = '') => {
    if (value === null || Number.isNaN(value)) return '—';
    
    const sep = separators[separator] || separators[1];
    const formatFn = availableFormats[format] || availableFormats['1%'];
    const formattedValue = formatFn({ value, sep });
    
    return `${prefix}${formattedValue}${postfix}`.trim();
};

/**
 * Calculate segment angles for half-circle gauge
 * @param {number} numberOfSegments - Total number of segments
 * @returns {number[]} Array of angles for each segment
 */
export const calculateSegmentAngles = (numberOfSegments = 14) => {
    const segmentAngle = 180 / numberOfSegments;
    const angles = [];
    
    for (let s = 0; s < numberOfSegments; ++s) {
        angles.push(segmentAngle / 2 + segmentAngle * s);
    }
    
    return angles;
};

/**
 * Determine which segments should be active based on percentage
 * @param {number} percent - Value between 0 and 1
 * @param {number} numberOfSegments - Total number of segments
 * @returns {number} Index of current active segment
 */
export const getActiveSegmentIndex = (percent = 0, numberOfSegments = 14) => {
    return Math.floor(percent * numberOfSegments);
};

/**
 * Get SVG path for a segment
 * @param {boolean} isRounded - Whether segment should have rounded corners
 * @returns {string} SVG path d attribute
 */
export const getSegmentPath = (isRounded = true) => {
    if (isRounded) {
        return 'M -2.7 -1.5 L 2.7 -0.98 C 3.1 -0.93 3.5 -0.582 3.5 -0.182 L 3.5 0.217 C 3.5 0.629 3.1 0.93 2.7 0.98 L -2.7 1.5 C -3.142 1.5 -3.5 1.142 -3.5 0.7 L -3.5 -0.7 C -3.5 -1.142 -3.142 -1.5 -2.7 -1.5 Z';
    }
    return 'M -2.7 -1.5 L 2.7 -1.5 L 2.7 1.5 L -2.7 1.5 Z';
};

/**
 * Calculate dot angles for ring gauge (full circle)
 * @param {number} numberOfDots - Total number of dots around the circle
 * @returns {number[]} Array of angles for each dot
 */
export const calculateRingDotAngles = (numberOfDots = 16) => {
    const dotAngle = 360 / numberOfDots;
    const angles = [];
    
    for (let d = 0; d < numberOfDots; ++d) {
        angles.push(dotAngle * d);
    }
    
    return angles;
};

/**
 * Calculate SVG arc path for ring gauge
 * @param {number} percent - Value between 0 and 1
 * @param {number} radius - Radius of the arc
 * @param {number} strokeWidth - Width of the arc stroke
 * @returns {object} Arc properties for SVG
 */
export const calculateRingArc = (percent = 0, radius = 5.5, strokeWidth = 1) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percent);

    return {
        circumference,
        offset,
        radius,
        strokeWidth
    };
};

/* ── Needle (tachometer) gauge ──────────────────────────────────────
 * Same bottom-center-pivot convention as the half-circle style above
 * (<g transform="translate(cx,cy)">, angle 0 = pointing left/9 o'clock,
 * 180 = pointing right/3 o'clock, sweeping clockwise through the top) -
 * so needle/ticks/bands all agree with each other and with the segment
 * gauge's own math (getSegmentTransform uses the identical rotate+translate
 * trick, just applied to a fixed offset point instead of computed here). */

const degToRad = (deg) => (deg * Math.PI) / 180;

/**
 * @param {number} radius
 * @param {number} angleDeg - 0 = left, 90 = top, 180 = right
 * @returns {{x: number, y: number}}
 */
export const polarToCartesian = (radius, angleDeg) => ({
    x: -radius * Math.cos(degToRad(angleDeg)),
    y: -radius * Math.sin(degToRad(angleDeg))
});

/**
 * SVG path `d` for a stroked arc between two angles (0..180) - meant to be
 * drawn with a thick `stroke` and `fill="none"`, not filled as a wedge.
 * @param {number} radius
 * @param {number} startAngle
 * @param {number} endAngle
 * @returns {string}
 */
export const describeArc = (radius, startAngle, endAngle) => {
    const start = polarToCartesian(radius, startAngle);
    const end = polarToCartesian(radius, endAngle);
    // our sweep never exceeds 180° in one call, so the large-arc-flag is
    // always 0; sweep-flag 1 draws it in the increasing-angle (clockwise)
    // direction, matching how angle grows from left to right here.
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
};

/**
 * Turns a list of cumulative band thresholds into (from, to, color) triples
 * ready to draw, e.g. [{ to: 0.9, color: 'red' }, { to: 1, color: 'green' }]
 * -> [{ from: 0, to: 0.9, color: 'red' }, { from: 0.9, to: 1, color: 'green' }]
 * @param {{to: number, color: string}[]} bands
 * @returns {{from: number, to: number, color: string}[]}
 */
export const resolveNeedleBands = (bands = []) => {
    let from = 0;
    return bands.map((band) => {
        const resolved = { from, to: band.to, color: band.color };
        from = band.to;
        return resolved;
    });
};

/**
 * @param {{from: number, to: number, color: string}[]} resolvedBands
 * @returns {{startAngle: number, endAngle: number, color: string}[]}
 */
export const calculateNeedleBandArcs = (resolvedBands) =>
    resolvedBands.map(({ from, to, color }) => ({
        startAngle: Math.max(0, Math.min(1, from)) * 180,
        endAngle: Math.max(0, Math.min(1, to)) * 180,
        color
    }));

/**
 * Evenly spaced tick angles across the 180° arc, endpoints included.
 * @param {number} numberOfTicks
 * @returns {number[]}
 */
export const calculateTickAngles = (numberOfTicks = 9) => {
    if (numberOfTicks <= 1) {
        return [90];
    }
    const step = 180 / (numberOfTicks - 1);
    const angles = [];
    for (let t = 0; t < numberOfTicks; ++t) {
        angles.push(step * t);
    }
    return angles;
};

/**
 * Needle rotation in degrees, ready for a needle shape whose neutral (0°)
 * orientation points straight up (toward 12 o'clock / the 50% mark).
 * @param {number} percent - value / benchmark, typically 0..1
 * @param {number} scaleMax - percent that maps to the dial's right end (1 =
 *   100%); values above 1 let the 100% mark sit before the physical end of
 *   the dial, leaving room to show overshoot.
 * @returns {number} degrees, clamped to [-90, 90]
 */
export const calculateNeedleAngle = (percent = 0, scaleMax = 1) => {
    const safeScaleMax = scaleMax > 0 ? scaleMax : 1;
    const clamped = Math.max(0, Math.min(1, percent / safeScaleMax));
    return -90 + clamped * 180;
};

