// DatasetPanelMixin для расширения поведения стандартной DatasetPanel.vue
export const DatasetPanelMixin = {
    data: (vm) => ({
        // Дополнительные данные для панели
    }),
    
    computed: {
        // Дополнительные computed свойства для панели
    },
    
    methods: {
        // Дополнительные методы для панели
        
        /**
         * Валидация настроек виджета
         */
        validateSettings() {
            const errors = [];
            
            if (!this.props.metric) {
                errors.push('Не выбрана метрика для значений воронки');
            }
            
            if (!this.props.dimension) {
                errors.push('Не выбрано измерение для названий этапов');
            }
            
            return errors;
        },
        
        /**
         * Получение рекомендуемых настроек на основе данных
         */
        getRecommendedSettings() {
            const recommendations = {};
            
            // Рекомендуем сортировку по убыванию для воронки
            if (!this.props.sort || this.props.sort === 'none') {
                recommendations.sort = 'descending';
                recommendations.reason = 'Рекомендуется сортировка по убыванию для воронок';
            }
            
            // Рекомендуем показывать проценты
            if (!this.props.showPercentage) {
                recommendations.showPercentage = true;
                recommendations.reason = 'Проценты помогают понять долю каждого этапа';
            }
            
            return recommendations;
        }
    }
};

export default DatasetPanelMixin; 