<script>
import { Elem } from '@goodt-wcore/core';
import { AuthManager } from '@goodt-wcore/managers';
import { State, Behaviour } from './constants';
import { meta } from './descriptor';

/**
 * @typedef {import('@goodt-common/auth/adapters/Adapter').default} AuthAdapter
 */

export default {
    extends: Elem,
    meta,
    data: () => ({
        state: State.LOADING
    }),
    mounted() {
        if (!this.isEditorMode) {
            this.init();
        }

        this.state = State.DEFAULT;
        this.$watch(
            'state',
            (val) => {
                this.slotDefault = val;
            },
            { immediate: true }
        );
        this.$watch('props.domTag', () => {
            this._mounted(false);
        });
    },
    render(h) {
        const { state, isEditorMode } = this;
        const { domTag } = this.props;

        const placeholder = h('code', `${state} slot`);
        const slotFn = this.$scopedSlots[state];
        const slot = slotFn ? slotFn() : isEditorMode ? placeholder : null;

        return h(domTag, { class: this.cssClass, style: this.cssStyle }, [slot]);
    },
    methods: {
        getSlotNames() {
            return Object.values(State);
        },
        init() {
            /** @type {{ adapter:AuthAdapter }} */
            const { adapter } = AuthManager.instance;
            const hasAdapter = adapter != null;
            this.state = hasAdapter ? State.LOADING : State.DEFAULT;

            if (!hasAdapter) {
                return;
            }

            const { behaviour, redirectUrl } = this.props;

            if (adapter.authenticated) {
                this.state = State.DEFAULT;
            } else {
                // render slot
                if (behaviour === Behaviour.RENDER) {
                    this.state = State.NOT_AUTHORIZED;
                }
                // redirect to url
                else if (behaviour === Behaviour.REDIRECT) {
                    this.$eventBus && this.$routeNavigate({ path: redirectUrl });
                }
                // authorize
                else if (behaviour === Behaviour.LOGIN) {
                    AuthManager.instance.login().then(() => {
                        this.state = State.DEFAULT;
                    });
                }
            }
        }
    }
};
</script>
