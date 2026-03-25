/**
 * Mixin that normalizes the `dremio` prop based on the type declared in the widget's descriptor.
 *
 * Fixes spontaneous Array<->Object corruption:
 * - descriptor says `type: Array`  but stored value is Object → wraps in [Object]
 * - descriptor says `type: Object` but stored value is Array  → takes first element
 *
 * Usage: add DremioNormalizeMixin as the FIRST item in the `mixins` array so the
 * normalization runs before any other mixin (e.g. DremioMixin) reads `props.dremio`.
 *
 * @example
 * import { DremioNormalizeMixin } from '@goodt-widgets-insight/utils';
 * export default {
 *     mixins: [DremioNormalizeMixin, DremioMixin, ...],
 * };
 */
export const DremioNormalizeMixin = {
    created() {
        const expectedType = this.descriptor?.props?.dremio?.type;
        const currentDremio = this.props?.dremio;

        if (!expectedType || currentDremio == null) {
            return;
        }

        if (expectedType === Array && !Array.isArray(currentDremio)) {
            this.props.dremio = [currentDremio];
            this.propChanged?.('dremio');
        } else if (expectedType === Object && Array.isArray(currentDremio)) {
            this.props.dremio = currentDremio[0] ?? null;
            this.propChanged?.('dremio');
        }
    }
};

export default DremioNormalizeMixin;
