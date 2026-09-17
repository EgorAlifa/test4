<script>
import { DremioMultiPanel as DremioPanel } from '@goodt-common/dremio-panels';
import { Dremio } from 'goodt-wcore';
import { cloneDeep } from 'lodash';

const { Query } = Dremio;

export default {
    extends: DremioPanel,
    watch: {
        'props.dremio': {
            immediate: true,
            deep: true,
            handler() {
                const { dremio, selectedDimension } = this.props;
                if (selectedDimension !== '' || dremio == null || dremio.length === 0) {
                    return;
                }

                const [{ dimensionList }] = dremio;

                const dimensionNames = Object.keys(dimensionList);

                if (dimensionNames.length > 0 && selectedDimension === '') {
                    this.props.selectedDimension = dimensionNames[0];
                    this.propChanged('selectedDimension');
                }
            }
        }
    },
    created() {
        if (!Array.isArray(this.props.dremio)) {
            this.props.dremio = this.props.dremio == null ? [] : [this.props.dremio];
            this.propChanged('dremio');
        }
    }
};
</script>
