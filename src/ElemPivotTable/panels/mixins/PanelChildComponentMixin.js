import { PanelUi } from '@goodt-wcore/components';
import { ProvideMixin } from '@goodt-wcore/panel';

/**
 * @type {import('./types').IPanelProvideMixinApiInject}
 */
const Types = undefined;

export default {
    components: {
        ...PanelUi
    },
    mixins: [ProvideMixin],
    inject: {
        $panel: {
            from: 'panel'
        }
    },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    computed: {
        props() {
            return this.value;
        },
        elementInstance() {
            return this.$panel.elementInstance;
        }
    },
    methods: {
        ...Types,
        propChanged() {
            this.$emit('input', this.props);
            this.$emit('changed', this.props);
        }
    }
};
