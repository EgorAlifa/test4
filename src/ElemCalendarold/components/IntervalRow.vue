<template>
    <div class="interval-row">
        <ui-select v-model="row.date" placeholder="дд" :options="dateOptions" @change="onSaveRow"></ui-select>
        <ui-select v-model="row.month" placeholder="месяц" :options="RussianMonths" @change="onSaveRow"></ui-select>
        <ui-input
            v-model="row.year"
            placeholder="год"
            maxlength="4"
            @keypress="onSetYear"
            @change="onSaveRow"></ui-input>
        <i class="interval-row__clear" @click="onClearInterval"></i>
    </div>
</template>

<script>
import { PanelUi } from '@goodt-wcore/components';
import { cloneDeep } from 'lodash';
import { dayjs, monthNumber } from '../utils';
import { KeyCodes, DateMeasurements, RussianMonths } from '../constants';

export default {
    components: { ...PanelUi },
    props: {
        value: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            row: {}
        };
    },
    static: {
        RussianMonths
    },
    computed: {
        dateOptions() {
            const { month, year } = this.row;
            const monthNum = monthNumber(month);
            const adaptYear = year || String(new Date().getFullYear());
            const daysInMonth = dayjs(`${adaptYear}-${monthNum}-01`).daysInMonth() || 31;
            return Array.from({ length: daysInMonth }, (_, idx) => `0${idx + 1}`.slice(-2));
        }
    },
    watch: {
        value: {
            handler(value) {
                this.row = cloneDeep(value);
            },
            immediate: true
        }
    },
    methods: {
        onSetYear(event) {
            if (/\d/i.test(event.key) === false) {
                event.preventDefault();
            }
            if (event.keyCode === KeyCodes.ENTER) {
                this.onSaveRow();
            }
        },
        onClearInterval() {
            DateMeasurements.forEach((field) => {
                this.row[field] = null;
            });
            this.onSaveRow();
        },
        onSaveRow() {
            this.$emit('change', this.row);
        }
    },

    implicitCssModule: true
};
</script>

<style src="../style.pcss" lang="pcss" module></style>
