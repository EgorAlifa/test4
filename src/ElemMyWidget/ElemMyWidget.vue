<template>
    <w-elem :placeholder="$placeholder">
        <div class="d-flex gap-1 mar-bot-1 mar-top-1">
            <button
                class="btn btn-secondary btn-small"
                :class="{ disabled: !drilldownCanPush }"
                :disabled="!drilldownCanPush"
                @click="drilldownPush">
                push: {{ drilldownCanPush }}
            </button>
            <button
                class="btn btn-secondary btn-small"
                :class="{ disabled: !drilldownCanPop }"
                :disabled="!drilldownCanPop"
                @click="drilldownPop">
                pop: {{ drilldownCanPop }}
            </button>
        </div>

        <div v-if="result">
            <pre v-for="(item, i) in result.rows" :key="i">{{ { ...item } }}</pre>
        </div>
        <div v-if="isLoading">loading...</div>
        <div v-if="error">{{ error }}</div>
        <ul class="pagination" v-if="pages > 1">
            <li v-for="n in pages" :key="n" :class="{ active: n === page }">
                <button @click.stop="loadDataPage(n)">{{ n }}</button>
            </li>
        </ul>
        <!-- {/demo} -->
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';

const DatasetMixin = useElemDatasetMixin({
    drilldown: true,
    panel: false,
});

export default {
    extends: Elem,
    mixins: [DatasetMixin],

    meta,

    hooks: {
        // @todo: delete if unused
        // before – optional hook
        before(cancel) { /* use cancel() to prevent loading */ },
        // then – optional hook
        then(result) {},
        // catch – optional hook
        catch(error) {},
        // finally – optional hook
        finally() {}
    },
    data: (/* vm */) => ({
    }),
    computed: {
        drilldownState() {
            return {
                canPop: false,
                canPush: false,
                ...this.$drilldown.state[this.props.drilldownName]
            };
        },
        drilldownCanPop() {
            return this.drilldownState.canPop;
        },
        drilldownCanPush() {
            return this.drilldownState.canPush;
        },
        drilldownDimension() {
            return this.drilldownState.dimension;
        }
    },
    methods: {
        // IDE suggestion helper
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,
        loadDataPage(page) {
            this.page = page;
            this.loadData();
        },
        drilldownPush() {
            const { drilldownName } = this.props;
            if (this.drilldownCanPush){
            // or without using computed this.drilldownCanPush
            // if (this.$drilldown.canPush(drilldownName)) {
                const dimensionValue = this.result.rows[0][drilldownName];
                // commit before push using drilldownName
                this.$storeCommit({ [drilldownName]: dimensionValue });
                this.$drilldown.push(drilldownName, dimensionValue);
            }
        },
        drilldownPop() {
            const { drilldownName } = this.props;
            if (this.drilldownCanPop) {
                // или если без computed
                // if (this.$drilldown.canPop(drilldownName)) {
                this.$drilldown.pop(drilldownName);
                // commit after pop
                this.$storeCommit({ [drilldownName]: null });
            }
        }
    }
};
</script>
