<template>
  <w-panel>
    <ui-container>
      <div class="color-panel">
      <!-- Info text -->
      <div class="panel-info">
        <p class="info-text">Настройте цвета для каждой категории. Если цвет не указан, будет использован цвет по умолчанию.</p>
      </div>

      <!-- Color palette selection -->
      <ui-select
        :value="selectedPalette"
        :options="paletteOptions"
        @change="handlePaletteChange"
        label="Цветовая палитра по умолчанию">
      </ui-select>

      <!-- Category colors list -->
      <div v-if="categories.length > 0" class="category-colors-list">
        <div class="category-colors-header">
          <span class="header-category">Категория</span>
          <span class="header-color">Цвет</span>
          <span class="header-actions">Действие</span>
        </div>

        <div 
          v-for="category in categories" 
          :key="category"
          class="category-color-row"
        >
          <span class="category-name" :title="category">
            {{ category }}
          </span>
          
          <div class="color-picker-wrapper">
            <input 
              type="color" 
              :value="getCategoryColor(category)"
              @input="handleColorChange(category, $event.target.value)"
              class="color-input"
            />
            <span 
              class="color-preview" 
              :style="{ backgroundColor: getCategoryColor(category) }"
            ></span>
          </div>

          <button 
            v-if="hasCustomColor(category)"
            @click="resetCategoryColor(category)"
            class="reset-btn"
            title="Сбросить цвет"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
          <span v-else class="reset-btn-placeholder"></span>
        </div>
      </div>

      <!-- No categories message -->
      <div v-else class="no-categories-message">
        <p>Нет доступных категорий. Пожалуйста, настройте источник данных.</p>
      </div>

      <!-- Reset all button -->
      <div v-if="hasAnyCustomColors" class="reset-all-section">
        <button 
          @click="resetAllColors"
          class="reset-all-btn"
        >
          Сбросить все цвета
        </button>
      </div>
    </div>
    </ui-container>
  </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin } from '@goodt-common/data';

const ColorPalettesConfig = {
    defaultColors: [
        '#FF6B6B', '#FFA500', '#FFD700', '#32CD32', '#4ECDC4',
        '#1E90FF', '#9370DB', '#FF1493', '#00CED1', '#FF8C00',
        '#20B2AA', '#BA55D3', '#FF4500', '#3CB371', '#4169E1',
        '#DC143C', '#FFD700', '#48D1CC', '#DA70D6', '#FF69B4'
    ],
    vibrantColors: [
        '#E74C3C', '#E67E22', '#F39C12', '#27AE60', '#16A085',
        '#2980B9', '#8E44AD', '#C0392B', '#D35400', '#F1C40F',
        '#1ABC9C', '#3498DB', '#9B59B6', '#34495E', '#E91E63',
        '#FF5722', '#FFC107', '#00BCD4', '#673AB7', '#FF4081'
    ],
    pastelColors: [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#D4A5A5', '#F0CF65', '#A2D729', '#B5EAD7', '#C7CEEA',
        '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7',
        '#C7CEEA', '#FFDFD3', '#FFE4E1', '#F0E68C', '#DDA0DD'
    ],
    darkColors: [
        '#8B0000', '#B8860B', '#556B2F', '#2F4F4F', '#191970',
        '#800080', '#8B4513', '#A0522D', '#2E8B57', '#483D8B',
        '#B22222', '#DAA520', '#6B8E23', '#008080', '#4B0082',
        '#8B008B', '#CD853F', '#6A5ACD', '#20B2AA', '#9932CC'
    ]
};

const ColorPalettesMap = {
    default: ColorPalettesConfig.defaultColors,
    vibrant: ColorPalettesConfig.vibrantColors,
    pastel: ColorPalettesConfig.pastelColors,
    dark: ColorPalettesConfig.darkColors
};

