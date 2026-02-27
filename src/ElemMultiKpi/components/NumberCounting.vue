<template>
    <span class="numbers" :style="numberCssVars">
        {{ computedValue }}
    </span>
</template>

<script>
export default {
    props: {
        numberCssVars: {
            type: Object,
            default: null
        },
        value: {
            type: String,
            default: '0'
        },
        delay: {
            type: Number,
            default: 100
        }
    },
    data() {
        return {
            computedValue: '',
            numberInterval: null
        };
    },
    watch: {
        delay: {
            handler() {
                clearInterval(this.numberInterval);
                this.setNumberInterval();
            }
        }
    },
    destroyed() {
        clearInterval(this.numberInterval);
    },
    created() {
        this.setNumberInterval();
    },
    methods: {
        setNumberInterval() {
            const numericValue = parseFloat(this.value);
            let count = 0;

            this.numberInterval = setInterval(() => {
                count += numericValue > 0 ? 1 : -1;
                this.computedValue = String(count);

                if (this.numberInterval != null && count === numericValue) {
                    clearInterval(this.numberInterval);
                }
            }, this.delay);
        }
    },
    implicitCssModule: true
};
</script>

<style module lang="pcss">
.numbers {
    line-height: var(--w-numbers_line-height);
    white-space: normal;
    display: inline-flex;

    font-size: var(--w-numbers_font-size);
    color: var(--w-numbers_color);
}
.numbers-window {
    display: inline-block;
    overflow: hidden;
    height: 1em;
}
.numbers-window-symbol {
    font: inherit;
    overflow: inherit;
}
@keyframes counting {
    100% {
        transform: translate3d(0, -10em, 0);
    }
}
</style>
