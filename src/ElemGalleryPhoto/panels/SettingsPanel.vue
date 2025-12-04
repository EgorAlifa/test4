<template>
    <w-panel>
        <ui-container>
            <!-- Источник данных -->
            <div class="form-label form-label-small">Источник изображений</div>
            <ui-select 
                prop="imageSource" 
                :options="options.imageSourceOptions"
                label="Источник данных">
            </ui-select>

            <!-- Настройки для режима датасета -->
            <template v-if="props.imageSource === 'dataset'">
                <div class="form-label form-label-small mt-3">Настройки датасета</div>
                <ui-select 
                    prop="imageField" 
                    :options="fieldsOptions"
                    label="Поле с URL изображения">
                    <template #help>
                        Выберите поле из датасета, которое содержит URL изображений
                    </template>
                </ui-select>
            </template>

            <!-- Редактор массива URL для ручного режима -->
            <template v-else>
                <div class="form-label form-label-small mt-3">Массив URL изображений</div>
                <div class="images-editor">
                    <div
                        v-for="(image, index) in localImages"
                        :key="index"
                        class="image-url-item"
                    >
                        <ui-input
                            :value="image"
                            @input="updateImageUrl(index, $event.target.value)"
                            :placeholder="`URL изображения ${index + 1}`"
                            class="image-url-input"
                        >
                        </ui-input>
                        <button
                            type="button"
                            class="image-url-remove"
                            @click="removeImageUrl(index)"
                            :aria-label="`Удалить изображение ${index + 1}`"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <button
                        type="button"
                        class="image-url-add"
                        @click="addImageUrl"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Добавить изображение
                    </button>
                </div>
            </template>

            <!-- Настройки отображения -->
            <div class="form-label form-label-small mt-3">Отображение</div>
            
            <!-- Переменная для выбора изображения -->
            <div class="form-label form-label-small">Переменная для выбора изображения</div>
            <ui-input 
                prop="imageVariable" 
                label="Имя переменной"
                placeholder="Например: imageUrl или imageIndex"
            >
                <template #help>
                    Укажите имя переменной, значение которой будет использоваться для выбора изображения.
                    Переменная может содержать URL изображения или индекс изображения (начиная с 0).
                    При изменении переменной будет выбираться соответствующее изображение, но все изображения останутся доступными для переключения.
                </template>
            </ui-input>
            
            <ui-select 
                prop="imageFit" 
                :options="options.imageFitOptions"
                label="Способ заполнения">
            </ui-select>

            <ui-checkbox prop="showArrows" label="Показывать стрелки навигации"></ui-checkbox>

            <ui-has-panel v-if="props.showArrows">
                <div class="form-label form-label-small mt-3">Настройки стрелок</div>
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки стрелок', slot: 'arrows' }]">
                        <template #arrows>
                            <ui-container>
                                <ui-input-cp prop="arrowColor" label="Цвет стрелок"></ui-input-cp>
                                <ui-input-cp prop="arrowBackgroundColor" label="Цвет фона стрелок"></ui-input-cp>
                                <ui-input-units
                                    col-size="6-12"
                                    min="24"
                                    max="96"
                                    :units="FontSizeFirstPxUnits"
                                    v-model="arrowSizeString"
                                    @change="saveArrowSize">
                                    Размер стрелок
                                </ui-input-units>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-checkbox prop="showIndicators" label="Показывать индикаторы"></ui-checkbox>

            <ui-has-panel v-if="props.showIndicators">
                <template #panel>
                    <ui-panel :groups="[{ name: 'Настройки индикаторов', slot: 'indicators' }]">
                        <template #indicators>
                            <ui-container>
                                <ui-input-cp prop="indicatorColor" label="Цвет индикаторов"></ui-input-cp>
                            </ui-container>
                        </template>
                    </ui-panel>
                </template>
            </ui-has-panel>

            <ui-checkbox prop="enableSwipe" label="Поддержка свайпов"></ui-checkbox>

            <div class="form-label form-label-small mt-3">Дополнительно</div>
            <ui-input 
                type="number" 
                min="0" 
                max="2000"
                prop="transitionDuration" 
                label="Длительность перехода (мс)">
            </ui-input>

            <ui-checkbox prop="showLoading" label="Показывать лоадер"></ui-checkbox>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';
import { imageSourceOptions, imageFitOptions } from '../config';
import { IMAGE_SOURCE_TYPES } from '../constants';

