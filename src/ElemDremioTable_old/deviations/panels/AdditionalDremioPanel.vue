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
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
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
            return this.props.additionalDremio?.limit ?? 60;
        },
        /**
         *  @public
         *  @return {string | null}
         */
        dataProviderId() {
            // eslint-disable-next-line goodt-rules/no-long-prop-chains
            return this.props.additionalDremio?.dataProviderId ?? null;
        }
    },
    methods: {
        /**
         *  @public
         *  @param {{query: Record<string, any>, dimensionList: Record<string, any>, limit: number, dataProviderId: string}} dremio
         */
        onEditorSave({ query, dimensionList, limit, dataProviderId }) {
            this.props.additionalDremio = { query, dimensionList, limit, dataProviderId };
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
    }
};
</script>
