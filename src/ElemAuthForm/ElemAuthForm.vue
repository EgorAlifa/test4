<template>
    <w-elem>
        <form class="ui-form" @submit.prevent="onSubmit">
            <div class="form-control" v-for="(info, key) in form.data" :key="key">
                <div class="form-label form-label-small">{{ props.labels[key] }}</div>
                <input
                    class="input w-100"
                    :class="{ invalid: !formValidation[key] && info.touched }"
                    :type="info.type"
                    v-model="info.value"
                    @input="setFieldTouched(key, true)" />
            </div>
            <transition>
                <div class="alert alert-error alert-body text-small" v-if="form.error">
                    <i class="mdi mdi-close close" @click="resetError"></i>
                    <div class="pad-right-l1">
                        {{ form.error }}
                    </div>
                </div>
            </transition>
            <div class="ui-form__footer">
                <button
                    class="btn btn-primary"
                    :class="{ 'disabled btn-loading': form.state === FormState.LOADING, disabled: !isFormValid }">
                    <div class="label">{{ props.labels.submit }}</div>
                    <div class="icon" v-if="props.layout.btnIcon"><i class="mdi mdi-chevron-right"></i></div>
                </button>
            </div>
        </form>
    </w-elem>
</template>
<script>
import { AuthManager, RouteManager } from '@goodt-wcore/managers';
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { FormState } from './constants';

export default {
    extends: Elem,
    meta,
    static: {
        FormState
    },
    data: () => ({
        form: {
            state: FormState.DEFAULT,
            error: null,
            data: {
                username: { value: '', type: 'text', touched: false },
                password: { value: '', type: 'password', touched: false }
            }
        }
    }),
    computed: {
        /**
         * @return {boolean}
         */
        isAdapterReady() {
            return AuthManager.instance.adapter != null;
        },
        /**
         * @return {boolean}
         */
        formValidation() {
            const isValid = (str) => str.length > 1;

            return Object.entries(this.form.data).reduce(
                (acc, [key, { value }]) => ({ ...acc, [key]: isValid(value) }),
                {}
            );
        },
        /**
         * @return {boolean}
         */ isFormValid() {
            return Object.values(this.formValidation).every((val) => val);
        }
    },
    created() {
        this.handleAuthenticatedState();
    },
    methods: {
        ...ElemInstanceTypeDescriptor,

        async onSubmit() {
            /** @type {{ adapter:import('@goodt-common/auth/adapters/Adapter').default}} */
            const { adapter } = AuthManager.instance;
            const { form, isFormValid } = this;
            const wait = () => new Promise((r) => setTimeout(r, 1000));

            if (!isFormValid) {
                return;
            }

            form.state = FormState.LOADING;
            form.error = null;
            try {
                const { username, password } = form.data;
                await wait();
                await adapter.login({ username: username.value, password: password.value });
                this.handleAuthenticatedState();
            } catch (error) {
                form.error = this.props.labels.error;
            } finally {
                form.state = FormState.DEFAULT;
            }
        },
        resetError() {
            this.form.error = null;
        },
        /**
         * @param {string} key
         * @param {boolean} val
         */
        setFieldTouched(key, val) {
            this.form.data[key].touched = val;
        },
        handleAuthenticatedState() {
            /** @type {{ adapter:import('@goodt-common/auth/adapters/Adapter').default}} */
            const { adapter } = AuthManager.instance;

            if (!adapter.authenticated) {
                return;
            }

            const { successPath: path = '/' } = this.props;
            RouteManager.instance.navigate({ path });
        }
    }
};
</script>
<style lang="pcss" scoped src="./style.pcss"></style>