const FontSizeFirstPxUnits = ['px', 'rem', 'em', '%'];

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    static: {
        FontSizeFirstPxUnits
    },

    data() {
        return {
            localImages: [],
            saveImagesTimer: null,
            isSavingImages: false // Флаг для предотвращения синхронизации при сохранении
        };
    },

    beforeDestroy() {
        // Очищаем таймер при уничтожении компонента
        if (this.saveImagesTimer) {
            clearTimeout(this.saveImagesTimer);
        }
    },

    computed: {
        ...PanelDatasetMixinTypes,

        options() {
            return {
                imageSourceOptions,
                imageFitOptions
            };
        },

        fieldsOptions() {
            // Комбинируем измерения и метрики для выбора поля
            const allFields = [...(this.dimensions || []), ...(this.metrics || [])];
            return this.buildOptions(allFields, { empty: true });
        },

        arrowSizeString: {
            get() {
                const defaultSize = 48; // eslint-disable-line no-magic-numbers
                const arrowSize = this.props.arrowSize || { size: defaultSize, unit: 'px' };
                return `${arrowSize.size}${arrowSize.unit}`;
            },
            set(val) {
                if (typeof val === 'string') {
                    const match = val.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
                    if (match != null) {
                        this.props.arrowSize = { size: parseFloat(match[1]), unit: match[2] };
                    }
                } else if (val != null && typeof val === 'object') {
                    this.props.arrowSize = val;
                }
            }
        }
    },

    watch: {
        'props.imageSource': {
            handler(newSource) {
                // При смене источника данных синхронизируем локальный массив
                if (newSource === IMAGE_SOURCE_TYPES.MANUAL) {
                    this.syncLocalImages();
                }
            }
        },

        'props.images': {
            handler(newImages, oldImages) {
                // Синхронизируем локальный массив при изменении props только если действительно изменились
                // И если мы не сохраняем данные сами (чтобы не перезаписать при добавлении нового элемента)
                // И если localImages не длиннее props.images (значит нет новых элементов)
                if (this.props.imageSource === IMAGE_SOURCE_TYPES.MANUAL && !this.isSavingImages) {
                    // Проверяем, что массив действительно изменился
                    const newImagesStr = JSON.stringify(newImages || []);
                    const oldImagesStr = JSON.stringify(oldImages || []);
                    if (newImagesStr !== oldImagesStr) {
                        // Если localImages длиннее props.images, значит есть новые пустые строки - не синхронизируем полностью
                        const propsImages = Array.isArray(newImages) ? newImages : [];
                        if (this.localImages.length <= propsImages.length) {
                            this.syncLocalImages();
                        }
                    }
                }
            },
            immediate: true
        }
    },

    mounted() {
        this.syncLocalImages();
    },

    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes,

        syncLocalImages() {
            // Копируем массив изображений в локальное состояние
            // НЕ синхронизируем если localImages длиннее props.images (значит добавили новые элементы)
            const propsImages = Array.isArray(this.props.images) ? this.props.images : [];
            
            // Если localImages содержит больше элементов, чем props.images, не синхронизируем полностью
            // Это означает что пользователь добавил новые элементы (пустые строки)
            if (this.localImages.length > propsImages.length) {
                // Обновляем только существующие элементы из props, сохраняя новые пустые строки в конце
                const updated = [...this.localImages];
                propsImages.forEach((url, index) => {
                    if (index < updated.length) {
                        updated[index] = url;
                    }
                });
                this.localImages = updated;
            } else {
                // Если длин одинаковые или props длиннее, полностью синхронизируем
                this.localImages = [...propsImages];
            }
        },

        addImageUrl() {
            this.localImages.push('');
            // Не сохраняем сразу, так как это пустая строка - пользователь еще не ввел URL
        },

        removeImageUrl(index) {
            if (index >= 0 && index < this.localImages.length) {
                this.localImages.splice(index, 1);
                // Сохраняем сразу при удалении, так как это явное действие пользователя
                this.saveImages();
            }
        },

        updateImageUrl(index, url) {
            if (index >= 0 && index < this.localImages.length) {
                this.localImages[index] = url || '';
                // Используем debounce для сохранения, чтобы не вызывать propChanged при каждом символе
                if (this.saveImagesTimer) {
                    clearTimeout(this.saveImagesTimer);
                }
                this.saveImagesTimer = setTimeout(() => {
                    this.saveImages();
                }, 300); // eslint-disable-line no-magic-numbers
            }
        },

        saveImages() {
            // Устанавливаем флаг, чтобы watch не перезаписывал localImages
            this.isSavingImages = true;
            
            // Фильтруем пустые значения перед сохранением
            const filteredImages = this.localImages.filter(url => url && url.trim() !== '');
            const currentImages = Array.isArray(this.props.images) ? this.props.images : [];
            
            // Проверяем, что массив действительно изменился перед вызовом propChanged
            const filteredStr = JSON.stringify(filteredImages);
            const currentStr = JSON.stringify(currentImages);
            
            if (filteredStr !== currentStr) {
                this.props.images = filteredImages;
                this.propChanged('images');
            }
            
            // Сбрасываем флаг после небольшой задержки, чтобы watch успел обработать изменения
            this.$nextTick(() => {
                this.isSavingImages = false;
            });
        },

        saveArrowSize() {
            this.propChanged('arrowSize');
        }
    }
};
</script>

<style lang="pcss" scoped>
.images-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.image-url-item {
    display: flex;
    gap: 8px;
    align-items: center;
}

.image-url-input {
    flex: 1;
}

.image-url-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.image-url-remove:hover {
    background-color: #dc2626;
}

.image-url-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;
}

.image-url-add:hover {
    background-color: #2563eb;
}

.image-url-add svg {
    flex-shrink: 0;
}
</style>

