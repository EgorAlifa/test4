<template>
    <w-elem :placeholder="$placeholder">
        <!-- Drilldown controls -->
        <div class="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <button
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="drilldownCanPush ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                :disabled="!drilldownCanPush"
                @click="drilldownPush">
                <i class="mdi mdi-arrow-down mr-1"></i>
                Детализация: {{ drilldownCanPush ? 'доступна' : 'недоступна' }}
            </button>
            <button
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="drilldownCanPop ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                :disabled="!drilldownCanPop"
                @click="drilldownPop">
                <i class="mdi mdi-arrow-left mr-1"></i>
                Назад: {{ drilldownCanPop ? 'доступно' : 'недоступно' }}
            </button>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center h-32">
            <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p class="text-gray-600">Загрузка данных...</p>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="flex items-center justify-center h-32">
            <div class="text-red-600 text-center">
                <i class="mdi mdi-alert-circle-outline text-4xl mb-2"></i>
                <p class="text-lg font-medium">{{ error }}</p>
            </div>
        </div>

        <!-- Search bar -->
        <div v-if="props.showSearch && result && result.rows && result.rows.length > 0" class="mb-6">
            <div class="relative">
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Поиск товаров..."
                    class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <i class="mdi mdi-magnify absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
        </div>

        <!-- Product cards -->
        <div v-else-if="result && result.rows && result.rows.length > 0" 
             :class="getGridClasses()">
            <div 
                v-for="(item, index) in filteredRows" 
                :key="index"
                class="product-card"
                @click="selectCard(index)"
            >
                <!-- Product image -->
                <div v-if="getImageUrl(item)" class="product-image">
                    <img 
                        :src="getImageUrl(item)" 
                        :alt="getTitle(item)"
                        @error="handleImageError"
                    >
                    <!-- Badge -->
                    <div v-if="props.showBadges" class="product-badge">
                        <span>{{ getBadgeText(item) }}</span>
                    </div>
                    <!-- Rating -->
                    <div v-if="props.showRatings" class="product-rating">
                        <i class="mdi mdi-star"></i>
                        <span>{{ getRating(item) }}</span>
                    </div>
                </div>

                <!-- Product info -->
                <div class="product-info">
                    <!-- Title -->
                    <h3 class="product-title">
                        {{ getTitle(item) }}
                    </h3>
                    
                    <!-- Description -->
                    <p v-if="getDescription(item)" class="product-description">
                        {{ getDescription(item) }}
                    </p>
                    
                    <!-- Price -->
                    <div v-if="getPrice(item)" class="product-price">
                        <span class="price-amount">
                            {{ formatPrice(getPrice(item)) }}
                        </span>
                        <span v-if="getQuantity(item)" class="price-quantity">
                            {{ formatQuantity(getQuantity(item)) }}
                        </span>
                    </div>
                </div>

                <!-- Card actions -->
                <div class="product-actions">
                    <button
                        class="action-button"
                        :class="getButtonClasses()"
                        @click.stop="drilldownPush(item)">
                        <i class="mdi mdi-eye"></i>
                        <span>Подробнее</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- No data state -->
        <div v-else class="flex items-center justify-center h-32">
            <div class="text-gray-500 text-center">
                <i class="mdi mdi-database-off text-4xl mb-2"></i>
                <p class="text-lg">Нет данных для отображения</p>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="props.showPagination && pages > 1" class="flex justify-center mt-8">
            <nav class="flex items-center space-x-2">
                <button
                    class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                    :class="page > 1 ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                    :disabled="page <= 1"
                    @click.stop="loadDataPage(page - 1)">
                    <i class="mdi mdi-chevron-left"></i>
                </button>
                
                <button
                    v-for="n in getVisiblePages()"
                    :key="n"
                    class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                    :class="n === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                    @click.stop="loadDataPage(n)">
                    {{ n }}
                </button>
                
                <button
                    class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                    :class="page < pages ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                    :disabled="page >= pages"
                    @click.stop="loadDataPage(page + 1)">
                    <i class="mdi mdi-chevron-right"></i>
                </button>
            </nav>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
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

    hooks: {
        // @todo: delete if unused
        // before – optional hook
        before(cancel) { /* use cancel() to prevent loading */ },
        // then – optional hook
        then(result) {},
        // catch – optional hook
        catch(error) {},
        // finally – optional hook
        finally() {}
    },
    data: (/* vm */) => ({
        selectedCard: null,
        searchQuery: ''
    }),
    computed: {
        drilldownState() {
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
            return this.drilldownState.canPush;
        },
        drilldownDimension() {
            return this.drilldownState.dimension;
        },
        
        filteredRows() {
            if (!this.result || !this.result.rows) return [];
            if (!this.searchQuery) return this.result.rows;
            
            const query = this.searchQuery.toLowerCase();
            return this.result.rows.filter(item => {
                const title = this.getTitle(item) || '';
                const description = this.getDescription(item) || '';
                return title.toLowerCase().includes(query) || 
                       description.toLowerCase().includes(query);
            });
        }
    },
    methods: {
        // IDE suggestion helper
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,
        loadDataPage(page) {
            this.page = page;
            this.loadData();
        },
        drilldownPush() {
            const { drilldownName } = this.props;
            if (this.drilldownCanPush){
            // or without using computed this.drilldownCanPush
            // if (this.$drilldown.canPush(drilldownName)) {
                const dimensionValue = this.result.rows[0][drilldownName];
                // commit before push using drilldownName
                this.$storeCommit({ [drilldownName]: dimensionValue });
                this.$drilldown.push(drilldownName, dimensionValue);
            }
        },
        drilldownPop() {
            const { drilldownName } = this.props;
            if (this.drilldownCanPop) {
                // или если без computed
                // if (this.$drilldown.canPop(drilldownName)) {
                this.$drilldown.pop(drilldownName);
                // commit after pop
                this.$storeCommit({ [drilldownName]: null });
            }
        },
        
        // Новые методы для карточек
        selectCard(index) {
            this.selectedCard = this.selectedCard === index ? null : index;
        },
        
        getDimensionValue(item) {
            const { dimension } = this.props;
            return dimension && item[dimension] ? item[dimension] : 'Без названия';
        },
        
        formatValue(value) {
            if (value === null || value === undefined) return '-';
            if (typeof value === 'number') {
                return value.toLocaleString('ru-RU');
            }
            if (typeof value === 'string') {
                return value.length > 50 ? value.substring(0, 50) + '...' : value;
            }
            return String(value);
        },
        
        drilldownPush(item) {
            const { drilldownName } = this.props;
            if (this.drilldownCanPush && drilldownName && item[drilldownName]) {
                const dimensionValue = item[drilldownName];
                this.$storeCommit({ [drilldownName]: dimensionValue });
                this.$drilldown.push(drilldownName, dimensionValue);
            }
        },
        
        // Методы для карточек товаров
        getTitle(item) {
            const { titleField } = this.props;
            return titleField && item[titleField] ? item[titleField] : this.getDimensionValue(item);
        },
        
        getImageUrl(item) {
            const { imageField } = this.props;
            return imageField && item[imageField] ? item[imageField] : null;
        },
        
        getPrice(item) {
            const { priceField } = this.props;
            return priceField && item[priceField] ? item[priceField] : null;
        },
        
        getDescription(item) {
            const { descriptionField } = this.props;
            return descriptionField && item[descriptionField] ? item[descriptionField] : null;
        },
        
        getQuantity(item) {
            const { metric } = this.props;
            return metric && item[metric] ? item[metric] : null;
        },
        
        getRating(item) {
            // Генерируем случайный рейтинг для демонстрации
            return (Math.random() * 2 + 3).toFixed(1);
        },
        
        getBadgeText(item) {
            const price = this.getPrice(item);
            if (price > 1000) return 'Премиум';
            if (price > 500) return 'Популярный';
            return 'Новинка';
        },
        

        
        // Методы для стилизации
        getGridClasses() {
            const { columnsCount } = this.props;
            const baseClasses = 'grid gap-6';
            
            switch (columnsCount) {
                case 1: return `${baseClasses} grid-cols-1`;
                case 2: return `${baseClasses} grid-cols-1 md:grid-cols-2`;
                case 3: return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
                case 4: return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`;
                case 5: return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`;
                default: return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
            }
        },
        

        
        getButtonClasses() {
            const { colorScheme } = this.props;
            
            switch (colorScheme) {
                case 'blue': return 'bg-blue-600';
                case 'green': return 'bg-green-600';
                case 'red': return 'bg-red-600';
                case 'purple': return 'bg-purple-600';
                case 'orange': return 'bg-orange-600';
                case 'gray': return 'bg-gray-600';
                default: return 'bg-blue-600';
            }
        },
        

        
        // Вспомогательные методы
        formatPrice(price) {
            if (!price) return '';
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB'
            }).format(price);
        },
        
        formatQuantity(quantity) {
            if (!quantity) return '';
            return `${quantity} шт.`;
        },
        
        handleImageError(event) {
            event.target.style.display = 'none';
        },
        
        getVisiblePages() {
            const total = this.pages;
            const current = this.page;
            const delta = 2;
            
            const range = [];
            const rangeWithDots = [];
            
            for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
                range.push(i);
            }
            
            if (current - delta > 2) {
                rangeWithDots.push(1, '...');
            } else {
                rangeWithDots.push(1);
            }
            
            rangeWithDots.push(...range);
            
            if (current + delta < total - 1) {
                rangeWithDots.push('...', total);
            } else {
                rangeWithDots.push(total);
            }
            
            return rangeWithDots;
        }
    }
};
</script>

