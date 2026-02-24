<template>
    <w-elem :placeholder="shouldShowCustomEmptyState ? false : $placeholder">
        <!-- Loading state -->
        <div v-if="isLoading && props.showLoading" class="gallery-loading">
            <div class="loading-spinner"></div>
            <p class="loading-text">Загрузка изображений...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="shouldShowCustomEmptyState" class="gallery-empty-state">
            <div class="empty-state-content">
                <svg class="empty-state-icon" width="240" height="240" viewBox="0 0 240 240" fill="none">
                    <circle cx="120" cy="120" r="100" fill="currentColor" opacity="0.04"/>
                    <rect x="50" y="60" width="140" height="120" rx="6" 
                          stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/>
                    <path d="M70 90 L170 90 M120 60 L120 180" stroke="currentColor" stroke-width="2" opacity="0.2"/>
                </svg>
                <div class="empty-state-title">Нет изображений</div>
                <div class="empty-state-description">{{ emptyStateMessage }}</div>
            </div>
        </div>

        <!-- Gallery content -->
        <div v-else-if="imagesList.length > 0" class="gallery-container" @keydown="handleKeydown" style="pointer-events: auto;">
            <!-- Current image -->
            <div class="gallery-image-wrapper">
                <img
                    v-if="currentImageUrl"
                    :key="`image-${currentIndex}-${imageKey}-${currentImageUrl}`"
                    :src="currentImageUrl"
                    :alt="`Изображение ${currentIndex + 1} из ${imagesList.length}`"
                    :style="imageStyle"
                    class="gallery-image"
                    @load="handleImageLoad"
                    @error="handleImageError"
                    @touchstart="handleTouchStart"
                    @touchmove="handleTouchMove"
                    @touchend="handleTouchEnd"
                >
                
                <!-- Loading overlay for current image -->
                <div v-if="isImageLoading && props.showLoading" class="image-loading-overlay">
                    <div class="image-loading-spinner"></div>
                </div>
            </div>

            <!-- Navigation arrows -->
            <button
                v-if="props.showArrows && canGoPrev"
                class="gallery-arrow gallery-arrow-left"
                :style="arrowLeftStyle"
                @click.stop.prevent="prevImage"
                @mousedown.stop.prevent="handleMouseDown"
                @touchstart.stop.prevent="prevImage"
                tabindex="0"
                type="button"
                :aria-label="'Предыдущее изображение'"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            <button
                v-if="props.showArrows && canGoNext"
                class="gallery-arrow gallery-arrow-right"
                :style="arrowRightStyle"
                @click.stop.prevent="nextImage"
                @mousedown.stop.prevent="handleMouseDown"
                @touchstart.stop.prevent="nextImage"
                tabindex="0"
                type="button"
                :aria-label="'Следующее изображение'"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            <!-- Indicators -->
            <div v-if="props.showIndicators && imagesList.length > 1" class="gallery-indicators">
                <button
                    v-for="(image, index) in imagesList"
                    :key="index"
                    class="gallery-indicator"
                    :class="{ 'gallery-indicator-active': index === currentIndex }"
                    :style="{ ...indicatorStyle(index), pointerEvents: 'auto', position: 'relative', zIndex: 1000 }"
                    @click.stop.prevent="goToImage(index)"
                    @mousedown.stop.prevent="handleMouseDown"
                    @touchstart.stop.prevent="goToImage(index)"
                    tabindex="0"
                    type="button"
                    :aria-label="`Перейти к изображению ${index + 1}`"
                >
                </button>
            </div>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { extractImagesFromDataset, filterValidImages } from './utils';
import { IMAGE_SOURCE_TYPES, DEFAULT_CURRENT_INDEX } from './constants';

const DatasetMixin = useElemDatasetMixin({
    drilldown: false,
    panel: false
});

