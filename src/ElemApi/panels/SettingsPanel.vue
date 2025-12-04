<template>
    <w-panel>
        <ui-container>
            <ui-select prop="mode" :options="ModeOptions">Режим работы</ui-select>

            <ui-button @click="createRequest">Добавить</ui-button>

            <ui-draggable-accordion prop="requests" v-bind="{ toolboxControls }">
                <template #header="{ item }">{{ item.name }}</template>
                <template #default="{ item }">
                    <ui-container>
                        <ui-input v-model="item.name" @change="onPropChange">Название запроса</ui-input>

                        <ui-select v-model="item.method" :options="MethodOptions" @change="onPropChange">
                            Метод запроса
                        </ui-select>

                        <ui-input v-model="item.url" @change="onPropChange">URL запроса</ui-input>

                        <ui-input-tags v-model="item.events" @change="onPropChange">События при отправке</ui-input-tags>
                        <ui-input-tags v-model="item.successEvents" @change="onPropChange">События при успешном ответе</ui-input-tags>
                        <ui-input-tags v-model="item.errorEvents" @change="onPropChange">События при неуспешном ответе</ui-input-tags>

                        <ui-input v-model="item.responseCode" @change="onPropChange">Переменная кода ответа</ui-input>

                        <ui-input v-model="item.responseMessage" @change="onPropChange">Переменная ответа</ui-input>

                        <ui-has-panel>
                            <div class="form-label form-label-small u-select-none">Заголовки запроса</div>
                            <template #panel>
                                <ui-panel :groups="[{ name: 'Заголовки запроса', slot: 'default' }]">
                                    <ui-container>
                                        <div v-for="(header, i) in item.headers" :key="i">
                                            <div class="key-value-item">
                                                <ui-input v-model="header.key" @change="onPropChange">Ключ</ui-input>
                                                <ui-input v-model="header.value" @change="onPropChange">
                                                    Значение
                                                </ui-input>
                                                <ui-button
                                                    class="btn-error"
                                                    icon
                                                    @click="onDeleteKeyValueHeaders(item, i)">
                                                    <i class="mdi mdi-18px mdi-delete-outline"></i>
                                                </ui-button>
                                            </div>
                                        </div>
                                        <ui-button @click="onCreateKeyValueHeaders(item)">
                                            Добавить ключ-значение
                                        </ui-button>
                                    </ui-container>
                                </ui-panel>
                            </template>
                        </ui-has-panel>

                        <ui-has-panel>
                            <div class="form-label form-label-small u-select-none">Параметры запроса</div>
                            <template #panel>
                                <ui-panel :groups="[{ name: 'Параметры запроса', slot: 'default' }]">
                                    <ui-container>
                                        <div v-for="(param, i) in item.params" :key="i">
                                            <div class="key-value-item">
                                                <ui-input v-model="param.key" @change="onPropChange">Ключ</ui-input>
                                                <ui-input v-model="param.value" @change="onPropChange">
                                                    Значение
                                                </ui-input>
                                                <ui-button
                                                    class="btn-error"
                                                    icon
                                                    @click="onDeleteKeyValueParams(item, i)">
                                                    <i class="mdi mdi-18px mdi-delete-outline"></i>
                                                </ui-button>
                                            </div>
                                        </div>
                                        <ui-button @click="onCreateKeyValueParams(item)">
                                            Добавить ключ-значение
                                        </ui-button>
                                    </ui-container>
                                </ui-panel>
                            </template>
                        </ui-has-panel>

                        <ui-has-panel>
                            <div class="form-label form-label-small u-select-none">Тело запроса</div>
                            <template #panel>
                                <ui-panel :groups="[{ name: 'Тело запроса', slot: 'default' }]">
                                    <ui-container>
                                        <ui-select
                                            v-model="item.bodyKey"
                                            :options="BodyTypeOptions"
                                            @change="onPropChange">
                                            Тип содержимого
                                        </ui-select>

                                        <template v-if="shouldShowBodyTextarea(item.bodyKey)">
                                            <ui-textarea v-model="item.body[item.bodyKey].data" @change="onPropChange">
                                                Тело
                                            </ui-textarea>
                                        </template>

                                        <template v-if="shouldShowBodyKeyValue(item.bodyKey)">
                                            <div v-for="(param, i) in item.body[item.bodyKey].data" :key="i">
                                                <div class="key-value-item">
                                                    <ui-input v-model="param.key" @change="onPropChange">Ключ</ui-input>
                                                    <ui-input v-model="param.value" @change="onPropChange">
                                                        Значение
                                                    </ui-input>
                                                    <ui-button
                                                        class="btn-error"
                                                        icon
                                                        @click="onDeleteKeyValueBody(item, i)">
                                                        <i class="mdi mdi-18px mdi-delete-outline"></i>
                                                    </ui-button>
                                                </div>
                                            </div>
                                            <ui-button @click="onCreateKeyValueBody(item)">
                                                Добавить ключ-значение
                                            </ui-button>
                                        </template>
                                    </ui-container>
                                </ui-panel>
                            </template>
                        </ui-has-panel>

                        <ui-has-panel>
                            <div class="form-label form-label-small u-select-none">Авторизация</div>
                            <template #panel>
                                <ui-panel :groups="[{ name: 'Авторизация', slot: 'default' }]">
                                    <ui-container>
                                        <ui-select
                                            v-model="item.authKey"
                                            :options="AuthTypeOptions"
                                            @change="onPropChange">
                                            Тип авторизации
                                        </ui-select>

                                        <template v-if="shouldShowBasicAuth(item.authKey)">
                                            <ui-input v-model="item.auth[item.authKey].name" @change="onPropChange">
                                                Логин
                                            </ui-input>
                                            <ui-input v-model="item.auth[item.authKey].pass" @change="onPropChange">
                                                Пароль
                                            </ui-input>
                                        </template>

                                        <template v-if="shouldShowBearerToken(item.authKey)">
                                            <ui-input v-model="item.auth[item.authKey].token" @change="onPropChange">
                                                Bearer token
                                            </ui-input>
                                        </template>

                                        <template v-if="shouldShowOAuth(item.authKey)">
                                            <ui-input v-model="item.auth[item.authKey].authUrl" @change="onPropChange">
                                                Authorization URL
                                            </ui-input>
                                            <ui-input v-model="item.auth[item.authKey].clientId" @change="onPropChange">
                                                Client ID
                                            </ui-input>
                                            <ui-input
                                                v-model="item.auth[item.authKey].clientSecret"
                                                @change="onPropChange">
                                                Client Secret
                                            </ui-input>

                                            <ui-button @click="onGenerateOAuthToken(item.auth[item.authKey])">
                                                Сгенерировать токен
                                            </ui-button>
                                        </template>
                                    </ui-container>
                                </ui-panel>
                            </template>
                        </ui-has-panel>
                    </ui-container>
                </template>
            </ui-draggable-accordion>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { UiDraggableAccordion } from '@goodt-wcore/panel-ui';