const COLOR_PALETTES = ColorPalettesMap;

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Цвета категорий', icon: 'palette' },

    data() {
        return {
            selectedPalette: 'default',
            categoryColorMap: {},
            paletteOptions: [
                { value: 'default', label: 'Стандартная' },
                { value: 'vibrant', label: 'Яркая' },
                { value: 'pastel', label: 'Пастельная' },
                { value: 'dark', label: 'Тёмная' }
            ]
        };
    },

    watch: {
        dataset: {
            handler() {
                // Dataset changed - categories will update automatically
            },
            deep: true,
            immediate: true
        },
        'props.categoryField': {
            handler() {
                // Category field changed - categories will update automatically
            },
            immediate: true
        },
        categories: {
            handler(newCategories, oldCategories) {
                // When categories first become available, apply current palette colors
                if (newCategories != null && newCategories.length > 0 && 
                    (oldCategories == null || oldCategories.length === 0)) {
                    const currentPalette = this.$data.selectedPalette || 'default';
                    // Only auto-apply if no custom colors are set
                    const hasCustomColors = this.props?.categoryColors != null && 
                                          Object.keys(this.props.categoryColors).length > 0;
                    if (!hasCustomColors && currentPalette !== 'default') {
                        this.$nextTick(() => {
                            this.applyPaletteColors(currentPalette);
                        });
                    }
                }
            }
        }
    },

    computed: {
        selectedPalette: {
            get() {
                return this.$data.selectedPalette || 'default';
            },
            set(value) {
                this.$data.selectedPalette = value;
                // Reset the color map to use new palette
                this.categoryColorMap = {};
                
                // Apply palette colors to widget (use nextTick to ensure categories are available)
                this.$nextTick(() => {
                    this.applyPaletteColors(value);
                });
            }
        },

        categories() {
            // Access widget instance data (like ElemMultiSpline panels do)
            const widgetInstance = this.elementInstance;
            
            // Option 1: Use widget's already extracted uniqueCategories (most efficient)
            if (widgetInstance != null && Array.isArray(widgetInstance.uniqueCategories) && widgetInstance.uniqueCategories.length > 0) {
                return widgetInstance.uniqueCategories;
            }
            
            // Option 2: Extract from widget's allDatasets (transformed data)
            if (widgetInstance != null && Array.isArray(widgetInstance.allDatasets) && widgetInstance.allDatasets.length > 0) {
                const dataset = widgetInstance.allDatasets;
                const categoryField = this.props?.categoryField;
                
                if (categoryField == null || categoryField === '') {
                    return [];
                }
                
                // Transformed data uses category_event field
                const uniqueCategoriesSet = new Set();
                dataset.forEach(record => {
                    if (record != null && typeof record === 'object') {
                        // Transformed records have category_event field
                        const category = record.category_event;
                        if (category != null && category !== '' && category !== 'UNKNOWN') {
                            uniqueCategoriesSet.add(String(category).trim());
                        }
                    }
                });
                
                return Array.from(uniqueCategoriesSet).sort();
            }
            
            // Option 3: Try to access raw dataset rows from widget instance
            if (widgetInstance != null && widgetInstance.results != null && Array.isArray(widgetInstance.results)) {
                const results = widgetInstance.results;
                const categoryField = this.props?.categoryField;
                
                if (categoryField == null || categoryField === '') {
                    return [];
                }
                
                const uniqueCategoriesSet = new Set();
                results.forEach(({ rows }) => {
                    if (Array.isArray(rows)) {
                        rows.forEach(record => {
                            if (record != null && typeof record === 'object') {
                                const category = record[categoryField];
                                if (category != null && category !== '') {
                                    uniqueCategoriesSet.add(String(category).trim());
                                }
                            }
                        });
                    }
                });
                
                return Array.from(uniqueCategoriesSet).sort();
            }
            
            return [];
        },

        hasAnyCustomColors() {
            const categoryColors = this.props?.categoryColors || {};
            return Object.keys(categoryColors).length > 0;
        }
    },

    methods: {
        getCategoryColor(category) {
            const customColors = this.props?.categoryColors || {};
            const upperCategory = category.toUpperCase();
            
            // Always check custom colors first (these override palette)
            if (customColors[upperCategory]) {
                return customColors[upperCategory];
            }

            // Use the color from current palette
            const palette = COLOR_PALETTES[this.selectedPalette] || COLOR_PALETTES.default;
            if (this.categoryColorMap[upperCategory] == null) {
                // Find index of this category in sorted categories list
                const categories = this.categories;
                const categoryIndex = categories.indexOf(category);
                const colorIndex = categoryIndex >= 0 ? categoryIndex % palette.length : 0;
                this.categoryColorMap[upperCategory] = palette[colorIndex];
            }

            return this.categoryColorMap[upperCategory];
        },

        hasCustomColor(category) {
            const customColors = this.props?.categoryColors || {};
            const upperCategory = category.toUpperCase();
            return customColors[upperCategory] != null;
        },

        handleColorChange(category, color) {
            const upperCategory = category.toUpperCase();
            const currentColors = { ...(this.props?.categoryColors || {}) };
            currentColors[upperCategory] = color;

            this.propChanged('categoryColors', currentColors);
        },

        resetCategoryColor(category) {
            const upperCategory = category.toUpperCase();
            const currentColors = { ...(this.props?.categoryColors || {}) };
            delete currentColors[upperCategory];

            this.propChanged('categoryColors', currentColors);
        },

        resetAllColors() {
            this.propChanged('categoryColors', {});
            // Reset palette to default when clearing all colors
            this.$data.selectedPalette = 'default';
            this.categoryColorMap = {};
        },

        handlePaletteChange(value) {
            // Handle palette change from ui-select
            this.$data.selectedPalette = value || 'default';
            this.categoryColorMap = {};
            this.$nextTick(() => {
                this.applyPaletteColors(value || 'default');
            });
        },

        applyPaletteColors(paletteName) {
            // If default palette, clear custom colors to use widget's PREDEFINED_COLORS
            if (paletteName === 'default') {
                // Clear custom colors so widget uses default PREDEFINED_COLORS
                const emptyColors = {};
                this.props.categoryColors = emptyColors;
                this.propChanged('categoryColors', emptyColors);
                this.categoryColorMap = {};
                // Force Vue to update
                this.$nextTick(() => {
                    this.$forceUpdate();
                });
                return;
            }

            // For other palettes, apply palette colors as custom colors
            const palette = COLOR_PALETTES[paletteName];
            if (palette == null || palette.length === 0) {
                return;
            }

            const categories = this.categories;
            if (categories.length === 0) {
                return;
            }

            // Create color map from palette
            const newColors = {};
            categories.forEach((category, index) => {
                const upperCategory = category.toUpperCase();
                const colorIndex = index % palette.length;
                newColors[upperCategory] = palette[colorIndex];
            });

            // Apply colors to widget - use Vue.set for reactivity
            this.$set(this.props, 'categoryColors', { ...newColors });
            this.propChanged('categoryColors', newColors);
            
            // Update local color map for display
            this.categoryColorMap = { ...newColors };
            
            // Force Vue to update to reflect new colors
            this.$nextTick(() => {
                this.$forceUpdate();
            });
        }
    }
};
</script>