export default {
    extends: Elem,
    mixins: [DatasetMixin],

    meta,

    hooks: {
        before(cancel) {
            // Устанавливаем перехват fetch и XMLHttpRequest один раз для всех запросов к dataset API
            if (!window._galleryFetchIntercepted) {
                window._galleryFetchIntercepted = true;
                const self = this;
                
                // Функция для обработки тела запроса с фильтрами
                const processRequestBody = function(body, source) {
                    try {
                        const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
                        
                        // Проверяем наличие фильтров в теле запроса
                        if (parsedBody && parsedBody.query) {
                            const filters = (parsedBody.query.query && parsedBody.query.query.$filters) || parsedBody.query.$filters || [];
                            
                            if (filters && filters.length > 0) {
                                console.log(`[Gallery] ${source} intercept - found filters in request body`, { 
                                    filters, 
                                    body: parsedBody 
                                }); // eslint-disable-line no-console
                                
                                // Сохраняем значение фильтра
                                filters.forEach((filter) => {
                                    if (filter.id && filter.id.$eq && Array.isArray(filter.id.$eq) && filter.id.$eq.length > 0) {
                                        self._pendingFilterValue = filter.id.$eq[0];
                                        self._pendingFilterField = 'id';
                                        console.log(`[Gallery] ${source} intercept - saved filter value`, { 
                                            filterValue: filter.id.$eq[0], 
                                            filterField: 'id' 
                                        }); // eslint-disable-line no-console
                                    }
                                });
                                
                                // Удаляем фильтры из тела запроса
                                if (parsedBody.query.query && parsedBody.query.query.$filters) {
                                    parsedBody.query.query.$filters = [];
                                    console.log(`[Gallery] ${source} intercept - removed filters from query.query.$filters`); // eslint-disable-line no-console
                                } else if (parsedBody.query.$filters) {
                                    parsedBody.query.$filters = [];
                                    console.log(`[Gallery] ${source} intercept - removed filters from query.$filters`); // eslint-disable-line no-console
                                }
                                
                                // Возвращаем обновленное тело запроса
                                return typeof body === 'string' ? JSON.stringify(parsedBody) : parsedBody;
                            }
                        }
                    } catch (e) {
                        console.log(`[Gallery] ${source} intercept - error parsing body`, { error: e }); // eslint-disable-line no-console
                    }
                    
                    return body;
                };
                
                // Перехватываем fetch
                const originalFetch = window.fetch;
                window.fetch = async function(...args) {
                    const [url, options] = args;
                    
                    // Логируем все запросы для отладки
                    if (options && options.body) {
                        console.log(`[Gallery] Fetch intercept - checking request`, { 
                            url: typeof url === 'string' ? url : url?.href || url?.toString(),
                            hasBody: !!options.body 
                        }); // eslint-disable-line no-console
                    }
                    
                    // Проверяем любой запрос с body (не только /dataset/data)
                    if (options && options.body) {
                        const processedBody = processRequestBody(options.body, 'Fetch');
                        if (processedBody !== options.body) {
                            options.body = processedBody;
                            console.log(`[Gallery] Fetch intercept - updated request body without filters`); // eslint-disable-line no-console
                        }
                    }
                    
                    return originalFetch.apply(this, args);
                };
                
                // Перехватываем XMLHttpRequest
                const originalXHROpen = XMLHttpRequest.prototype.open;
                const originalXHRSend = XMLHttpRequest.prototype.send;
                
                XMLHttpRequest.prototype.open = function(method, url, ...args) {
                    this._galleryUrl = url;
                    return originalXHROpen.apply(this, [method, url, ...args]);
                };
                
                XMLHttpRequest.prototype.send = function(body) {
                    // Логируем все запросы для отладки
                    if (body) {
                        console.log(`[Gallery] XHR intercept - checking request`, { 
                            url: this._galleryUrl,
                            hasBody: !!body 
                        }); // eslint-disable-line no-console
                    }
                    
                    // Обрабатываем body если есть
                    if (body) {
                        const processedBody = processRequestBody(body, 'XHR');
                        if (processedBody !== body) {
                            body = processedBody;
                            console.log(`[Gallery] XHR intercept - updated request body without filters`); // eslint-disable-line no-console
                        }
                    }
                    
                    return originalXHRSend.apply(this, [body]);
                };
                
                console.log(`[Gallery] Fetch and XHR intercept installed`); // eslint-disable-line no-console
            }
            
            // Перехватываем запрос ТОЛЬКО если есть фильтры (для фильтрации)
            console.log('[Gallery] hooks.before called', { 
                requestsLength: this.requests?.length || 0,
                requests: this.requests
            }); // eslint-disable-line no-console
            
            if (this.requests && Array.isArray(this.requests)) {
                this.requests.forEach((request, index) => {
                    if (!request) {
                        return;
                    }

                    console.log(`[Gallery] Processing request ${index}`, { request }); // eslint-disable-line no-console

                    // Всегда оборачиваем send(), даже если фильтров нет сейчас - они могут появиться позже
                    const originalSend = request.send;
                    const self = this;
                    
                    // Сохраняем оригинальный send только один раз
                    if (!request._originalSend) {
                        request._originalSend = originalSend;
                    }
                    
                    // Обертываем modifyQuery если он есть, чтобы предотвратить добавление фильтров обратно
                    if (typeof request.modifyQuery === 'function' && !request._originalModifyQuery) {
                        request._originalModifyQuery = request.modifyQuery;
                        request.modifyQuery = function(query) {
                            const modified = request._originalModifyQuery.call(this, query);
                            if (modified) {
                                console.log(`[Gallery] Request ${index} - modifyQuery called`, { 
                                    modified,
                                    filtersBefore: modified.query?.$filters || modified.$filters
                                }); // eslint-disable-line no-console
                                
                                // Удаляем фильтры из результата modifyQuery
                                if (modified.query && modified.query.$filters) {
                                    modified.query.$filters = [];
                                    console.log(`[Gallery] Request ${index} - removed filters from modifyQuery result`); // eslint-disable-line no-console
                                } else if (modified.$filters) {
                                    modified.$filters = [];
                                    console.log(`[Gallery] Request ${index} - removed filters from modifyQuery result`); // eslint-disable-line no-console
                                }
                                
                                console.log(`[Gallery] Request ${index} - modifyQuery result after cleanup`, { 
                                    filtersAfter: modified.query?.$filters || modified.$filters
                                }); // eslint-disable-line no-console
                            }
                            return modified;
                        };
                    }
                    
                    // Используем Proxy для перехвата изменений вложенного query объекта
                    // Не заменяем request.query (он может быть read-only), а проксируем вложенный объект
                    if (request.query && request.query.query && !request.query.query._galleryProxy) {
                        const nestedQuery = request.query.query;
                        const nestedProxy = new Proxy(nestedQuery, {
                            set(target, prop, value) {
                                if (prop === '$filters' && Array.isArray(value) && value.length > 0) {
                                    console.log(`[Gallery] Request ${index} - Proxy intercepting query.query.$filters assignment`, { 
                                        filters: value 
                                    }); // eslint-disable-line no-console
                                    // Сохраняем значение фильтра
                                    value.forEach((filter) => {
                                        if (filter.id && filter.id.$eq && Array.isArray(filter.id.$eq) && filter.id.$eq.length > 0) {
                                            self._pendingFilterValue = filter.id.$eq[0];
                                            self._pendingFilterField = 'id';
                                        }
                                    });
                                    // Удаляем фильтры - устанавливаем пустой массив
                                    value = [];
                                    console.log(`[Gallery] Request ${index} - Proxy removed filters from query.query.$filters`); // eslint-disable-line no-console
                                }
                                return Reflect.set(target, prop, value);
                            }
                        });
                        // Заменяем вложенный объект на проксированный
                        request.query.query = nestedProxy;
                        nestedQuery._galleryProxy = true;
                        console.log(`[Gallery] Request ${index} - Proxy installed for query.query`); // eslint-disable-line no-console
                    }
                    
                    request.send = async function(...args) {
                        console.log(`[Gallery] Request ${index} - send() called, modifying query`); // eslint-disable-line no-console
                        
                        // Получаем АКТУАЛЬНЫЙ query перед отправкой
                        let currentQuery = null;
                        
                        if (request.query) {
                            currentQuery = request.query;
                        } else if (typeof request.getQuery === 'function') {
                            currentQuery = request.getQuery();
                        } else if (request._query) {
                            currentQuery = request._query;
                        }
                        
                        console.log(`[Gallery] Request ${index} - current query in send()`, { 
                            currentQuery,
                            hasQueryProperty: !!currentQuery?.query,
                            filtersInQuery: currentQuery?.query?.$filters || currentQuery?.$filters,
                            filtersLength: (currentQuery?.query?.$filters || currentQuery?.$filters || []).length,
                            filters: currentQuery?.query?.$filters || currentQuery?.$filters,
                            queryStructure: currentQuery ? Object.keys(currentQuery) : []
                        }); // eslint-disable-line no-console
                        
                        if (currentQuery) {
                            // Проверяем фильтры в актуальном query
                            const filters = (currentQuery.query && currentQuery.query.$filters) || currentQuery.$filters || [];
                            
                            if (filters && filters.length > 0) {
                                console.log(`[Gallery] Request ${index} - found filters in send()`, { filters }); // eslint-disable-line no-console
                                
                                let filterValue = null;
                                let filterField = null;
                                
                                filters.forEach((filter) => {
                                    if (filter.id && filter.id.$eq && Array.isArray(filter.id.$eq) && filter.id.$eq.length > 0) {
                                        filterValue = filter.id.$eq[0];
                                        filterField = 'id';
                                    } else {
                                        Object.keys(filter).forEach((fieldName) => {
                                            if (filter[fieldName] && filter[fieldName].$eq && Array.isArray(filter[fieldName].$eq) && filter[fieldName].$eq.length > 0) {
                                                filterValue = filter[fieldName].$eq[0];
                                                filterField = fieldName;
                                            }
                                        });
                                    }
                                });
                                
                                if (filterValue != null) {
                                    self._pendingFilterValue = filterValue;
                                    self._pendingFilterField = filterField;
                                    console.log(`[Gallery] Request ${index} - saved filter value`, { filterValue, filterField }); // eslint-disable-line no-console
                                }
                                
                                // Удаляем фильтры напрямую из всех возможных мест
                                // Модифицируем currentQuery напрямую
                                if (currentQuery.query && currentQuery.query.$filters) {
                                    console.log(`[Gallery] Request ${index} - removing filters from currentQuery.query.$filters`, { 
                                        before: currentQuery.query.$filters 
                                    }); // eslint-disable-line no-console
                                    currentQuery.query.$filters = [];
                                    console.log(`[Gallery] Request ${index} - removed filters from currentQuery.query.$filters`, { 
                                        after: currentQuery.query.$filters 
                                    }); // eslint-disable-line no-console
                                } else if (currentQuery.$filters) {
                                    console.log(`[Gallery] Request ${index} - removing filters from currentQuery.$filters`, { 
                                        before: currentQuery.$filters 
                                    }); // eslint-disable-line no-console
                                    currentQuery.$filters = [];
                                    console.log(`[Gallery] Request ${index} - removed filters from currentQuery.$filters`, { 
                                        after: currentQuery.$filters 
                                    }); // eslint-disable-line no-console
                                }
                                
                                // Модифицируем request.query напрямую
                                if (request.query) {
                                    if (request.query.query && request.query.query.$filters) {
                                        console.log(`[Gallery] Request ${index} - removing filters from request.query.query.$filters`, { 
                                            before: request.query.query.$filters 
                                        }); // eslint-disable-line no-console
                                        request.query.query.$filters = [];
                                        console.log(`[Gallery] Request ${index} - removed filters from request.query.query.$filters`); // eslint-disable-line no-console
                                    } else if (request.query.$filters) {
                                        console.log(`[Gallery] Request ${index} - removing filters from request.query.$filters`, { 
                                            before: request.query.$filters 
                                        }); // eslint-disable-line no-console
                                        request.query.$filters = [];
                                        console.log(`[Gallery] Request ${index} - removed filters from request.query.$filters`); // eslint-disable-line no-console
                                    }
                                }
                                
                                // Модифицируем request._query напрямую
                                if (request._query) {
                                    if (request._query.query && request._query.query.$filters) {
                                        console.log(`[Gallery] Request ${index} - removing filters from request._query.query.$filters`, { 
                                            before: request._query.query.$filters 
                                        }); // eslint-disable-line no-console
                                        request._query.query.$filters = [];
                                        console.log(`[Gallery] Request ${index} - removed filters from request._query.query.$filters`); // eslint-disable-line no-console
                                    } else if (request._query.$filters) {
                                        console.log(`[Gallery] Request ${index} - removing filters from request._query.$filters`, { 
                                            before: request._query.$filters 
                                        }); // eslint-disable-line no-console
                                        request._query.$filters = [];
                                        console.log(`[Gallery] Request ${index} - removed filters from request._query.$filters`); // eslint-disable-line no-console
                                    }
                                }
                                
                                // Если есть метод getQuery, проверяем что он возвращает очищенный query
                                if (typeof request.getQuery === 'function') {
                                    const queryFromGet = request.getQuery();
                                    if (queryFromGet) {
                                        if (queryFromGet.query && queryFromGet.query.$filters) {
                                            queryFromGet.query.$filters = [];
                                        } else if (queryFromGet.$filters) {
                                            queryFromGet.$filters = [];
                                        }
                                    }
                                }
                                
                                // Проверяем финальное состояние
                                const finalQuery = request.query || request._query || currentQuery;
                                const finalFilters = (finalQuery?.query?.$filters || finalQuery?.$filters || []);
                                console.log(`[Gallery] Request ${index} - final state before send`, { 
                                    currentQueryFilters: currentQuery?.query?.$filters || currentQuery?.$filters,
                                    requestQueryFilters: request.query?.query?.$filters || request.query?.$filters,
                                    requestQueryQueryFilters: request._query?.query?.$filters || request._query?.$filters,
                                    finalFilters,
                                    finalFiltersLength: finalFilters.length
                                }); // eslint-disable-line no-console
                            } else {
                                console.log(`[Gallery] Request ${index} - no filters found in send()`); // eslint-disable-line no-console
                            }
                        }

                        // Вызываем оригинальный send
                        const originalSendToCall = request._originalSend || originalSend;
                        console.log(`[Gallery] Request ${index} - calling original send()`); // eslint-disable-line no-console
                        
                        const result = await originalSendToCall.apply(this, args);
                        
                        // Проверяем query после вызова send (на случай если он изменился)
                        const queryAfterSend = request.query || request._query || currentQuery;
                        const filtersAfterSend = (queryAfterSend?.query?.$filters || queryAfterSend?.$filters || []);
                        if (filtersAfterSend && filtersAfterSend.length > 0) {
                            console.log(`[Gallery] Request ${index} - WARNING: filters found AFTER send() call`, { 
                                filtersAfterSend 
                            }); // eslint-disable-line no-console
                        }
                        
                        return result;
                    };
                });
            }
        },
        then(results) {
            console.log('[Gallery] hooks.then called', { 
                resultsLength: results?.length || 0,
                resultsType: Array.isArray(results) ? 'array' : typeof results,
                imageSource: this.props.imageSource,
                imageField: this.props.imageField,
                pendingFilterValue: this._pendingFilterValue,
                pendingFilterField: this._pendingFilterField
            }); // eslint-disable-line no-console
            
            // Обрабатываем результаты датасета
            if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET) {
                // results может быть объектом с rows или массивом объектов
                const images = extractImagesFromDataset(results, this.props.imageField);
                console.log('[Gallery] Extracted images from dataset', { 
                    imagesLength: images.length,
                    images: images.slice(0, 3) // Первые 3 для отладки
                }); // eslint-disable-line no-console
                
                this.datasetImages = images;
                
                // При изменении списка изображений (например, при фильтрации)
                // проверяем, выходит ли текущий индекс за границы
                if (images.length > 0) {
                    // Если индекс выходит за границы, устанавливаем его в последний доступный индекс
                    // вместо сброса на 0, чтобы сохранить контекст фильтрации
                    if (this.props.currentIndex >= images.length) {
                        this.props.currentIndex = images.length - 1;
                        this.propChanged('currentIndex');
                    } else if (this.props.currentIndex < 0) {
                        this.props.currentIndex = DEFAULT_CURRENT_INDEX;
                        this.propChanged('currentIndex');
                    }
                    // Если индекс в пределах границ, оставляем его как есть (для фильтрации)
                } else {
                    // Если изображений нет, устанавливаем индекс в 0
                    this.props.currentIndex = 0;
                    this.propChanged('currentIndex');
                }

                // Используем значение фильтра для выбора изображения после загрузки данных
                if (this._pendingFilterValue != null && images.length > 0) {
                    this.$nextTick(() => {
                        let targetIndex = -1;
                        const filterValue = this._pendingFilterValue;
                        const filterField = this._pendingFilterField;
                        
                        // Ищем по ID строки (если есть поле id в данных)
                        if (filterField === 'id') {
                            // Пробуем интерпретировать как индекс
                            const numValue = Number(filterValue);
                            if (!isNaN(numValue) && numValue >= 0) {
                                // Если значение похоже на индекс (например, "1.0" -> 1)
                                // Но нужно вычесть 1, так как индексы обычно начинаются с 0
                                // Проверяем, не является ли это уже индексом (если значение меньше длины списка)
                                targetIndex = Math.floor(numValue);
                                // Если значение слишком большое, возможно это ID, а не индекс
                                if (targetIndex >= images.length) {
                                    targetIndex = -1;
                                }
                            }
                        }

                        // Если не нашли по ID, пробуем найти по URL изображения
                        if (targetIndex === -1) {
                            targetIndex = images.findIndex(img => 
                                img === filterValue || 
                                img === String(filterValue) ||
                                (typeof img === 'string' && img.includes(String(filterValue)))
                            );
                        }

                        // Если нашли изображение, устанавливаем индекс
                        if (targetIndex >= 0 && targetIndex < images.length) {
                            console.log('[Gallery] Setting target index from filter', { 
                                targetIndex, 
                                imagesLength: images.length,
                                filterValue,
                                filterField
                            }); // eslint-disable-line no-console
                            
                            // Используем Vue.set для реактивности
                            this.$set(this, 'localCurrentIndex', targetIndex);
                            this.props.currentIndex = targetIndex;
                            this.propChanged('currentIndex');
                            
                            // Увеличиваем imageKey для принудительного обновления изображения
                            this.imageKey += 1;
                            
                            // Принудительно обновляем компонент для отображения стрелок
                            this.$forceUpdate();
                            
                            console.log('[Gallery] After setting index', { 
                                localCurrentIndex: this.localCurrentIndex,
                                propsCurrentIndex: this.props.currentIndex,
                                imagesListLength: this.imagesList.length,
                                canGoPrev: this.canGoPrev,
                                canGoNext: this.canGoNext
                            }); // eslint-disable-line no-console
                        }

                        // Очищаем временные значения только после успешного обновления
                        this._pendingFilterValue = null;
                        this._pendingFilterField = null;
                    });
                } else {
                    // Если фильтра нет, но есть изображения, убеждаемся что стрелки отображаются
                    // Это важно для случая, когда фильтр был сброшен
                    if (images.length > 1) {
                        this.$nextTick(() => {
                            // Убеждаемся что индекс в пределах границ
                            if (this.props.currentIndex >= images.length) {
                                this.props.currentIndex = images.length - 1;
                                this.propChanged('currentIndex');
                            } else if (this.props.currentIndex < 0) {
                                this.props.currentIndex = DEFAULT_CURRENT_INDEX;
                                this.propChanged('currentIndex');
                            }
                            // Принудительно обновляем для отображения стрелок
                            this.$forceUpdate();
                        });
                    }
                }
            }
            this.isLoading = false;
        },
        catch(error) {
            this.error = error?.message || 'Ошибка загрузки данных';
            this.isLoading = false;
        },
        finally() {
            this.isLoading = false;
        }
    },

    mounted() {
        // При монтировании загружаем данные, если есть датасет и поле
        if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET && this.props.dremio && this.props.dremio.length > 0 && this.props.imageField) {
            this.$nextTick(() => {
                if (this.loadData) {
                    this.loadData();
                }
            });
        }
        
        // При монтировании сбрасываем индекс на 0, если список изображений пуст или индекс некорректен
        this.$nextTick(() => {
            if (this.imagesList.length > 0) {
                if (this.props.currentIndex >= this.imagesList.length || this.props.currentIndex < 0) {
                    this.props.currentIndex = DEFAULT_CURRENT_INDEX;
                    this.propChanged('currentIndex');
                }
            }
        });
    },

    data() {
        return {
            isLoading: false,
            error: null,
            datasetImages: [],
            isImageLoading: false,
            imageLoadingTimer: null,
            touchStartX: null,
            touchStartY: null,
            touchEndX: null,
            imageKey: 0, // Ключ для принудительного обновления изображения
            localCurrentIndex: null, // Локальный индекс для управления переключением
            _pendingFilterValue: null, // Временное значение фильтра для выбора изображения
            _pendingFilterField: null, // Временное поле фильтра
            ...ElemDatasetMixinTypes,
            ...ElemInstanceTypeDescriptor
        };
    },

    computed: {
        // Определяем список изображений в зависимости от источника
        imagesList() {
            if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET) {
                // Возвращаем изображения из датасета
                const images = this.datasetImages || [];
                // Убеждаемся что возвращаем массив
                const result = Array.isArray(images) ? images : [];
                console.log('[Gallery] imagesList computed', { 
                    imageSource: this.props.imageSource,
                    datasetImagesLength: this.datasetImages?.length || 0,
                    resultLength: result.length,
                    result: result.slice(0, 3) // Первые 3 для отладки
                }); // eslint-disable-line no-console
                return result;
            }
            // Режим ручного ввода
            return filterValidImages(this.props.images || []);
        },

        // Текущий индекс с проверкой границ
        currentIndex() {
            // Используем локальный индекс если он установлен, иначе props
            const localIndex = this.localCurrentIndex !== null ? this.localCurrentIndex : (this.props.currentIndex !== undefined && this.props.currentIndex !== null ? this.props.currentIndex : DEFAULT_CURRENT_INDEX);
            const maxIndex = this.imagesList.length - 1;
            if (maxIndex < 0) {
                return 0;
            }
            return Math.max(0, Math.min(localIndex, maxIndex));
        },

        // URL текущего изображения
        currentImageUrl() {
            if (this.imagesList.length === 0) {
                return null;
            }
            return this.imagesList[this.currentIndex];
        },

        // Навигация
        canGoPrev() {
            const hasImages = this.imagesList.length > 0;
            const canGo = hasImages && this.currentIndex > 0;
            console.log('[Gallery] canGoPrev', { 
                hasImages, 
                currentIndex: this.currentIndex, 
                imagesListLength: this.imagesList.length,
                localCurrentIndex: this.localCurrentIndex,
                propsCurrentIndex: this.props.currentIndex,
                canGo 
            }); // eslint-disable-line no-console
            return canGo;
        },

        canGoNext() {
            const hasImages = this.imagesList.length > 0;
            const canGo = hasImages && this.currentIndex < this.imagesList.length - 1;
            console.log('[Gallery] canGoNext', { 
                hasImages, 
                currentIndex: this.currentIndex, 
                imagesListLength: this.imagesList.length,
                localCurrentIndex: this.localCurrentIndex,
                propsCurrentIndex: this.props.currentIndex,
                canGo 
            }); // eslint-disable-line no-console
            return canGo;
        },

        // Пустое состояние
        shouldShowCustomEmptyState() {
            if (this.isLoading) {
                return false;
            }
            return this.imagesList.length === 0;
        },

        emptyStateMessage() {
            if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET) {
                if (!this.props.dremio || (this.props.dremio && this.props.dremio.length === 0)) {
                    return 'Настройте источник данных и выберите поле с URL изображений';
                }
                if (!this.props.imageField) {
                    return 'Выберите поле с URL изображений в настройках виджета';
                }
                if (this.datasetImages && this.datasetImages.length === 0) {
                    return 'Данные загружены, но в выбранном поле нет изображений';
                }
                return 'Добавьте данные в датасет или выберите поле с URL изображений';
            }
            return 'Добавьте изображения в настройках виджета';
        },

        // Стили изображения
        imageStyle() {
            return {
                objectFit: this.props.imageFit || 'contain',
                transition: `opacity ${this.props.transitionDuration}ms ease-in-out`
            };
        },

        // Стили стрелок
        arrowLeftStyle() {
            const arrowSize = this.props.arrowSize || { size: 48, unit: 'px' }; // eslint-disable-line no-magic-numbers
            const size = `${arrowSize.size}${arrowSize.unit}`;
            return {
                width: size,
                height: size,
                color: this.props.arrowColor || '#ffffff',
                backgroundColor: this.props.arrowBackgroundColor || 'rgba(0, 0, 0, 0.5)',
                pointerEvents: 'auto',
                position: 'absolute',
                zIndex: 1000
            };
        },

        arrowRightStyle() {
            return this.arrowLeftStyle;
        },

        // Стили индикаторов
        indicatorStyle() {
            return (index) => {
                const isActive = index === this.currentIndex;
                return {
                    backgroundColor: isActive 
                        ? (this.props.indicatorColor || '#3b82f6')
                        : 'rgba(0, 0, 0, 0.3)'
                };
            };
        }
    },

    watch: {
        'props.imageSource': {
            handler(newSource, oldSource) {
                // При смене источника данных сбрасываем индекс только если действительно изменился
                if (newSource !== oldSource) {
                    if (this.props.currentIndex !== DEFAULT_CURRENT_INDEX) {
                        this.props.currentIndex = DEFAULT_CURRENT_INDEX;
                        this.propChanged('currentIndex');
                    }
                    
                    // Если переключились на датасет и есть поле, загружаем данные
                    if (newSource === IMAGE_SOURCE_TYPES.DATASET && this.props.imageField) {
                        this.loadData();
                    }
                }
            }
        },

        'props.imageField': {
            handler(newField, oldField) {
                // При изменении поля датасета загружаем данные заново
                if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET && newField && newField !== oldField) {
                    this.loadData();
                }
            }
        },

        // Watch на dremio для автоматической загрузки при изменении датасета
        'props.dremio': {
            handler(newDremio, oldDremio) {
                // При изменении датасета и если источник - датасет, загружаем данные
                if (this.props.imageSource === IMAGE_SOURCE_TYPES.DATASET) {
                    const newDremioStr = JSON.stringify(newDremio || []);
                    const oldDremioStr = JSON.stringify(oldDremio || []);
                    if (newDremioStr !== oldDremioStr) {
                        // Если датасет добавлен и есть поле, загружаем данные
                        if (newDremio && newDremio.length > 0 && this.props.imageField) {
                            this.$nextTick(() => {
                                this.loadData();
                            });
                        } else if (newDremio && newDremio.length === 0) {
                            // Если датасет удален, очищаем изображения
                            this.datasetImages = [];
                        }
                    }
                }
            },
            deep: true,
            immediate: false
        },

        'props.images': {
            handler(newImages, oldImages) {
                // При изменении ручного массива проверяем индекс только если массив действительно изменился
                if (this.props.imageSource === IMAGE_SOURCE_TYPES.MANUAL) {
                    const newImagesStr = JSON.stringify(newImages || []);
                    const oldImagesStr = JSON.stringify(oldImages || []);
                    
                    if (newImagesStr !== oldImagesStr) {
                        const validImages = filterValidImages(newImages || []);
                        // Сбрасываем индекс если он выходит за границы или если это первая загрузка (oldImages пуст)
                        if (this.props.currentIndex >= validImages.length || this.props.currentIndex < 0 || !oldImages || oldImages.length === 0) {
                            const newIndex = validImages.length > 0 ? DEFAULT_CURRENT_INDEX : 0;
                            if (this.props.currentIndex !== newIndex) {
                                this.props.currentIndex = newIndex;
                                this.propChanged('currentIndex');
                            }
                        }
                    }
                }
            }
        },

        // Watcher для imagesList - сбрасываем индекс при первой загрузке, но не при фильтрации
        imagesList: {
            handler(newList, oldList) {
                // Если список изменился, проверяем индекс
                if (newList && newList.length > 0) {
                    // Если индекс выходит за границы, корректируем его
                    if (this.props.currentIndex >= newList.length) {
                        // При фильтрации устанавливаем последний доступный индекс
                        this.props.currentIndex = newList.length - 1;
                        this.propChanged('currentIndex');
                    } else if (this.props.currentIndex < 0) {
                        // Если индекс отрицательный, сбрасываем на 0
                        this.props.currentIndex = DEFAULT_CURRENT_INDEX;
                        this.propChanged('currentIndex');
                    }
                    // Если это первая загрузка (oldList пуст) и индекс не равен 0, сбрасываем на 0
                    else if ((!oldList || oldList.length === 0) && this.props.currentIndex !== DEFAULT_CURRENT_INDEX) {
                        this.props.currentIndex = DEFAULT_CURRENT_INDEX;
                        this.propChanged('currentIndex');
                    }
                    // Если список изменился, но индекс в пределах границ, оставляем его как есть (для фильтрации)
                }
            },
            immediate: false
        },

        // Watcher для переменной - выбираем изображение по значению переменной, но не фильтруем список
        '$storeState': {
            handler(storeState) {
                // Если задана переменная для выбора изображения
                if (this.props.imageVariable && storeState && this.imagesList.length > 0) {
                    const variableValue = storeState[this.props.imageVariable];
                    
                    // Если переменная имеет значение, пытаемся найти соответствующее изображение
                    if (variableValue != null) {
                        // Ищем индекс изображения по значению переменной
                        // Предполагаем, что переменная содержит URL изображения или индекс
                        let targetIndex = -1;
                        
                        // Пробуем найти по URL
                        targetIndex = this.imagesList.findIndex(img => img === variableValue || img === String(variableValue));
                        
                        // Если не нашли по URL, пробуем интерпретировать как индекс
                        if (targetIndex === -1) {
                            const numValue = Number(variableValue);
                            if (!isNaN(numValue) && numValue >= 0 && numValue < this.imagesList.length) {
                                targetIndex = numValue;
                            }
                        }
                        
                        // Если нашли изображение, устанавливаем индекс
                        if (targetIndex >= 0 && targetIndex !== this.props.currentIndex) {
                            this.props.currentIndex = targetIndex;
                            this.propChanged('currentIndex');
                        }
                    }
                }
            },
            deep: true,
            immediate: false
        }
    },

    beforeDestroy() {
        // Очищаем таймер при уничтожении компонента
        if (this.imageLoadingTimer) {
            clearTimeout(this.imageLoadingTimer);
            this.imageLoadingTimer = null;
        }
    },

    methods: {
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,


        // Навигация
        nextImage(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (this.canGoNext) {
                const nextIndex = this.currentIndex + 1;
                this.goToImage(nextIndex);
            }
        },

        prevImage(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (this.canGoPrev) {
                const prevIndex = this.currentIndex - 1;
                this.goToImage(prevIndex);
            }
        },

        goToImage(index, event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            // Проверяем границы
            if (index < 0 || index >= this.imagesList.length) {
                return;
            }
            
            // Проверяем, не тот же ли это индекс
            const currentIdx = this.localCurrentIndex !== null ? this.localCurrentIndex : this.props.currentIndex;
            if (index === currentIdx) {
                return;
            }
            
            // Очищаем предыдущий таймер, если есть
            if (this.imageLoadingTimer) {
                clearTimeout(this.imageLoadingTimer);
                this.imageLoadingTimer = null;
            }
            
            // Сбрасываем флаг загрузки перед переключением
            this.isImageLoading = false;
            
            // Устанавливаем новый индекс в локальное состояние (реактивно)
            this.localCurrentIndex = index;
            // Увеличиваем ключ изображения для принудительного обновления
            this.imageKey += 1;
            
            // Синхронизируем с props для платформы
            this.props.currentIndex = index;
            this.propChanged('currentIndex');
            
            // Показываем прелоадер только если включено в настройках
            if (this.props.showLoading) {
                // Проверяем через небольшую задержку, не загружено ли изображение уже в кэше
                this.imageLoadingTimer = setTimeout(() => {
                    this.$nextTick(() => {
                        const img = this.$el?.querySelector('.gallery-image');
                        if (!img || !img.complete || img.naturalWidth === 0 || img.src !== this.currentImageUrl) {
                            // Изображение еще не загружено - показываем прелоадер
                            this.isImageLoading = true;
                            
                            // Устанавливаем таймаут для скрытия прелоадера на случай, если событие load не сработает
                            this.imageLoadingTimer = setTimeout(() => {
                                this.isImageLoading = false;
                                this.imageLoadingTimer = null;
                            }, 2000); // eslint-disable-line no-magic-numbers
                        }
                        // Если изображение уже загружено, ничего не делаем (isImageLoading уже false)
                    });
                }, 50); // eslint-disable-line no-magic-numbers
            }
        },

        // Обработка событий изображения
        handleImageLoad() {
            // Изображение загружено - скрываем прелоадер
            if (this.imageLoadingTimer) {
                clearTimeout(this.imageLoadingTimer);
                this.imageLoadingTimer = null;
            }
            this.isImageLoading = false;
        },

        handleImageError(event) {
            // Ошибка загрузки - скрываем прелоадер
            if (this.imageLoadingTimer) {
                clearTimeout(this.imageLoadingTimer);
                this.imageLoadingTimer = null;
            }
            this.isImageLoading = false;
        },

        // Обработчик mousedown для предотвращения перехвата событий редактором
        handleMouseDown(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        },

        // Клавиатурная навигация
        handleKeydown(event) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.prevImage();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.nextImage();
            }
        },

        // Поддержка свайпов
        handleTouchStart(event) {
            if (!this.props.enableSwipe) {
                return;
            }
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
        },

        handleTouchMove(event) {
            // Не обрабатываем здесь, чтобы не блокировать скролл и перемещение виджета
            // Вся логика свайпа обрабатывается в handleTouchEnd
        },

        handleTouchEnd(event) {
            if (!this.props.enableSwipe || this.touchStartX == null) {
                return;
            }

            this.touchEndX = event.changedTouches[0].clientX;
            const deltaX = this.touchStartX - this.touchEndX;
            const deltaY = this.touchStartY ? Math.abs(event.changedTouches[0].clientY - this.touchStartY) : 0;
            const minSwipeDistance = 50; // eslint-disable-line no-magic-numbers

            // Обрабатываем свайп только если движение преимущественно горизонтальное
            if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > deltaY) {
                if (deltaX > 0) {
                    // Свайп влево - следующее изображение
                    this.nextImage();
                } else {
                    // Свайп вправо - предыдущее изображение
                    this.prevImage();
                }
            }

            this.touchStartX = null;
            this.touchStartY = null;
            this.touchEndX = null;
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>

