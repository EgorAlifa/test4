<script>
import { DremioMultiPanel } from '@goodt-common/dremio-panels';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: DremioMultiPanel,
    meta: { name: 'Источники фильтрации', icon: 'database-refresh' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        /**
         * @public
         */
        datasources: {
            set(val) {
                this.props.dremioAddons = val;
                this.emitPropChange();
            },
            get() {
                return this.props.dremioAddons;
            }
        }
    },
    methods: {
        emitPropChange() {
            this.propChanged('dremioAddons');
        }
    }
};
</script>
