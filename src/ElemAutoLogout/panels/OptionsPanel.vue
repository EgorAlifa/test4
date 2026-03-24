<template>
    <w-panel>
        <ui-container>
            <ui-input prop="timeoutSeconds" type="number"></ui-input>
            <ui-select prop="redirectType" :options="RedirectTypeOptions">Тип перенаправления</ui-select>
            <ui-input prop="customRedirectUrl" v-if="props.redirectType === RedirectType.CUSTOM">
                URL перенаправления
            </ui-input>
            <ui-checkbox prop="warningEnabled"></ui-checkbox>
            <ui-input prop="warningDuration" type="number" v-if="props.warningEnabled">
                Время предупреждения (сек.)
            </ui-input>
            <ui-has-panel>
                <div class="text-small">{{ getPropLabel('labels') }}</div>
                <template #panel>
                    <ui-panel :groups="[{ name: getPropLabel('labels'), slot: 'default' }]">
                        <template>
                            <ui-container>
                                <ui-input prop="labels.warningTitle"></ui-input>
                                <ui-input prop="labels.warningMessage"></ui-input>
                                <ui-input prop="labels.stayLoggedIn"></ui-input>
                                <ui-input prop="labels.seconds"></ui-input>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { RedirectType, LocalizedRedirectType } from '../constants';

export default {
    extends: Panel,
    meta: { name: 'Настройки виджета', icon: 'timer-off' },
    static: {
        RedirectType,
        RedirectTypeOptions: Object.entries(LocalizedRedirectType).map(([value, label]) => ({ value, label }))
    },
    methods: {
        /**
         * @param {string} path
         * @return {string}
         */
        getPropLabel(path) {
            const prop = path.split('.')[0];
            return this.descriptor.props[prop]?.label[path] ?? '';
        }
    }
};
</script>
