<template>
    <div>
        <div class="p">
            <label class="checkbox checkbox-small">
                <input id="elem-event-container-panel-isShow" type="checkbox" v-model="isShow" />
                <i></i>
            </label>
            <label class="v-mid pad-left-3" for="elem-event-container-panel-isShow"
                >show container</label
            >
        </div>
        <div class="p">
            <label class="checkbox checkbox-small">
                <input
                    id="elem-event-container-panel-initShow"
                    type="checkbox"
                    v-model="props.initShow"
                    @change="propChanged"
                />
                <i></i>
            </label>
            <label class="v-mid pad-left-3" for="elem-event-container-panel-initShow"
                >show by default</label
            >
        </div>
        <div class="p">
            <label class="checkbox checkbox-small">
                <input
                    id="elem-event-container-panel-showMode"
                    type="checkbox"
                    v-model="props.showMode"
                    @change="propChanged"
                />
                <i></i>
            </label>
            <label class="v-mid pad-left-3" for="elem-event-container-panel-showMode"
                >single mode</label
            >
        </div>
        <div class="p" v-if="!props.showMode">
            <div class="row">
                <div class="col col-6-12">
                    <div class="form-label">event to show</div>
                    <div class="form-control w-100">
                        <input
                            class="input input-small w-100"
                            type="text"
                            v-model="props.eventShow"
                            @change="propChanged"
                        />
                    </div>
                </div>
                <div class="col col-6-12">
                    <div class="form-label">event to hide</div>
                    <div class="form-control w-100">
                        <input
                            class="input input-small w-100"
                            type="text"
                            v-model="props.eventHide"
                            @change="propChanged"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="p" v-else>
            <div class="row">
                <div class="col col-12-12">
                    <div class="form-label">event to show and hide</div>
                    <div class="form-control w-100">
                        <input
                            class="input input-small w-100"
                            type="text"
                            v-model="props.eventShowHide"
                            @change="propChanged"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="props.showMode" class="p">
            <label class="checkbox checkbox-small">
                <input
                    id="elem-event-container-panel-reverse"
                    type="checkbox"
                    v-model="props.reverseEvent"
                    @change="propChanged"
                />
                <i></i>
            </label>
            <label class="v-mid pad-left-3" for="elem-event-container-panel-reverse"
                >Vise-versa value</label
            >
        </div>
    </div>
</template>
<script>
import { Panel } from 'goodt-wcore';

export default {
    extends: Panel,
    data() {
        return {
            $meta: { name: 'Настройки виджета', icon: 'widgets' }
        };
    },
    computed: {
        isShow: {
            set(val) {
                if (this.elementInstance) {
                    this.elementInstance.show = val;
                }
            },
            get() {
                return this.elementInstance ? this.elementInstance.show : false;
            }
        }
    }
};
</script>
