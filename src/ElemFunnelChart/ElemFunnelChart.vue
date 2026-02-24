<template>
    <w-elem :placeholder="$placeholder">
        <!-- Контейнер для ECharts -->
        <div 
            ref="chartContainer" 
            class="w-100 h-100 min-h-[400px]"
            :class="{ 'cursor-pointer': drilldownCanPush }"
        >
            <!-- Сообщение об ошибке -->
            <div v-if="hasError" class="flex items-center justify-center h-full">
                <div class="text-red-600 text-center">
                    <i class="mdi mdi-alert-circle-outline text-4xl mb-2"></i>
                    <p class="text-lg font-medium">{{ error }}</p>
                </div>
            </div>
            
            <!-- Сообщение об отсутствии данных -->
            <div v-else-if="!hasDataset || !result || !result.rows || result.rows.length === 0" 
                 class="flex items-center justify-center h-full">
                <div class="text-gray-500 text-center">
                    <i class="mdi mdi-chart-funnel text-4xl mb-2"></i>
                    <p class="text-lg">{{ !hasDataset ? 'Датасет не выбран' : 'Нет данных для отображения' }}</p>
                </div>
            </div>
            
            <!-- Лоадер -->
            <div v-else-if="isLoading" class="flex items-center justify-center h-full">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p class="text-gray-600">Загрузка данных...</p>
                </div>
            </div>
        </div>
        
        <!-- Drilldown кнопки (для демонстрации) -->
        <div v-if="showDrilldownControls" class="flex gap-2 mt-2 p-2 bg-gray-50 rounded">
            <button
                class="btn btn-sm"
                :class="{ 'btn-primary': drilldownCanPush, 'btn-secondary': !drilldownCanPush }"
                :disabled="!drilldownCanPush"
                @click="handleDrilldownPush">
                <i class="mdi mdi-drill mr-1"></i>
                Детализация: {{ drilldownCanPush ? 'доступна' : 'недоступна' }}
            </button>
            <button
                class="btn btn-sm"
                :class="{ 'btn-primary': drilldownCanPop, 'btn-secondary': !drilldownCanPop }"
                :disabled="!drilldownCanPop"
                @click="handleDrilldownPop">
                <i class="mdi mdi-arrow-left mr-1"></i>
                Назад: {{ drilldownCanPop ? 'доступно' : 'недоступно' }}
            </button>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import echarts from 'echarts';
