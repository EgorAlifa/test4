import { IMAGE_SOURCE_TYPES } from '../constants';

export const DatasetPanelMixin = {
    watch: {
        dimensionsMetrics: {
            handler(dimensionsMetrics, oldDimensionsMetrics) {
                // Автоматически выбираем первое доступное поле, если поле не выбрано
                if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET) {
                    // Проверяем, что dimensionsMetrics действительно изменились
                    // При первом запуске oldDimensionsMetrics может быть undefined
                    const newStr = JSON.stringify(dimensionsMetrics || []);
                    const oldStr = oldDimensionsMetrics != null ? JSON.stringify(oldDimensionsMetrics) : null;
                    
                    if (oldStr == null || newStr !== oldStr) {
                        if (this.props.imageField == null && dimensionsMetrics && dimensionsMetrics.length > 0) {
                            // Ищем строковое поле или берем первое доступное
                            const stringField = dimensionsMetrics.find(field => {
                                const fieldName = typeof field === 'object' ? field.name : field;
                                return fieldName && typeof fieldName === 'string';
                            });
                            
                            if (stringField) {
                                const fieldName = typeof stringField === 'object' ? stringField.name : stringField;
                                // Проверяем, что поле действительно изменилось перед вызовом propChanged
                                if (this.props.imageField !== fieldName) {
                                    this.props.imageField = fieldName;
                                    this.propChanged('imageField');
                                }
                            }
                        }
                    }
                }
            },
            immediate: false
        },
        'props.imageSource': {
            handler(newSource, oldSource) {
                // При смене источника данных сбрасываем индекс только если действительно изменился
                if (oldSource != null && newSource !== oldSource && newSource === IMAGE_SOURCE_TYPES.DATASET) {
                    // Сбрасываем индекс при переходе на датасет
                    if (this.props.currentIndex !== 0) {
                        this.props.currentIndex = 0;
                        this.propChanged('currentIndex');
                    }
                }
            }
        },
        'props.imageField': {
            handler(newField, oldField) {
                // При изменении поля в панели, если есть датасет, загружаем данные
                if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET && newField && newField !== oldField) {
                    // Уведомляем компонент об изменении поля - компонент сам вызовет loadData
                    this.propChanged('imageField');
                }
            }
        }
    }
};

