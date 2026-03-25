<template>
    <w-elem>
        <w-cell-container v-bind="cellBinds" @click="onClick">
            <label v-if="props.isButtonDisplayed" :title="buttonOptions.caption.text">
                <input :type="isCheckbox ? 'checkbox' : 'radio'" :checked="isActive" class="hide" @change="onChanged" />
                <div class="btn-control" :class="btnControlClass" :style="btnControlStyle">
                    <div v-if="buttonOptions.icon.isDisplayed" class="control-icon">
                        <i :class="iconClass"></i>
                    </div>
                    <span v-if="buttonOptions.caption.isDisplayed">{{ buttonOptions.caption.text }}</span>
                </div>
            </label>

            <input
                v-else
                :checked="isActive"
                :type="isCheckbox ? 'checkbox' : 'radio'"
                :class="isCheckbox ? 'control-checkbox' : 'control-radio'"
                @change="onChanged" />
        </w-cell-container>
    </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/core';
import { resolveIconClass } from '@goodt-common/utils';

import { useTableCell, useActions, useStyleConditions, ControlType } from '../shared';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';

export default {
    extends: Elem,
    mixins: [useTableCell(), useActions(), useStyleConditions()],
    inject: ['formControl'],
    meta,
    data: () => ({
        /**
         * @public
         */
        /* Vetur HACK for type hinting */
        ...ElemInstanceTypeDescriptor
    }),
    computed: {
        /**
         * @return {string[]}
         */
        checkedFormControls() {
            return this.formControl.checked;
        },
        /**
         * @return {string|null}
         */
        // eslint-disable-next-line goodt-rules/data-boolean-key-naming
        value() {
            return this.rowData[this.props.dataField] ?? null;
        },
        /**
         * @return {boolean}
         */
        isActive() {
            return this.checkedFormControls.includes(this.value);
        },
        /**
         * @return {Record<string, any>}
         */
        controlOptions() {
            return this.props.control;
        },
        /**
         * @return {boolean}
         */
        isCheckbox() {
            return this.controlOptions.type === ControlType.CHECKBOX;
        },
        /**
         * @return {Record<string, any>}
         */
        buttonOptions() {
            const {
                isActive,
                props: { button }
            } = this;
            return isActive ? button.active : button.default;
        },
        /**
         * @return {string}
         */
        iconClass() {
            return resolveIconClass(this.buttonOptions.icon.class);
        },
        /**
         * @return {string|null}
         */
        btnControlClass() {
            const { isDisplayed, position } = this.buttonOptions.icon;
            return isDisplayed && position != null ? position : null;
        },
        /**
         * @return {Record<string, any>}
         */
        btnControlStyle() {
            const map = {
                'btn-control_font-size': 'style.fontSize',
                'btn-control_font-family': 'style.fontFamily',
                'btn-control_font-weight': 'style.fontWeight',
                'btn-control_border-radius': ['style.borderRadius', 'var(--border-radius)'],
                'btn-control_color': 'style.color',
                'btn-control_bg-color': ['style.bgColor', 'var(--color-primary)'],
                'btn-control_height': 'style.height',
                'btn-control_box-shadow': 'style.boxShadow',
                'btn-control-icon_font-size': 'icon.fontSize',
                'btn-control-icon_color': 'icon.color',
                'btn-control-icon_margin-left': ({ icon }) => icon.offset[0] ?? '0.5rem',
                'btn-control-icon_margin-right': ({ icon }) => icon.offset[1] ?? '0.5rem'
            };

            return this.$buildCssVarsStyle(map, this.buttonOptions);
        }
    },
    methods: {
        onChanged() {
            const {
                formControl,
                value,
                controlOptions,
                props: { dataField }
            } = this;
            formControl.toggleFormControl({ dataField, value, controlType: controlOptions.type });
        }
    },
    implicitCssModule: true
};
</script>
<style lang="pcss" module src="./style.pcss"></style>