import { 
    transformDataForFunnel, 
    createFunnelOption, 
    handleFunnelClick, 
    validateFunnelData,
    calculateContainerSize 
} from './utils';
import { ANIMATION_DURATION, ANIMATION_EASING } from './constants';
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
    
    created() {
        console.log('ElemFunnelChart created!');
    },
    
    hooks: {
        // Хук вызывается при успешной загрузке данных
        then(result) {
            this.processData(result);
        },
        // Хук вызывается при ошибке загрузки данных
        catch(error) {
            this.error = error?.message || 'Произошла ошибка при загрузке данных';
            console.error('ElemFunnelChart error:', error);
        },
        // Хук вызывается всегда после загрузки
        finally() {
            this.isLoading = false;
        }
    },
    
    data() {
        return {
            chartInstance: null,
            funnelData: [],
            error: null,
            showDrilldownControls: false, // для демонстрации, можно убрать
            selectedSegment: null,
            ...ElemDatasetMixinTypes
        };
    },
    
    computed: {
        // Проверка наличия ошибки
        hasError() {
            return this.error !== null;
        },
        
        // Состояние drilldown
        drilldownState() {
            if (!this.props.drilldownName) return { canPop: false, canPush: false };
            
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
            return this.drilldownState.canPush && this.selectedSegment !== null;
        },
        
        // Опции ECharts для funnel диаграммы
        chartOptions() {
            if (!validateFunnelData(this.funnelData)) {
                return null;
            }
            
            return createFunnelOption({
                data: this.funnelData,
                orientation: this.props.orientation,
                labelPosition: this.props.labelPosition,
                showPercentage: this.props.showPercentage,
                funnelWidth: this.props.funnelWidth,
                funnelHeight: this.props.funnelHeight,
                gap: this.props.gap,
                colorScheme: this.props.colorScheme,
                showTitle: this.props.showTitle,
                title: this.props.title || this.result?.name || 'Воронка',
                showLegend: this.props.showLegend,
                legendPosition: this.props.legendPosition
            });
        }
    },
    
    watch: {
        // Отслеживаем изменения опций и обновляем диаграмму
        chartOptions: {
            handler(newOptions) {
                if (newOptions && this.chartInstance) {
                    this.updateChart(newOptions);
                }
            },
            deep: true
        },
        
        // Отслеживаем изменения в пропсах настроек
        'props.orientation'() { this.updateChart(); },
        'props.labelPosition'() { this.updateChart(); },
        'props.showPercentage'() { this.updateChart(); },
        'props.colorScheme'() { this.updateChart(); },
        'props.showTitle'() { this.updateChart(); },
        'props.title'() { this.updateChart(); },
        'props.showLegend'() { this.updateChart(); },
        'props.legendPosition'() { this.updateChart(); }
    },
    
    mounted() {
        this.initChart();
        // Обрабатываем изменение размеров окна
        window.addEventListener('resize', this.handleResize);
    },
    
    beforeDestroy() {
        this.destroyChart();
        window.removeEventListener('resize', this.handleResize);
    },
    
    methods: {
        // IDE suggestion helper  
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,
        
        /**
         * Инициализация ECharts
         */
        initChart() {
            if (!this.$refs.chartContainer) return;
            
            try {
                this.chartInstance = echarts.init(this.$refs.chartContainer);
                
                // Обработка кликов по сегментам воронки
                this.chartInstance.on('click', this.handleChartClick);
                
                // Если есть данные, рендерим диаграмму
                if (this.chartOptions) {
                    this.updateChart(this.chartOptions);
                }
            } catch (error) {
                console.error('Ошибка инициализации ECharts:', error);
                this.error = 'Ошибка инициализации диаграммы';
            }
        },
        
        /**
         * Уничтожение ECharts инстанса
         */
        destroyChart() {
            if (this.chartInstance) {
                this.chartInstance.dispose();
                this.chartInstance = null;
            }
        },
        
        /**
         * Обновление диаграммы
         */
        updateChart(options = null) {
            if (!this.chartInstance) return;
            
            const chartOptions = options || this.chartOptions;
            if (!chartOptions) return;
            
            try {
                this.chartInstance.setOption(chartOptions, true);
            } catch (error) {
                console.error('Ошибка обновления диаграммы:', error);
                this.error = 'Ошибка обновления диаграммы';
            }
        },
        
        /**
         * Обработка данных после загрузки
         */
        processData(result) {
            this.error = null;
            
            if (!result || !result.rows || !Array.isArray(result.rows)) {
                this.error = 'Некорректный формат данных';
                return;
            }
            
            if (!this.props.metric || !this.props.dimension) {
                this.error = 'Не выбраны метрика или измерение';
                return;
            }
            
            try {
                // Трансформируем данные в формат funnel
                this.funnelData = transformDataForFunnel(
                    result.rows,
                    this.props.dimension,
                    this.props.metric,
                    this.props.sort
                );
                
                if (!validateFunnelData(this.funnelData)) {
                    this.error = 'Нет валидных данных для отображения';
                    return;
                }
                
                // Обновляем диаграмму если она инициализирована
                if (this.chartInstance && this.chartOptions) {
                    this.updateChart(this.chartOptions);
                }
                
            } catch (error) {
                console.error('Ошибка обработки данных:', error);
                this.error = 'Ошибка обработки данных';
            }
        },
        
        /**
         * Обработка клика по сегменту диаграммы
         */
        handleChartClick(params) {
            this.selectedSegment = {
                name: params.name,
                value: params.value
            };
            
            // Обработка drilldown если настроено
            if (this.props.drilldownName && this.drilldownCanPush) {
                handleFunnelClick(params, this.performDrilldown);
            }
        },
        
        /**
         * Выполнение drilldown
         */
        performDrilldown(segmentName, segmentValue) {
            const { drilldownName } = this.props;
            if (!drilldownName) return;
            
            try {
                // Коммитим значение в store
                this.$storeCommit({ [drilldownName]: segmentName });
                // Выполняем drilldown
                this.$drilldown.push(drilldownName, segmentName);
            } catch (error) {
                console.error('Ошибка drilldown:', error);
            }
        },
        
        /**
         * Обработка drilldown push (кнопка)
         */
        handleDrilldownPush() {
            if (this.selectedSegment && this.drilldownCanPush) {
                this.performDrilldown(this.selectedSegment.name, this.selectedSegment.value);
            }
        },
        
        /**
         * Обработка drilldown pop (кнопка назад)
         */
        handleDrilldownPop() {
            const { drilldownName } = this.props;
            if (!drilldownName || !this.drilldownCanPop) return;
            
            try {
                this.$drilldown.pop(drilldownName);
                this.$storeCommit({ [drilldownName]: null });
                this.selectedSegment = null;
            } catch (error) {
                console.error('Ошибка drilldown pop:', error);
            }
        },
        
        /**
         * Обработка изменения размеров окна
         */
        handleResize() {
            if (this.chartInstance) {
                try {
                    this.chartInstance.resize();
                } catch (error) {
                    console.error('Ошибка изменения размера диаграммы:', error);
                }
            }
        }
    }
};
</script>

<style scoped>
.btn {
    @apply px-3 py-1 rounded text-sm font-medium transition-colors;
}

.btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
    @apply bg-gray-300 text-gray-700 hover:bg-gray-400;
}

.btn-sm {
    @apply px-2 py-1 text-xs;
}

.btn:disabled {
    @apply opacity-50 cursor-not-allowed;
}
</style> 