<style scoped>
.color-panel {
    padding: 12px 0;
}

.panel-info {
    margin-bottom: 16px;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
    border-left: 3px solid #1E90FF;
}

.info-text {
    margin: 0;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
}

.category-colors-list {
    margin-top: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
}

.category-colors-header {
    display: grid;
    grid-template-columns: 1fr 120px 60px;
    gap: 8px;
    padding: 10px 12px;
    background-color: #f5f5f5;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    color: #666;
    border-bottom: 1px solid #e0e0e0;
    align-items: center;
}

.category-colors-header > span {
    display: flex;
    align-items: center;
    line-height: 1.5;
}

.category-colors-header > .header-category {
    justify-content: flex-start;
}

.category-colors-header > .header-color {
    justify-content: center;
}

.category-colors-header > .header-actions {
    justify-content: center;
}

.category-color-row {
    display: grid;
    grid-template-columns: 1fr 120px 60px;
    gap: 8px;
    padding: 12px;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
}

.category-color-row:last-child {
    border-bottom: none;
}

.category-color-row:hover {
    background-color: #fafafa;
}

.category-name {
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    line-height: 1.5;
}

.color-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.color-input {
    width: 60px;
    height: 32px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    padding: 2px;
}

.color-input:hover {
    border-color: #1E90FF;
}

.color-preview {
    width: 40px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #ddd;
    display: inline-block;
}

.reset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0 auto;
    background: transparent;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
}

.reset-btn:hover {
    background-color: #fee;
    border-color: #dc3545;
    color: #dc3545;
}

.reset-btn svg {
    width: 16px;
    height: 16px;
}

.reset-btn-placeholder {
    width: 32px;
    height: 32px;
    margin: 0 auto;
    display: block;
}

.no-categories-message {
    padding: 24px;
    text-align: center;
    color: #999;
}

.no-categories-message p {
    margin: 0;
    font-size: 14px;
}

.reset-all-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
    text-align: center;
}

.reset-all-btn {
    padding: 10px 20px;
    background-color: #fff;
    border: 1px solid #dc3545;
    color: #dc3545;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.reset-all-btn:hover {
    background-color: #dc3545;
    color: #fff;
}
</style>

