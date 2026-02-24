export const DatasetPanelMixin = {
    watch: {
        queryModel: {
            handler(value, valueOld) {
                // Можно добавить логику при изменении модели запроса
            }
        },
        queryModels: {
            handler(value, valueOld) {
                // Можно добавить логику при изменении моделей запросов
            }
        }
    }
};

