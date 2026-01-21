<script>
import { DremioPanel } from '@goodt-common/dremio-panels';

/**
 * @typedef {import('./AdditionalDremioPanel').TInstance} TInstance
 * @type {TInstance}
 */
export const PanelInstanceTypeDescriptor = undefined;

export default {
    extends: DremioPanel,
    meta: { name: 'Дополнительный источник', icon: 'database-plus' },
    computed: {
        /**
         *  @public
         *  @return {Record<string, any> | null}
         */
        query() {
            // eslint-disable-next-line goodt-rules/no-long-prop-chains
            return this.props.additionalDremio?.query ?? null;
        },
        /**
         *  @public
         *  @return {Record<string, any>}
         */
        dimensionList() {
            // eslint-disable-next-line goodt-rules/no-long-prop-chains
            return this.props.additionalDremio?.dimensionList ?? {};
        },
        /**
         *  @public
         *  @return {number}
         */
        limit() {
            // eslint-disable-next-line goodt-rules/no-long-prop-chains
            return this.props.additionalDremio?.limit ?? 0;
        }
    },
    methods: {
        /**
         *  @public
         *  @param {{query: Record<string, any>, dimensionList: Record<string, any>, limit: number}} dremio
         */
        onEditorSave({ query, dimensionList, limit }) {
            this.props.additionalDremio = { query, dimensionList, limit };
            this.propChanged('additionalDremio');
            this.isEditorOpen = false;
        },
        /**
         *  @public
         *  @param {string} val
         */
        importDataset(val) {
            this.props.additionalDremio = JSON.parse(val);
            this.propChanged('additionalDremio');
            this.showDatasetImportPopup = false;
        },
        /** @public */
        onDeleteQueryClick() {
            this.props.additionalDremio = null;
            this.propChanged('additionalDremio');
        }
    },
    ...PanelInstanceTypeDescriptor
};
</script>