import { cloneDeep, findIndex } from 'lodash';
import {
    ModeOptions,
    MethodOptions,
    BodyTypeOptions,
    AuthTypeOptions,
    RequestTemplate,
    KeyValueTemplate
} from '../constants';

export default {
    extends: Panel,

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    components: { UiDraggableAccordion },

    mixins: [usePanelDatasetMixin()],

    static() {
        return {
            ModeOptions,
            MethodOptions,
            BodyTypeOptions,
            AuthTypeOptions,
            RequestTemplate,
            KeyValueTemplate
        };
    },

    data: (vm) => ({
        toolboxControls: [
            { icon: 'mdi-minus-box-outline', label: 'Удалить', handler: vm.deleteRequest },
            { icon: 'mdi-content-copy', label: 'Копировать', handler: vm.copyRequest }
        ],
        ...PanelDatasetMixinTypes
    }),

    methods: {
        onPropChange() {
            this.$nextTick(() => {
                this.propChanged('requests');
            });
        },
        shouldShowBodyTextarea(key) {
            return key === 'text' || key === 'json' || key === 'html' || key === 'xml';
        },
        shouldShowBodyKeyValue(key) {
            return key === 'formData' || key === 'urlencoded';
        },
        shouldShowBasicAuth(key) {
            return key === 'basicAuth';
        },
        shouldShowBearerToken(key) {
            return key === 'bearer';
        },
        shouldShowOAuth(key) {
            return key === 'oAuth';
        },
        onCreateKeyValueHeaders(item) {
            const { props } = this;

            const idx = findIndex(props.requests, item);
            const newKeyValue = cloneDeep(this.KeyValueTemplate);
            props.requests[idx].headers.push(newKeyValue);

            this.propChanged('requests');
        },
        onCreateKeyValueParams(item) {
            const { props } = this;

            const idx = findIndex(props.requests, item);
            const newKeyValue = cloneDeep(this.KeyValueTemplate);
            props.requests[idx].params.push(newKeyValue);

            this.propChanged('requests');
        },
        onCreateKeyValueBody(item) {
            const { props } = this;

            const idx = findIndex(props.requests, item);
            const newKeyValue = cloneDeep(this.KeyValueTemplate);
            props.requests[idx].body[item.bodyKey].data.push(newKeyValue);

            this.propChanged('requests');
        },
        onDeleteKeyValueHeaders(item, keyValueIdx) {
            const { props } = this;

            const idx = findIndex(props.requests, item);
            props.requests[idx].headers.splice(keyValueIdx, 1);

            this.propChanged('requests');
        },
        onDeleteKeyValueParams(item, keyValueIdx) {
            const { props } = this;

            const idx = findIndex(props.requests, item);
            props.requests[idx].params.splice(keyValueIdx, 1);

            this.propChanged('requests');
        },
        onDeleteKeyValueBody(item, keyValueIdx) {
            const { props } = this;

            const idx = findIndex(props.requests, item);
            props.requests[idx].body[item.bodyKey].data.splice(keyValueIdx, 1);

            this.propChanged('requests');
        },
        createRequest() {
            const { props } = this;

            const newReq = cloneDeep(this.RequestTemplate);
            newReq.name = `Запрос ${props.requests.length + 1}`;
            props.requests.push(newReq);

            this.propChanged('requests');
        },
        copyRequest(idx) {
            const { props } = this;

            const newReq = cloneDeep(props.requests[idx]);
            props.requests.push(newReq);

            this.propChanged('requests');
        },
        deleteRequest(idx) {
            this.props.requests.splice(idx, 1);
            this.propChanged('requests');
        },
        async onGenerateOAuthToken(data) {
            const { authUrl, clientId, clientSecret } = data;
            const authRes = await fetch(authUrl, {
                method: 'POST',
                body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const { token_type: tokenType, access_token: accessToken } = authRes.json() ?? {};

            this.props.generatedOAuthToken = `${tokenType} ${accessToken}`;
            this.propChanged('generatedOAuthToken');
        }
    }
};
</script>
<style lang="pcss" scoped>
.key-value-item {
  display: grid;
  grid-template-columns: 1fr 1fr max-content;
  gap: 16px;
  align-items: flex-end;
}
</style>
