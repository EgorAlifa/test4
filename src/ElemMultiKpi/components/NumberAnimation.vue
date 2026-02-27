<template>
    <span class="numbers" :style="numberCssVars">
        {{ animatedNumber }}
    </span>
</template>

<script>
export default {
    props: {
        numberCssVars: {
            type: Object,
            default: null
        },
        metricDigitCapacity: {
            type: String,
            default: 'n'
        },
        digitNumber: {
            type: String,
            default: '8'
        },
        delay: {
            type: Number,
            default: 100
        }
    },
    data() {
        return {
            animatedNumber: '438',
            numberInterval: null
        };
    },
    computed: {
        digitCapacity() {
            switch (this.metricDigitCapacity) {
                case 'n': {
                    return '';
                }
                case '0': {
                    return ' ';
                }
                case '1': {
                    return '.';
                }
                case '2': {
                    return ',';
                }
                default: {
                    return '';
                }
            }
        }
    },
    watch: {
        delay: {
            handler() {
                this.clearInterval();
                this.createInterval();
            }
        }
    },
    destroyed() {
        this.clearInterval(this.numberInterval);
    },
    created() {
        this.createInterval();
    },
    methods: {
        getNewDigitCapacity(str, formatter) {
            return String(str).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${formatter}`);
        },
        getRandomArbitrary() {
            return Math.round(Math.random() * (9 - 1));
        },
        clearInterval() {
            clearInterval(this.numberInterval);
        },
        createInterval() {
            this.numberInterval = setInterval(() => {
                let num = '';
                for (let i = 0; i < this.digitNumber; i++) {
                    num += this.getRandomArbitrary();
                }

                this.animatedNumber = this.getNewDigitCapacity(num, this.digitCapacity);
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
