<template>
    <w-panel>
        <ui-container>
            <ui-button @click="runTest">Протестировать</ui-button>
            <ui-select v-model="state" :options="StateOptions">Состояние</ui-select>
            <ui-select prop="behaviour" :options="BehaviourOptions">Поведение</ui-select>
            <ui-input prop="redirectUrl" v-if="props.behaviour === Behaviour.REDIRECT">Url переадресации</ui-input>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
import { LocalizedState, LocalizedBehaviour, Behaviour } from '../constants';

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'widgets' },
    static: {
        Behaviour,
        BehaviourOptions: Object.entries(LocalizedBehaviour).map(([key, value]) => ({ label: value, value: key })),
        StateOptions: Object.entries(LocalizedState).map(([key, value]) => ({ label: value, value: key }))
    },
    computed: {
        state: {
            set(val) {
                if (this.elementInstance) {
                    this.elementInstance.state = val;
                }
            },
            get() {
                return this.elementInstance ? this.elementInstance.state : null;
            }
        }
    },
    methods: {
        runTest() {
            this.elementInstance && this.elementInstance.init();
        }
    }
};
</script>