<style scoped>
/* Product Cards Grid */
.product-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

/* Product Image */
.product-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
    transform: scale(1.05);
}

/* Product Badge */
.product-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Product Rating */
.product-rating {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
}

.product-rating i {
    color: #ffd700;
    font-size: 14px;
}

/* Product Info */
.product-info {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* Product Title */
.product-title {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 10px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Product Description */
.product-description {
    font-size: 14px;
    color: #7f8c8d;
    line-height: 1.5;
    margin-bottom: 15px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Product Price */
.product-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.price-amount {
    font-size: 24px;
    font-weight: 800;
    color: #2c3e50;
}

.price-quantity {
    font-size: 12px;
    color: #95a5a6;
    font-weight: 500;
}

/* Product Actions */
.product-actions {
    padding: 0 20px 20px;
}

.action-button {
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-radius: 15px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.action-button i {
    font-size: 16px;
}

/* Color Schemes */
.action-button.bg-blue-600 {
    background: linear-gradient(45deg, #3498db, #2980b9);
}

.action-button.bg-green-600 {
    background: linear-gradient(45deg, #2ecc71, #27ae60);
}

.action-button.bg-red-600 {
    background: linear-gradient(45deg, #e74c3c, #c0392b);
}

.action-button.bg-purple-600 {
    background: linear-gradient(45deg, #9b59b6, #8e44ad);
}

.action-button.bg-orange-600 {
    background: linear-gradient(45deg, #f39c12, #e67e22);
}

.action-button.bg-gray-600 {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);
}

/* Responsive Grid */
@media (max-width: 640px) {
    .product-card {
        margin-bottom: 20px;
    }
}

/* Animation for cards */
.product-card {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
