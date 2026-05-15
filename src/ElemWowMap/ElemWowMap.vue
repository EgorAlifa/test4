<template>
  <!-- eslint-disable vue/component-name-in-template-casing -->
  <w-elem :placeholder="false">
    <!-- Custom Styles Injection -->
    <component :is="'style'" v-if="customStylesCSS">
      {{ customStylesCSS }}
    </component>
    
    <div 
      class="elemwowmap-widget-root" 
      :class="[themeClass, { 'choropleth-mode': currentMode === 'choropleth' }]"
    >
      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <div class="error-title">Ошибка загрузки карты</div>
        <div class="error-message">{{ error.message || 'Произошла ошибка' }}</div>
      </div>

      <!-- Empty state -->
      <w-map-empty-state
        v-else-if="shouldShowEmptyState"
        :has-dataset-configured="hasDatasetConfigured"
        :title="emptyStateTitle"
        :description="emptyStateDescription"
        @navigate-to-source="handleNavigateToSource"
      />

      <!-- Map container -->
      <div v-else class="map-container">
        <!-- Leaflet Map (for heatmap, dots, animation modes) -->
        <template v-if="currentMode !== 'choropleth'">
          <w-leaflet-map
            ref="leafletMap"
            :center="props.initialCenter"
            :zoom="props.initialZoom"
            :min-zoom="props.minZoom"
            :max-zoom="props.maxZoom"
            :tile-provider="effectiveTileProvider"
            :yandex-api-key="props.yandexApiKey || ''"
            :active-particles="activeParticles"
            :current-theme="currentTheme"
            :particle-size-multiplier="props.particleSizeMultiplier || 1.0"
            :is-lasso-filter-applied="isLassoFilterApplied"
            :active-lasso-path="lassoPathCoords"
            @map-ready="handleMapReady"
            @lasso-selection-finished="handleLassoFinished"
            @lasso-selection-cleared="handleLassoCleared"
            @lasso-activity-changed="handleLassoActivityChanged"
          />

          <!-- Heatmap Layer -->
          <w-heatmap-layer
            v-if="currentMode === 'heatmap' && leafletMapInstance"
            ref="heatmapLayer"
            :map="leafletMapInstance"
            :data="topNFilteredDatasets"
            :radius="props.heatmapRadius"
            :blur="props.heatmapBlur"
            :min-opacity="props.heatmapMinOpacity"
            :max-intensity="props.heatmapMaxIntensity"
            :is-yandex-tiles="effectiveTileProvider === 'yandex'"
            @rendering-start="handleHeatmapRenderingStart"
            @rendering-end="handleHeatmapRenderingEnd"
          />

          <!-- Dots Layer -->
          <w-dots-layer
            v-if="currentMode === 'dots' && leafletMapInstance"
            ref="dotsLayer"
            :map="leafletMapInstance"
            :data="renderedDots"
            :radius="props.dotRadius"
            :opacity="props.dotOpacity"
            :size="dotSizeLocal"
            :category-color-map="categoryColorsMap"
            :predefined-colors="predefinedColorsList"
            :custom-colors="props.categoryColors"
            :current-theme="currentTheme"
            :color-min="props.dotColorMin || '#bfdbfe'"
            :color-max="props.dotColorMax || '#1d4ed8'"
            :dot-size-by-value="props.dotSizeByValue || false"
            :is-yandex-tiles="effectiveTileProvider === 'yandex'"
          />

          <!-- Animation Layer -->
          <w-animation-layer
            v-if="currentMode === 'animation' && leafletMapInstance"
            ref="animationLayer"
            :map="leafletMapInstance"
            :data="filteredDatasets"
            :is-playing="isPlaying"
            :speed="props.animationSpeedMs || animationSpeedMs"
            :fade-time="props.fadeTime || fadeDurationDays"
            :category-color-map="categoryColorsMap"
            :predefined-colors="predefinedColorsList"
            :custom-colors="props.categoryColors"
            @check-load-more="handleCheckLoadMore"
            @animation-complete="handleAnimationComplete"
            @animation-progress="handleAnimationProgress"
            @particles-updated="handleParticlesUpdated"
          />

          <!-- Marker Overlay (on top of all Leaflet modes) -->
          <w-marker-overlay
            v-if="props.showMarkers && leafletMapInstance && overlayMarkers.length > 0"
            :map="leafletMapInstance"
            :markers="overlayMarkers"
            :symbol="props.markerSymbol || 'circle'"
            :color="props.markerColor || '#e53935'"
            :size="props.markerSize || 10"
            :is-yandex-tiles="effectiveTileProvider === 'yandex'"
          />
        </template>

        <!-- Choropleth Map (Pure SVG, no Leaflet) -->
        <w-choropleth-map
          v-if="currentMode === 'choropleth'"
          ref="choroplethMap"
          :data="choroplethData"
          :admin-level="props.choroplethAdminLevel"
          :color-scheme="props.choroplethColorScheme"
          :color-steps="props.choroplethColorSteps"
          :missing-data-color="props.choroplethMissingDataColor"
          :border-appearance="props.choroplethBorderAppearance"
          :enable-custom-border="props.enableCustomBorder"
          :custom-border-color="props.customBorderColor"
          :custom-border-thickness="props.customBorderThickness"
          :custom-border-rounding="props.customBorderRounding"
          :hover-behavior="props.choroplethHoverBehavior"
          :current-theme="currentTheme"
          :region-name-field="props.regionNameField"
          :region-data="filteredDatasets"
          :svg-map-file="props.svgMapFile"
          :custom-svg-url="props.customSvgUrl"
          :svg-id-field="props.svgIdField"
          :use-map-name-for-hover="props.useMapNameForHover"
          :enable-drill-down="props.enableDrillDown"
          :drill-down-start-level="props.drillDownStartLevel"
          :aggregation-method="props.choroplethAggregationMethod || 'sum'"
          :level-metric-mapping="props.choroplethLevelMetricMapping || {}"
          :tooltip-metrics="choroplethTooltipMetrics"
          :metric-settings="props.metricSettings || {}"
          :region-data-with-metrics="filteredDatasets"
          :region-code-field="props.regionCodeField"
          :show-labels="props.showLabels || false"
          :markers="props.showMarkers ? overlayMarkers : []"
          :marker-symbol="props.markerSymbol || 'circle'"
          :marker-color="props.markerColor || '#e53935'"
          :marker-size="props.markerSize || 10"
          selected-district="russia"
          @visible-regions-changed="handleVisibleRegionsChanged"
          @region-click="handleRegionClick"
        />
      </div>

      <!-- Event Timeline Chart (Animation mode) -->
      <div 
        v-if="currentMode === 'animation' && hasAnimationPlayed && props.showChart && isChartEnabled"
        class="elemwowmap-chart-container"
        :class="['theme-' + currentTheme]"
      >
        <!-- Chart content wrapper with header -->
        <div v-if="!isChartMinimized" class="chart-content-wrapper">
          <!-- Chart header with minimize button -->
          <div class="chart-header">
            <button
              @click="handleToggleChartMinimize"
              class="chart-minimize-btn settings-btn"
              :title="'Свернуть график'"
              :aria-label="'Свернуть график'"
              tabindex="0"
              @keydown.enter="handleToggleChartMinimize"
              @keydown.space.prevent="handleToggleChartMinimize"
            >
              <svg 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
          
          <!-- Chart content -->
          <w-event-timeline-chart
            :event-data="chartTimelineData"
            :category-colors="categoryColorsMapComputed"
            :current-theme="currentTheme"
            :t="translationFunction"
            :max-events-per-day="maxEventsOverall"
            :chart-width="800"
            :chart-height="150"
            :total-days-in-timespan="totalDaysInTimespan"
            :is-animation-ready="isAnimationReady"
            :is-playing="isPlaying"
          />
        </div>
        
        <!-- Minimized state - show button only -->
        <button
          v-else
          @click="handleToggleChartMinimize"
          class="chart-minimize-btn settings-btn"
          :title="'Развернуть график'"
          :aria-label="'Развернуть график'"
          tabindex="0"
          @keydown.enter="handleToggleChartMinimize"
          @keydown.space.prevent="handleToggleChartMinimize"
        >
          <svg 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Controls Panel (map2 style with flip animation) -->
      <div 
        v-if="props.showControls && hasData"
        class="elemwowmap-controls-panel"
        :class="['theme-' + currentTheme, { 'is-flipped': isShowingOptions, 'is-dragging': isDragging }]"
        :style="{ top: panelPosition.top + 'px', left: panelPosition.left + 'px' }"
      >
        <!-- Front Face - Filters -->
        <div 
          class="elemwowmap-controls-content elemwowmap-controls-front"
          role="region"
        >
          <!-- Header - Date Display (Animation mode) or Filter Title -->
          <div 
            class="controls-header"
            @mousedown="handleDragStart"
            @touchstart="handleDragStart"
          >
            <div v-if="currentMode === 'animation'" class="date-display">
              <div class="date-label">ДАТА</div>
              <div class="date-value">{{ currentAnimationDateDisplay }}</div>
            </div>
            <div v-else class="filter-title-header">
              <div class="controls-label">НАСТРОЙКИ</div>
              <div class="controls-title">{{ getModeLabel(currentMode) }}</div>
            </div>
            
            <!-- Action Buttons -->
            <div class="header-buttons">
              <button 
                @click="toggleOptions"
                @mousedown.stop
                @touchstart.stop
                class="settings-btn"
                title="Настройки"
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
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button 
                @click="togglePanelVisibility"
                @mousedown.stop
                @touchstart.stop
                class="settings-btn"
                title="Свернуть"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <polyline :points="isPanelMinimized ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Filter Selects (compact dropdowns like map2) -->
          <div v-if="!isPanelMinimized" class="controls-filters">
            <!-- Year Select (Single dropdown) - Inline label -->
            <div v-if="props.enableYearFilter && uniqueYears.length > 0" class="filter-row">
              <label class="filter-row-label">Год</label>
              <custom-select
                :value="selectedSingleYear"
                :options="yearOptions"
                placeholder="Весь период"
                @input="selectedSingleYear = $event; handleSingleYearChange()"
                class="filter-select-dropdown"
              />
            </div>

            <!-- Category Select (Single dropdown) - Inline label -->
            <div v-if="props.enableCategoryFilter && uniqueCategories.length > 0" class="filter-row">
              <label class="filter-row-label">Категория</label>
              <custom-select
                :value="selectedSingleCategory"
                :options="categoryOptions"
                placeholder="Все категории"
                @input="selectedSingleCategory = $event; handleSingleCategoryChange()"
                class="filter-select-dropdown"
              />
            </div>
          </div>

          <!-- Animation Controls (compact buttons + speed) -->
          <div v-if="!isPanelMinimized && currentMode === 'animation'" class="animation-controls-compact">
            <div class="control-buttons-row">
              <button 
                @click="handlePlayPause" 
                class="control-icon-btn"
                :title="isPlaying ? 'Пауза' : 'Играть'"
              >
                <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button 
                @click="handleReset" 
                class="control-icon-btn"
                title="Сброс"
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
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
              <!-- Lasso Tool Button (map2 style) -->
              <button 
                v-if="currentMode !== 'choropleth'"
                @click="toggleLassoTool" 
                class="control-icon-btn"
                :class="{ 'active': isLassoActive }"
                :title="isLassoActive ? 'Отключить лассо' : 'Включить лассо'"
              >
                <!-- ViewfinderCircle Icon from map2 -->
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="1.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                  <line x1="12" y1="2" x2="12" y2="6"/>
                  <line x1="12" y1="18" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="6" y2="12"/>
                  <line x1="18" y1="12" x2="22" y2="12"/>
                </svg>
              </button>
              
              <!-- Reset Lasso Button (when lasso filter is applied) -->
              <button 
                v-if="currentMode !== 'choropleth' && isLassoFilterApplied"
                @click="resetLassoSelection" 
                class="control-icon-btn control-icon-btn-warn"
                title="Сбросить лассо"
              >
                <!-- X Icon -->
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              
              <div class="speed-control">
                <label class="speed-label">Скорость</label>
                <input 
                  type="range" 
                  v-model="animationSpeedLocal"
                  @input="handleSpeedChange"
                  min="0.5" 
                  max="5" 
                  step="0.5"
                  class="speed-slider"
                />
              </div>
            </div>
          </div>

          <!-- Heatmap Controls -->
          <div v-if="!isPanelMinimized && currentMode === 'heatmap'" class="heatmap-controls-compact">
            <!-- Draw/Reset Buttons Row (map2 style) -->
            <div class="control-buttons-row mb-2">
              <button 
                @click="handleDrawHeatmap"
                class="control-icon-btn"
                title="Нарисовать тепловую карту"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              
              <button 
                @click="handleResetHeatmap"
                class="control-icon-btn"
                title="Сбросить"
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
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
              
              <button 
                @click="toggleLassoTool" 
                class="control-icon-btn"
                :class="{ 'active': isLassoActive }"
                :title="isLassoActive ? 'Отключить лассо' : 'Включить лассо'"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="1.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                  <line x1="12" y1="2" x2="12" y2="6"/>
                  <line x1="12" y1="18" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="6" y2="12"/>
                  <line x1="18" y1="12" x2="22" y2="12"/>
                </svg>
              </button>
              
              <button 
                v-if="isLassoFilterApplied"
                @click="resetLassoSelection" 
                class="control-icon-btn control-icon-btn-warn"
                title="Сбросить лассо"
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
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <!-- Sliders -->
            <div class="heatmap-sliders">
              <!-- Radius Control -->
              <div class="slider-control">
                <label class="slider-label">Радиус</label>
                <div class="slider-row">
                  <input 
                    type="range" 
                    v-model.number="heatmapRadiusLocal"
                    @input="handleHeatmapRadiusChange"
                    min="1" 
                    max="100" 
                    step="1"
                    class="heatmap-slider"
                  />
                  <span class="slider-value">{{ heatmapRadiusLocal }}</span>
                </div>
              </div>
              
              <!-- Blur Control -->
              <div class="slider-control">
                <label class="slider-label">Размытие</label>
                <div class="slider-row">
                  <input 
                    type="range" 
                    v-model.number="heatmapBlurLocal"
                    @input="handleHeatmapBlurChange"
                    min="0" 
                    max="50" 
                    step="1"
                    class="heatmap-slider"
                  />
                  <span class="slider-value">{{ heatmapBlurLocal }}</span>
                </div>
              </div>
              
              <!-- Min Opacity Control -->
              <div class="slider-control">
                <label class="slider-label">Прозрачность</label>
                <div class="slider-row">
                  <input 
                    type="range" 
                    v-model.number="heatmapMinOpacityLocal"
                    @input="handleHeatmapMinOpacityChange"
                    min="0" 
                    max="1" 
                    step="0.01"
                    class="heatmap-slider"
                  />
                  <span class="slider-value">{{ (heatmapMinOpacityLocal || 0).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dots Controls -->
          <div v-if="!isPanelMinimized && currentMode === 'dots'" class="dots-controls-compact">
            <!-- Loading indicator -->
            <div v-if="isRenderingDots" class="dots-loading-indicator">
              <div class="dots-loading-spinner"></div>
              <span class="dots-loading-text">Наносим точки на карту...</span>
            </div>
            
            <!-- Draw/Reset Buttons Row (map2 style) -->
            <div class="control-buttons-row mb-2">
              <button 
                @click="handleDrawDots"
                :disabled="isRenderingDots"
                class="control-icon-btn"
                title="Нарисовать точки"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              
              <button 
                @click="handleResetDots"
                :disabled="isRenderingDots"
                class="control-icon-btn"
                title="Сбросить"
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
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
              
              <button 
                @click="toggleLassoTool" 
                class="control-icon-btn"
                :class="{ 'active': isLassoActive }"
                :title="isLassoActive ? 'Отключить лассо' : 'Включить лассо'"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="1.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                  <line x1="12" y1="2" x2="12" y2="6"/>
                  <line x1="12" y1="18" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="6" y2="12"/>
                  <line x1="18" y1="12" x2="22" y2="12"/>
                </svg>
              </button>
              
              <button 
                v-if="isLassoFilterApplied"
                @click="resetLassoSelection" 
                class="control-icon-btn control-icon-btn-warn"
                title="Сбросить лассо"
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
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <!-- Sliders -->
            <div class="dots-sliders">
              <!-- Dot Size Control -->
              <div class="slider-control">
                <label class="slider-label">Размер точки</label>
                <div class="slider-row">
                  <input 
                    type="range" 
                    v-model.number="dotSizeLocal"
                    @input="handleDotSizeChange"
                    min="1" 
                    max="20" 
                    step="1"
                    class="dots-slider"
                  />
                  <span class="slider-value">{{ dotSizeLocal }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Back Face - Options/Settings -->
        <div 
          class="elemwowmap-controls-content elemwowmap-controls-back"
          role="region"
        >
          <!-- Header -->
          <div class="controls-header">
            <div class="filter-title-header">
              <div class="controls-label">ОПЦИИ</div>
              <div class="controls-title">Настройки</div>
            </div>
            
            <!-- Close Button -->
            <button 
              @click="toggleOptions"
              class="settings-btn"
              title="Закрыть"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <!-- Options List -->
          <div class="options-list">
            <!-- Visualization Mode -->
            <div v-if="props.enableModeSelector" class="option-group">
              <label class="option-label">Режим</label>
              <custom-select
                :value="currentMode"
                :options="modeOptions"
                @input="currentMode = $event; handleModeChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Theme -->
            <div v-if="props.enableThemeSelector" class="option-group">
              <label class="option-label">Тема</label>
              <custom-select
                :value="selectedTheme"
                :options="themeOptions"
                @input="selectedTheme = $event; handleThemeChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Fade Effect (Animation mode only) -->
            <div v-if="currentMode === 'animation' && props.enableFadeSelector" class="option-group">
              <label class="option-label">Затухание</label>
              <custom-select
                :value="selectedFadeOption"
                :options="fadeOptions"
                @input="selectedFadeOption = $event; handleFadeChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Particle Size (Animation mode only) -->
            <div v-if="currentMode === 'animation' && props.enableParticleSizeSelector" class="option-group">
              <label class="option-label">Размер частиц</label>
              <custom-select
                :value="selectedParticleSize"
                :options="particleSizeOptions"
                @input="selectedParticleSize = $event; handleParticleSizeChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Metric Selection (Choropleth mode only) -->
            <div v-if="currentMode === 'choropleth' && availableMetricsOptions.length > 1" class="option-group">
              <label class="option-label">Метрика</label>
              <custom-select
                :value="selectedMetric"
                :options="availableMetricsOptions"
                @input="selectedMetric = $event; handleMetricChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Palette Selection (Choropleth mode only) -->
            <div v-if="currentMode === 'choropleth'" class="option-group">
              <label class="option-label">Палитра</label>
              <div class="palette-selector">
                <div 
                  class="palette-preview"
                  :style="palettePreviewStyle"
                ></div>
                <custom-select
                  :value="selectedPalette"
                  :options="paletteOptions"
                  @input="selectedPalette = $event; handlePaletteChange()"
                  class="filter-select-dropdown"
                />
              </div>
            </div>
            
            <!-- Border Appearance (Choropleth mode only) -->
            <div v-if="currentMode === 'choropleth'" class="option-group">
              <label class="option-label">Вид границ</label>
              <custom-select
                :value="selectedBorderAppearance"
                :options="borderAppearanceOptions"
                @input="selectedBorderAppearance = $event; handleBorderAppearanceChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Hover Behavior (Choropleth mode only) -->
            <div v-if="currentMode === 'choropleth'" class="option-group">
              <label class="option-label">Эффект при наведении</label>
              <custom-select
                :value="selectedHoverBehavior"
                :options="hoverBehaviorOptions"
                @input="selectedHoverBehavior = $event; handleHoverBehaviorChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Aggregation Method (Choropleth mode only) -->
            <div v-if="currentMode === 'choropleth'" class="option-group">
              <label class="option-label">Тип агрегации</label>
              <custom-select
                :value="selectedAggregationMethod"
                :options="aggregationMethodOptions"
                @input="selectedAggregationMethod = $event; handleAggregationMethodChange()"
                class="filter-select-dropdown"
              />
            </div>
            
            <!-- Checkboxes -->
            <div v-if="props.enableLegendToggle" class="option-checkboxes">
              <label class="option-checkbox-item">
                <span class="option-checkbox-label">Легенда</span>
                <input 
                  type="checkbox" 
                  v-model="isLegendEnabled"
                  @change="handleLegendToggle"
                  class="option-checkbox"
                />
              </label>
              <label v-if="currentMode === 'animation'" class="option-checkbox-item">
                <span class="option-checkbox-label">График событий</span>
                <input 
                  type="checkbox" 
                  v-model="isChartEnabled"
                  @change="handleChartToggle"
                  class="option-checkbox"
                />
              </label>
            </div>          
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div 
        v-if="props.showLegend && hasData"
        class="elemwowmap-legend-wrapper"
        :class="{ 'is-dragging': isLegendDragging }"
        :style="{ top: legendPosition.top + 'px', right: legendPosition.right + 'px' }"
        @mousedown="handleLegendDragStart"
        @touchstart="handleLegendDragStart"
      >
        <!-- Heatmap Legend (gradient style) -->
        <w-heatmap-legend
          v-if="currentMode === 'heatmap'"
          :current-theme="currentTheme"
          :show-legend="props.showLegend"
          :data-point-count="filteredDatasets.length"
          :total-row-count="rowCount"
          :radius="heatmapRadiusLocal"
        />
        
        <!-- Choropleth Legend (color ranges) -->
        <w-choropleth-legend
          v-else-if="currentMode === 'choropleth'"
          :data="filteredChoroplethDataForLegend"
          :color-scheme="effectiveColorScheme"
          :color-steps="props.choroplethColorSteps || 5"
          :title="choroplethLegendTitle"
          :current-theme="currentTheme"
          :show-legend="props.showLegend"
        />
        
        <!-- Regular Legend (categorical style) -->
        <w-map-legend
          v-else
          :items="legendItems"
          :title="'Легенда'"
          :current-theme="currentTheme"
          :show-legend="props.showLegend"
        />
      </div>

    </div>
  </w-elem>
  <!-- eslint-enable vue/component-name-in-template-casing -->
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetBaseMixin, ElemDatasetBaseMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
import { unit2PxMixin, registerDescriptorVariable } from './utils/mixins';
import { 
    transformDatasetToMapFormat, 
    extractUniqueValues, 
    applyFilters, 
    aggregateByRegion,
    getCategoryColor 
} from './utils/dataTransform';

import { 
    PREDEFINED_COLORS,
    ANIMATION_SPEED_MS,
    FADE_DURATION_DAYS,
    DEFAULT_PROPS,
    HEATMAP_DEFAULT_RADIUS,
    HEATMAP_DEFAULT_BLUR,
    HEATMAP_MIN_OPACITY_VALUE,
    DOT_DEFAULT_SIZE,
    CHOROPLETH_COLOR_SCHEME_OPTIONS,
    ColorPalettes
} from './utils/constants';
// Static imports for non-Leaflet components (always needed)
import ChoroplethMap from './components/ChoroplethMap.vue';
import MapEmptyState from './components/MapEmptyState.vue';
import MapLegend from './components/MapLegend.vue';
import HeatmapLegend from './components/HeatmapLegend.vue';
import ChoroplethLegend from './components/ChoroplethLegend.vue';
import CustomSelect from './components/CustomSelect.vue';
// Lazy load Leaflet-dependent components only when needed (not in choropleth mode)
// This ensures leaflet and its plugins are not loaded when using choropleth mode
const LeafletMap = () => import('./components/LeafletMap.vue');
const HeatmapLayer = () => import('./components/HeatmapLayer.vue');
const DotsLayer = () => import('./components/DotsLayer.vue');
const AnimationLayer = () => import('./components/AnimationLayer.vue');
const EventTimelineChart = () => import('./components/EventTimelineChart.vue');
const MarkerOverlayLayer = () => import('./components/MarkerOverlayLayer.vue');

const Constants = { 
    ANIMATION_SPEED_MS, 
    FADE_DURATION_DAYS,
    HEATMAP_RADIUS: HEATMAP_DEFAULT_RADIUS,
    HEATMAP_BLUR: HEATMAP_DEFAULT_BLUR,
    HEATMAP_MIN_OPACITY: HEATMAP_MIN_OPACITY_VALUE
};

export default {
    extends: Elem,
    meta,

    components: {
        // Lazy-loaded Leaflet components (only loaded when currentMode !== 'choropleth')
        'w-leaflet-map': LeafletMap,
        'w-heatmap-layer': HeatmapLayer,
        'w-dots-layer': DotsLayer,
        'w-animation-layer': AnimationLayer,
        'w-marker-overlay': MarkerOverlayLayer,
        // Static imports for non-Leaflet components
        'w-choropleth-map': ChoroplethMap,
        'w-map-legend': MapLegend,
        'w-heatmap-legend': HeatmapLegend,
        'w-choropleth-legend': ChoroplethLegend,
        'w-map-empty-state': MapEmptyState,
        'custom-select': CustomSelect,
        'w-event-timeline-chart': EventTimelineChart
    },
    
    mixins: [useElemDatasetBaseMixin({ panel: false }), unit2PxMixin],

    data() {
        return {
            // Data
            allDatasets: [],
            filteredDatasets: [],
            uniqueYears: [],
            uniqueCategories: [],
            categoryColorsMap: {},
            predefinedColorsList: PREDEFINED_COLORS,
            
            // Pagination state (similar to ElemWowTable)
            page: 1,
            limit: null, // Will be set from dataset request or default to 100
            pages: null,
            rowCount: null,
            accumulatedRows: [],
            loadedPagesSet: new Set([1]),
            isLoadingPage: false,
            
            // State
            isLoading: false,
            error: null,
            currentMode: 'heatmap',
            selectedYears: [],
            selectedCategories: [],
            leafletMapInstance: null,
            choroplethData: {},
            visibleRegionIds: [], // Track visible regions for drill-down legend filtering
            visibleRegionValues: {}, // Track visible region values (including parent values when coloring by parent)
            
            // Animation state
            isPlaying: false,
            currentAnimationDate: null,
            hasAnimationPlayed: false,
            animationSpeedLocal: 1,
            animationSpeedMs: Constants.ANIMATION_SPEED_MS,
            fadeDurationDays: Constants.FADE_DURATION_DAYS,
            activeParticles: [],
            
            // Single selection for dropdowns (map2 style)
            selectedSingleYear: '',
            selectedSingleCategory: '',
            
            // Options panel state
            isShowingOptions: false,
            selectedTheme: 'dark',
            selectedFadeOption: 'medium',
            selectedParticleSize: 'medium',
            selectedBorderAppearance: 'theme',
            selectedHoverBehavior: 'color',
            selectedAggregationMethod: 'sum',
            selectedMetric: null,
            selectedPalette: null,
            isLegendEnabled: true,
            isChartEnabled: true,
            isChartMinimized: false,
            isPanelMinimized: false,
            
            // Panel dragging state
            panelPosition: { top: 20, left: 20 },
            isDragging: false,
            dragStartPos: { x: 0, y: 0 },
            dragStartPanelPos: { top: 0, left: 0 },
            
            // Legend dragging state
            legendPosition: { top: 16, right: 16 },
            isLegendDragging: false,
            legendDragStartPos: { x: 0, y: 0 },
            legendDragStartLegendPos: { top: 0, right: 0 },
            
            // Lasso tool state
            isLassoActive: false,
            isLassoFilterApplied: false,
            lassoFilterBounds: null,
            lassoPathCoords: null,
            lassoDisplayPolygon: null,
            lassoToggleTimeout: null, // Debounce for lasso toggle
            
            // Heatmap controls local state
            heatmapRadiusLocal: Constants.HEATMAP_RADIUS,
            heatmapBlurLocal: Constants.HEATMAP_BLUR,
            heatmapMinOpacityLocal: Constants.HEATMAP_MIN_OPACITY,
            isRenderingHeatmap: false, // Loading state for heatmap rendering
            
            // Dots controls local state
            dotSizeLocal: DEFAULT_PROPS.dotSize || DOT_DEFAULT_SIZE,
            renderedDots: [], // Separate dots data state (populated on Draw)
            isRenderingDots: false, // Loading state for dots rendering
            
            // Variable tracking
            dimensionMetricVars: [],
            
            // Dataset mixin types
            ...ElemDatasetBaseMixinTypes
        };
    },

    computed: {
        themeClass() {
            return `theme-${this.props.theme || 'light'}`;
        },

        /**
         * Overlay markers computed from filteredDatasets via markerLatField/markerLonField/markerLabelField.
         * Used by ChoroplethMap and Leaflet-mode marker layers.
         */
        overlayMarkers() {
            const latField = this.props.markerLatField;
            const lonField = this.props.markerLonField;
            const labelField = this.props.markerLabelField;
            if (!latField || !lonField) return [];
            return (this.filteredDatasets || [])
                .map(row => ({
                    lat: parseFloat(row[latField]),
                    lon: parseFloat(row[lonField]),
                    label: labelField ? String(row[labelField] || '') : ''
                }))
                .filter(m => !isNaN(m.lat) && !isNaN(m.lon));
        },

        /**
         * Top-N filtered version of filteredDatasets (applied for dots/heatmap modes).
         * When topN is 0/null/undefined, returns the full set.
         */
        topNFilteredDatasets() {
            const topN = this.props.topN;
            const valueField = this.props.valueField;
            if (!topN || topN <= 0 || !valueField) return this.filteredDatasets;
            const order = this.props.topNOrder === 'asc' ? 1 : -1;
            const sorted = [...this.filteredDatasets].sort((a, b) => {
                const va = parseFloat(a[valueField]) || 0;
                const vb = parseFloat(b[valueField]) || 0;
                return order * (va - vb);
            });
            return sorted.slice(0, topN);
        },

        /**
         * Get appropriate tile provider based on theme
         * Auto-switch to dark tiles when using dark themes
         */
        effectiveTileProvider() {
            // Use currentTheme computed (which uses selectedTheme) for better reactivity
            const theme = this.currentTheme;
            const explicitProvider = this.props.mapTileProvider;
            
            
            // If user explicitly set a tile provider, respect it
            // unless it's the default 'osm' and we're in dark mode
            if (explicitProvider && explicitProvider !== 'osm') {
                return explicitProvider;
            }

            // Auto-switch to dark tiles for dark themes
            if (theme === 'dark') {
                return 'osm-dark';
            }

            if (theme === 'blue') {
                return 'osm-dark';
            }
            
            // Default for light theme
            return explicitProvider || 'osm';
        },

        hasData() {
            return this.allDatasets && this.allDatasets.length > 0;
        },

        hasDatasetConfigured() {
            // Check if dataset is configured (has dimensions or is connected)
            return this.hasDataset || (this.dimensions && this.dimensions.length > 0);
        },

        shouldShowEmptyState() {
            // Show empty state when:
            // 1. Not loading
            // 2. No error
            // 3. No data OR dataset not configured
            if (this.isLoading) {
                return false;
            }
            
            if (this.error) {
                return false;
            }
            
            // Show if no data
            if (!this.hasData) {
                return true;
            }
            
            return false;
        },

        emptyStateTitle() {
            if (!this.hasDatasetConfigured) {
                return 'Источник данных не настроен';
            }
            
            // Check if required fields are mapped
            if (this.props.latitudeField == null || this.props.longitudeField == null) {
                return 'Не указаны координаты';
            }
            
            // For Animation mode, date field is required
            if (this.currentMode === 'animation' && this.props.dateField == null) {
                return 'Не указано поле даты';
            }
            
            // Dataset configured but no data returned
            return 'Нет данных для отображения';
        },

        emptyStateDescription() {
            if (!this.hasDatasetConfigured) {
                return 'Подключите источник данных для визуализации событий на карте';
            }
            
            // Check required fields
            if (this.props.latitudeField == null || this.props.longitudeField == null) {
                return 'Укажите поля широты и долготы в панели "Поля данных" для отображения данных на карте';
            }
            
            // For Animation mode, date field is required
            if (this.currentMode === 'animation' && this.props.dateField == null) {
                return 'Для режима анимации необходимо указать поле даты в панели "Поля данных"';
            }
            
            // All configured but no data
            return 'Источник данных не содержит записей или все записи отфильтрованы. Проверьте фильтры и параметры запроса';
        },

        fieldMapping() {
            // Use selected metric from runtime settings if available, otherwise use first metric
            const { metrics } = this.props;
            const metricsLength = metrics?.length ?? 0;
            let selectedMetricValue = null;
            
            // For choropleth mode, ALWAYS use the first metric for coloring
            if (this.currentMode === 'choropleth') {
                selectedMetricValue = metricsLength > 0 ? metrics[0] : null;
            } else {
                // For other modes, use selected metric or fall back to first metric
                if (this.selectedMetric != null && metrics.includes(this.selectedMetric)) {
                    selectedMetricValue = this.selectedMetric;
                } else if (metricsLength > 0) {
                    selectedMetricValue = metrics[0];
                }
            }
            
            return {
                latitudeField: this.props.latitudeField,
                longitudeField: this.props.longitudeField,
                dateField: this.props.dateField,
                categoryField: this.props.categoryField,
                valueField: selectedMetricValue || this.props.valueField,
                descriptionField: this.props.descriptionField,
                regionCodeField: this.props.regionCodeField
            };
        },

        legendItems() {
            if (this.filteredDatasets == null || this.filteredDatasets.length === 0) {
                return [];
            }

            // Count by category
            const categoryCounts = {};
            this.filteredDatasets.forEach(record => {
                const category = record.category_event || 'Unknown';
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });

            // Build legend items and populate categoryColorsMap
            return Object.keys(categoryCounts).map(category => ({
                category,
                count: categoryCounts[category],
                color: getCategoryColor(category, this.categoryColorsMap, PREDEFINED_COLORS, this.props.categoryColors)
            })).sort((aaa, bbb) => bbb.count - aaa.count);
        },
        
        /**
         * Ensure categoryColorsMap is built for all unique categories
         */
        categoryColorsMapComputed() {
            // Build color map for all unique categories
            if (this.uniqueCategories && this.uniqueCategories.length > 0) {
                this.uniqueCategories.forEach(category => {
                    getCategoryColor(category, this.categoryColorsMap, PREDEFINED_COLORS, this.props.categoryColors);
                });
            }
            return this.categoryColorsMap;
        },
        
        currentTheme() {
            // Use selectedTheme (local data) instead of props.theme for better reactivity
            // selectedTheme is kept in sync with props.theme via watchers
            return this.selectedTheme || this.props.theme || 'light';
        },
        
        availableMetricsOptions() {
            const metrics = this.props.metrics || [];
            if (metrics.length === 0) {
                return [{ value: null, label: '-- Нет метрик --' }];
            }
            
            return metrics.map(metric => {
                const settings = this.props.metricSettings || {};
                const metricConfig = settings[metric] || {};
                const label = metricConfig.label || metric;
                return { value: metric, label };
            });
        },
        
        paletteOptions() {
            return CHOROPLETH_COLOR_SCHEME_OPTIONS || [];
        },
        
        yearOptions() {
            return [
                { value: '', label: 'Весь период' },
                ...this.uniqueYears.map(year => ({ value: year, label: String(year) }))
            ];
        },
        
        categoryOptions() {
            return [
                { value: '', label: 'Все категории' },
                ...this.uniqueCategories.map(category => ({ value: category, label: category }))
            ];
        },
        
        modeOptions() {
            return [
                { value: 'animation', label: 'Анимация' },
                { value: 'heatmap', label: 'Тепловая карта' },
                { value: 'dots', label: 'Точечная карта' },
                { value: 'choropleth', label: 'Хороплет' }
            ];
        },
        
        themeOptions() {
            return [
                { value: 'light', label: 'Светлая' },
                { value: 'dark', label: 'Темная' },
                { value: 'blue', label: 'Синяя' }
            ];
        },
        
        fadeOptions() {
            return [
                { value: 'low', label: 'Низкое' },
                { value: 'medium', label: 'Среднее' },
                { value: 'high', label: 'Высокое' }
            ];
        },
        
        particleSizeOptions() {
            return [
                { value: 'small', label: 'Маленький' },
                { value: 'medium', label: 'Средний' },
                { value: 'large', label: 'Большой' }
            ];
        },
        
        borderAppearanceOptions() {
            return [
                { value: 'theme', label: 'Как в теме' },
                { value: 'colored', label: 'Цветные' },
                { value: 'neon', label: 'Неоновое свечение' }
            ];
        },
        
        hoverBehaviorOptions() {
            return [
                { value: 'color', label: 'Изменить цвет/границу' },
                { value: 'scale', label: 'Увеличить регион' },
                { value: 'both', label: 'Оба эффекта' }
            ];
        },
        
        aggregationMethodOptions() {
            return [
                { value: 'count', label: 'Количество' },
                { value: 'sum', label: 'Сумма' },
                { value: 'average', label: 'Среднее' },
                { value: 'min', label: 'Минимум' },
                { value: 'max', label: 'Максимум' }
            ];
        },
        
        effectiveColorScheme() {
            // Use selectedPalette if available, otherwise use prop
            return this.selectedPalette || this.props.choroplethColorScheme || 'Blues';
        },
        
        choroplethTooltipMetrics() {
            // Use configured tooltip metrics if available, otherwise default to all metrics or selected metric
            if (this.props.choroplethTooltipMetrics && this.props.choroplethTooltipMetrics.length > 0) {
                return this.props.choroplethTooltipMetrics;
            }
            
            // Fallback: if no tooltip metrics configured, use the selected metric for backward compatibility
            if (this.selectedMetric) {
                return [this.selectedMetric];
            }
            
            // If still nothing, return empty array (will use legacy single value display)
            return [];
        },
        
        /**
         * Choropleth legend title showing the first metric's label
         */
        choroplethLegendTitle() {
            const metrics = this.props.metrics || [];
            if (metrics.length === 0) {
                return 'Легенда';
            }
            
            const firstMetric = metrics[0];
            const metricSettings = this.props.metricSettings || {};
            const metricConfig = metricSettings[firstMetric] || {};
            const metricLabel = metricConfig.label || firstMetric;
            
            return metricLabel;
        },
        
        /**
         * Filter choropleth data for legend based on visible regions when drill-down is active
         */
        filteredChoroplethDataForLegend() {
            // If drill-down is disabled, return all data
            if (this.props.enableDrillDown == null || this.props.enableDrillDown === false) {
                return this.choroplethData;
            }
            
            // If no visible regions specified yet, return all data (initial state)
            if (this.visibleRegionIds.length === 0) {
                return this.choroplethData;
            }
            
            // Filter data to only include visible regions
            // Prioritize visible region values (parent values when coloring by parent level)
            const filtered = {};
            const dataKeys = Object.keys(this.choroplethData);
            
            this.visibleRegionIds.forEach(regionId => {
                const normalizedId = String(regionId).trim();
                
                // First, check if we have a displayed value from visibleRegionValues (parent value)
                // This is the actual value shown on the map when coloring by parent level
                if (this.visibleRegionValues != null && this.visibleRegionValues[regionId] != null) {
                    const displayedValue = this.visibleRegionValues[regionId];
                    if (typeof displayedValue === 'number' && !Number.isNaN(displayedValue)) {
                        filtered[normalizedId] = displayedValue;
                        return;
                    }
                }
                
                // Otherwise, try to find value in choropleth data
                let value = this.choroplethData[normalizedId];
                
                // Try exact match first
                if (value != null) {
                    filtered[normalizedId] = value;
                    return;
                }
                
                // Try numeric conversion if ID is numeric
                if (/^\d+$/.test(normalizedId)) {
                    const numId = Number(normalizedId);
                    value = this.choroplethData[String(numId)] || this.choroplethData[numId];
                    if (value != null) {
                        filtered[normalizedId] = value;
                        return;
                    }
                }
                
                // Try matching with leading zeros removed/added
                if (/^0\d+$/.test(normalizedId)) {
                    const withoutLeadingZero = normalizedId.replace(/^0+/, '');
                    value = this.choroplethData[withoutLeadingZero] || this.choroplethData[String(Number(withoutLeadingZero))];
                    if (value != null) {
                        filtered[normalizedId] = value;
                        return;
                    }
                }
                
                // Try reverse lookup - find data key that matches this region ID
                for (const dataKey of dataKeys) {
                    const normalizedKey = String(dataKey).trim();
                    if (normalizedKey === normalizedId) {
                        filtered[normalizedId] = this.choroplethData[dataKey];
                        return;
                    }
                    // Try numeric comparison
                    if (/^\d+$/.test(normalizedId) && /^\d+$/.test(normalizedKey)) {
                        if (Number(normalizedId) === Number(normalizedKey)) {
                            filtered[normalizedId] = this.choroplethData[dataKey];
                            return;
                        }
                    }
                }
            });
            
            // If filtering resulted in empty data, fall back to showing all data
            // This ensures the legend always displays meaningful information
            if (Object.keys(filtered).length === 0) {
                return this.choroplethData;
            }
            
            return filtered;
        },
        
        palettePreviewStyle() {
            const paletteName = this.selectedPalette || 'Blues';
            const palette = ColorPalettes[paletteName];
            
            if (palette == null || palette.length === 0) {
                return { background: 'linear-gradient(to right, #deebf7, #08306b)' };
            }
            
            // Create gradient from palette colors
            const gradientColors = palette.join(', ');
            return {
                background: `linear-gradient(to right, ${gradientColors})`
            };
        },
        
        currentAnimationDateDisplay() {
            if (this.currentAnimationDate == null) {
                return '--.--.----';
            }
            const date = new Date(this.currentAnimationDate);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },
        
        /**
         * Build chart timeline data from activeParticles (EXACT from map2)
         */
        chartTimelineData() {
            const chartDataItems = [];
            const dailyAggregates = {};

            const chartEndDate = this.currentAnimationDate
                ? new Date(this.currentAnimationDate.getTime())
                : null;
            if (chartEndDate != null) {
                chartEndDate.setHours(23, 59, 59, 999);
            }

            // Use activeParticles for chart data
            const dataForChart = this.activeParticles || [];

            dataForChart.forEach(item => {
                const eventDate = new Date(item.date);
                eventDate.setHours(0, 0, 0, 0);
                if (chartEndDate != null && eventDate > chartEndDate) {
                    return;
                }
                const dateStr = eventDate.toISOString().split('T')[0];
                if (dailyAggregates[dateStr] == null) {
                    dailyAggregates[dateStr] = {};
                }
                const category = item.category || 'Unknown';
                dailyAggregates[dateStr][category] = (dailyAggregates[dateStr][category] || 0) + 1;
            });

            Object.keys(dailyAggregates).sort().forEach(dateStr => {
                chartDataItems.push({ date: dateStr, counts: dailyAggregates[dateStr] });
            });
            
            return chartDataItems;
        },
        
        /**
         * Maximum events per day for chart scaling
         */
        maxEventsOverall() {
            const DEFAULT_MAX_EVENTS = 20;
            if (this.chartTimelineData.length === 0) {
                return DEFAULT_MAX_EVENTS;
            }
            const maxInData = Math.max(...this.chartTimelineData.map(dataItem => {
                const total = Object.values(dataItem.counts || {}).reduce((sum, count) => sum + count, 0);
                return total;
            }));
            return Math.max(DEFAULT_MAX_EVENTS, Math.ceil(maxInData));
        },
        
        /**
         * Total days in timespan for chart X-axis
         */
        totalDaysInTimespan() {
            const DAYS_IN_LEAP_YEAR = 366;
            if (this.filteredDatasets.length === 0) {
                return DAYS_IN_LEAP_YEAR;
            }
            const dates = this.filteredDatasets.map(dataItem => new Date(dataItem.date_event || dataItem.date));
            const minDate = new Date(Math.min(...dates.map(dateItem => dateItem.getTime())));
            const maxDate = new Date(Math.max(...dates.map(dateItem => dateItem.getTime())));
            minDate.setHours(0, 0, 0, 0);
            maxDate.setHours(0, 0, 0, 0);
            const diffTime = maxDate.getTime() - minDate.getTime();
            const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
            const diffDays = Math.ceil(diffTime / MILLISECONDS_PER_DAY);
            const INCLUDE_BOTH_ENDS = 1;
            return Math.max(1, diffDays + INCLUDE_BOTH_ENDS); // +1 to include both start and end days
        },
        
        /**
         * Translation function for chart component
         */
        translationFunction() {
            return (key, defaultValue) => {
                // Simple translation function - can be enhanced later
                const translations = {
                    'chart.title': 'График событий',
                    'chart.highlight.total': 'Всего',
                    'chart.highlight.segment': 'Сегмент',
                    'chart.noDataAnimationReady': 'Анимация готова. Нажмите воспроизведение для просмотра данных.'
                };
                return translations[key] || defaultValue || key;
            };
        },
        
        /**
         * Check if animation is ready
         */
        isAnimationReady() {
            return this.currentAnimationDate != null;
        },
        
        /**
         * Generate CSS from customStyles prop
         * Similar to ElemWowTable pattern
         */
        customStylesCSS() {
            const { customStyles } = this.props;
            if (customStyles == null || typeof customStyles !== 'object') {
                return '';
            }
            
            // Map of element keys to CSS selectors
            const selectorMap = {
                // Base Container
                mapContainer: '.elemwowmap-widget-root .map-container',
                mapRoot: '.elemwowmap-widget-root',
                
                // Controls Panel
                controlsPanel: '.elemwowmap-widget-root .elemwowmap-controls-panel',
                controlsPanelContent: '.elemwowmap-widget-root .elemwowmap-controls-content',
                controlsPanelFront: '.elemwowmap-widget-root .elemwowmap-controls-front',
                controlsPanelBack: '.elemwowmap-widget-root .elemwowmap-controls-back',
                controlsHeader: '.elemwowmap-widget-root .controls-header',
                filterTitleHeader: '.elemwowmap-widget-root .filter-title-header',
                controlsLabel: '.elemwowmap-widget-root .controls-label',
                controlsTitle: '.elemwowmap-widget-root .controls-title',
                headerButtons: '.elemwowmap-widget-root .header-buttons',
                dateDisplay: '.elemwowmap-widget-root .date-display',
                dateLabel: '.elemwowmap-widget-root .date-label',
                dateValue: '.elemwowmap-widget-root .date-value',
                settingsBtn: '.elemwowmap-widget-root .settings-btn',
                
                // Filters in Controls
                controlsFilters: '.elemwowmap-widget-root .controls-filters',
                filterRow: '.elemwowmap-widget-root .filter-row',
                filterRowLabel: '.elemwowmap-widget-root .filter-row-label',
                filterSelectDropdown: '.elemwowmap-widget-root .filter-select-dropdown',
                
                // Animation Controls
                animationControlsCompact: '.elemwowmap-widget-root .animation-controls-compact',
                controlButtonsRow: '.elemwowmap-widget-root .control-buttons-row',
                controlIconBtn: '.elemwowmap-widget-root .control-icon-btn',
                controlIconBtnActive: '.elemwowmap-widget-root .control-icon-btn.active',
                controlIconBtnWarn: '.elemwowmap-widget-root .control-icon-btn-warn',
                speedControl: '.elemwowmap-widget-root .speed-control',
                speedLabel: '.elemwowmap-widget-root .speed-label',
                speedSlider: '.elemwowmap-widget-root .speed-slider',
                
                // Heatmap Controls
                heatmapControlsCompact: '.elemwowmap-widget-root .heatmap-controls-compact',
                heatmapSliders: '.elemwowmap-widget-root .heatmap-sliders',
                sliderControl: '.elemwowmap-widget-root .slider-control',
                sliderLabel: '.elemwowmap-widget-root .slider-label',
                sliderRow: '.elemwowmap-widget-root .slider-row',
                heatmapSlider: '.elemwowmap-widget-root .heatmap-slider',
                sliderValue: '.elemwowmap-widget-root .slider-value',
                heatmapLoadingIndicator: '.elemwowmap-widget-root .heatmap-loading-indicator',
                heatmapLoadingSpinner: '.elemwowmap-widget-root .heatmap-loading-spinner',
                
                // Dots Controls
                dotsControlsCompact: '.elemwowmap-widget-root .dots-controls-compact',
                dotsSliders: '.elemwowmap-widget-root .dots-sliders',
                dotsSlider: '.elemwowmap-widget-root .dots-slider',
                dotsLoadingIndicator: '.elemwowmap-widget-root .dots-loading-indicator',
                dotsLoadingSpinner: '.elemwowmap-widget-root .dots-loading-spinner',
                dotsLoadingText: '.elemwowmap-widget-root .dots-loading-text',
                
                // Options Panel (Settings Back Face)
                optionsList: '.elemwowmap-widget-root .options-list',
                optionGroup: '.elemwowmap-widget-root .option-group',
                optionLabel: '.elemwowmap-widget-root .option-label',
                optionCheckboxes: '.elemwowmap-widget-root .option-checkboxes',
                optionCheckboxItem: '.elemwowmap-widget-root .option-checkbox-item',
                optionCheckboxLabel: '.elemwowmap-widget-root .option-checkbox-label',
                optionCheckbox: '.elemwowmap-widget-root .option-checkbox',
                optionHint: '.elemwowmap-widget-root .option-hint',
                paletteSelector: '.elemwowmap-widget-root .palette-selector',
                palettePreview: '.elemwowmap-widget-root .palette-preview',
                
                // Legend Wrapper
                legendWrapper: '.elemwowmap-widget-root .elemwowmap-legend-wrapper',
                
                // Legend Components
                legendColorBox: '.elemwowmap-widget-root .elemwowmap-legend-color-box',
                legendLabel: '.elemwowmap-widget-root .elemwowmap-legend-label',
                legendCount: '.elemwowmap-widget-root .elemwowmap-legend-count',
                choroplethLegend: '.elemwowmap-widget-root .elemwowmap-choropleth-legend',
                heatmapLegend: '.elemwowmap-widget-root .elemwowmap-heatmap-legend',
                heatmapGradientBar: '.elemwowmap-widget-root .elemwowmap-heatmap-gradient-bar',
                heatmapLabels: '.elemwowmap-widget-root .elemwowmap-heatmap-labels',
                heatmapLabelItem: '.elemwowmap-widget-root .elemwowmap-heatmap-label-item',
                heatmapLabelText: '.elemwowmap-widget-root .elemwowmap-heatmap-label-text',
                heatmapLabelDetail: '.elemwowmap-widget-root .elemwowmap-heatmap-label-detail',
                heatmapTotalCount: '.elemwowmap-widget-root .elemwowmap-heatmap-total-count',
                heatmapCountRow: '.elemwowmap-widget-root .elemwowmap-heatmap-count-row',
                heatmapWarning: '.elemwowmap-widget-root .elemwowmap-heatmap-warning',
                heatmapCountLabel: '.elemwowmap-widget-root .elemwowmap-heatmap-count-label',
                heatmapCountValue: '.elemwowmap-widget-root .elemwowmap-heatmap-count-value',
                
                // Custom Select Component
                customSelectWrapper: '.elemwowmap-widget-root .custom-select-wrapper',
                customSelectTrigger: '.elemwowmap-widget-root .custom-select-trigger',
                triggerPlaceholder: '.elemwowmap-widget-root .trigger-placeholder',
                triggerValue: '.elemwowmap-widget-root .trigger-value',
                dropdownArrow: '.elemwowmap-widget-root .dropdown-arrow',
                arrowOpen: '.elemwowmap-widget-root .arrow-open',
                customSelectDropdown: '.elemwowmap-widget-root .custom-select-dropdown',
                customSelectOption: '.elemwowmap-widget-root .custom-select-option',
                isSelected: '.elemwowmap-widget-root .is-selected',
                isHighlighted: '.elemwowmap-widget-root .is-highlighted',
                selectOptionLabel: '.elemwowmap-widget-root .custom-select-option .option-label',
                checkIcon: '.elemwowmap-widget-root .check-icon',
                
                // Leaflet Map Controls
                leafletZoomControl: '.elemwowmap-widget-root .leaflet-control-zoom',
                leafletZoomButton: '.elemwowmap-widget-root .leaflet-control-zoom a',
                
                // Choropleth SVG
                choroplethContainer: '.elemwowmap-widget-root .choropleth-container',
                choroplethSvgOverlay: '.elemwowmap-widget-root .choropleth-svg-overlay',
                choroplethPath: '.elemwowmap-widget-root .choropleth-svg-overlay path',
                choroplethPathHover: '.elemwowmap-widget-root .choropleth-svg-overlay path:hover',
                
                // Dots Popup
                dotPopupContainer: '.dot-popup-container',
                dotPopupContent: '.dot-popup',
                dotPopupHeader: '.dot-popup-header',
                dotPopupDescription: '.dot-popup-description',
                dotPopupDate: '.dot-popup-date',
                
                // Loading & Error States
                loadingOverlay: '.elemwowmap-widget-root .loading-overlay',
                loadingSpinner: '.elemwowmap-widget-root .loading-spinner',
                errorContainer: '.elemwowmap-widget-root .error-container',
                errorTitle: '.elemwowmap-widget-root .error-title',
                errorMessage: '.elemwowmap-widget-root .error-message'
            };
            
            let cssText = '';
            
            // Build CSS rules
            Object.keys(customStyles).forEach(key => {
                const cssString = customStyles[key];
                if (cssString != null && typeof cssString === 'string' && cssString.trim()) {
                    const selector = selectorMap[key];
                    if (selector != null) {
                        cssText += `${selector} { ${cssString} }\n`;
                    }
                }
            });
            
            return cssText;
        }
    },

    hooks: {
        before(cancel) {
            // Only set loading if we have a dataset
            if (this.hasDataset) {
                this.isLoading = true;
            }
            this.error = null;
            
            // Set pagination parameters - use the dataset's existing limit, don't override
            const currentPage = this.page || 1;
            
            // Try to set pagination on datasetRequests (for useElemDatasetBaseMixin)
            if (this.datasetRequests != null && this.datasetRequests.length > 0) {
                const firstRequest = this.datasetRequests[0];
                if (firstRequest != null && firstRequest.limit != null) {
                    // Use the limit that's already configured in the dataset
                    // Just set the offset based on current page
                    firstRequest.offset = (currentPage - 1) * firstRequest.limit;
                }
            }
            
            // Also try legacy this.request (for older mixin versions)
            if (this.request != null && this.request.limit != null) {
                this.request.offset = (currentPage - 1) * this.request.limit;
            }
        },
        
        then(results) {
            try {
                // Dataset mixin returns array of results: [{ rows: [...] }]
                // For simple widgets (no drilldown), use first result
                if (results == null || !Array.isArray(results) || results.length === 0) {
                    // eslint-disable-next-line no-console
                    this.allDatasets = [];
                    this.isLoading = false;
                    this.isLoadingPage = false;
                    return;
                }
                
                const firstResult = results[0];
                if (firstResult == null || firstResult.rows == null) {
                    // eslint-disable-next-line no-console
                    this.allDatasets = [];
                    this.isLoading = false;
                    this.isLoadingPage = false;
                    return;
                }
                
                // Get the limit from the dataset request that was actually used
                // Don't hardcode or assume - use what the dataset is configured with
                let actualPageSize = null;
                if (this.datasetRequests != null && this.datasetRequests.length > 0) {
                    actualPageSize = this.datasetRequests[0].limit;
                } else if (this.request != null) {
                    actualPageSize = this.request.limit;
                }
                
                // Store the actual limit being used
                if (actualPageSize != null) {
                    this.limit = actualPageSize;
                }
                
                // Extract pagination metadata
                if (firstResult.rowCount != null && actualPageSize != null) {
                    this.rowCount = firstResult.rowCount;
                    this.pages = Math.ceil(this.rowCount / actualPageSize);
                }
                
                // Transform dataset results to map format
                const rawData = transformDatasetToMapFormat(
                    firstResult.rows || [],
                    this.fieldMapping
                );
                
                // Handle pagination: accumulate data across pages
                if (this.page === 1 && this.loadedPagesSet.size === 0) {
                    // First page on initial load: reset accumulated data
                    this.accumulatedRows = [...rawData];
                    this.loadedPagesSet = new Set([1]);
                } else if (this.page === 1) {
                    // Page 1 reload (shouldn't normally happen): reset
                    this.accumulatedRows = [...rawData];
                    this.loadedPagesSet = new Set([1]);
                } else {
                    // Subsequent pages: accumulate
                    this.accumulatedRows = [...this.accumulatedRows, ...rawData];
                    // Note: loadDataPage already added to loadedPagesSet, but adding again is safe (Set handles duplicates)
                    this.loadedPagesSet.add(this.page);
                }
                
                // Set allDatasets to accumulated data
                this.allDatasets = this.accumulatedRows;
                
                // Extract unique values from all accumulated data
                const extractedValues = extractUniqueValues(this.allDatasets);
                const extractedYears = extractedValues.uniqueYears;
                const extractedCategories = extractedValues.uniqueCategories;
                this.uniqueYears = extractedYears;
                this.uniqueCategories = extractedCategories;
                
                // Initialize selected filters if not set (only on first page)
                const selectedYearsLength = this.selectedYears.length;
                const propsSelectedYears = this.props.selectedYears || [];
                const propsSelectedYearsLength = propsSelectedYears.length;
                const selectedCategoriesLength = this.selectedCategories.length;
                const propsSelectedCategories = this.props.selectedCategories || [];
                const propsSelectedCategoriesLength = propsSelectedCategories.length;
                
                if (this.page === 1) {
                    if (selectedYearsLength === 0 && propsSelectedYearsLength === 0) {
                        this.selectedYears = [...extractedYears];
                    } else if (propsSelectedYearsLength > 0) {
                        this.selectedYears = [...propsSelectedYears];
                    }
                    
                    if (selectedCategoriesLength === 0 && propsSelectedCategoriesLength === 0) {
                        this.selectedCategories = [...extractedCategories];
                    } else if (propsSelectedCategoriesLength > 0) {
                        this.selectedCategories = [...propsSelectedCategories];
                    }
                } else {
                    // For subsequent pages: auto-add newly discovered years/categories
                    // This ensures all data from all pages is visible during animation
                    const newYears = extractedYears.filter(year => !this.selectedYears.includes(year));
                    const newCategories = extractedCategories.filter(cat => 
                        !this.selectedCategories.some(selected => selected.toUpperCase() === cat.toUpperCase())
                    );
                    
                    if (newYears.length > 0) {
                        this.selectedYears = [...this.selectedYears, ...newYears].sort((a, b) => a - b);
                    }
                    
                    if (newCategories.length > 0) {
                        this.selectedCategories = [...this.selectedCategories, ...newCategories];
                    }
                }
                
                // Apply current filters
                this.applyCurrentFilters();
                
                // Initialize visualization and center map (only on first page)
                if (this.page === 1) {
                    this.$nextTick(() => {
                        this.initializeVisualization();
                        this.centerMapOnData();
                    });
                } else if (!this.isPlaying || this.currentMode !== 'animation') {
                    // For subsequent pages: reinitialize if not currently playing animation
                    this.$nextTick(() => {
                        this.initializeVisualization();
                    });
                } else {
                    // Page loaded during animation, data will be used automatically
                    // eslint-disable-next-line no-console
                }
                
                // Clear page loading flag
                this.isLoadingPage = false;
            } catch (err) {
                this.error = err;
                this.isLoadingPage = false;
            }
        },
        
        catch(error) {
            this.error = error;
            this.isLoading = false;
            this.isLoadingPage = false;
        },
        
        finally() {
            this.isLoading = false;
        }
    },

    watch: {
        'props.visualizationMode': {
            handler(newMode) {
                if (newMode && newMode !== this.currentMode) {
                    this.currentMode = newMode;
                    this.initializeVisualization();
                }
            }
        },
        
        // Watch currentMode to handle canvas layer removal (EXACT map2 pattern)
        currentMode: {
            handler(newMode, oldMode) {
                if (this.$refs.leafletMap == null && newMode !== 'choropleth') {
                    return;
                }
                
                // Remove canvas layer when leaving Animation mode
                if (oldMode === 'animation' && newMode !== 'animation') {
                    const leafletMapRef = this.$refs.leafletMap;
                    if (leafletMapRef && typeof leafletMapRef.clearParticles === 'function') {
                        leafletMapRef.clearParticles();
                    }
                    this.activeParticles = [];
                }
                
                // Restore canvas layer when entering Animation mode
                if (newMode === 'animation' && oldMode !== 'animation') {
                    this.$nextTick(() => {
                        if (this.$refs.leafletMap && typeof this.$refs.leafletMap.restoreCanvasLayer === 'function') {
                            this.$refs.leafletMap.restoreCanvasLayer();
                        }
                    });
                }
            }
        },
        
        'props.theme': {
            handler(newTheme, oldTheme) {
                // Sync selectedTheme with prop changes
                if (newTheme !== this.selectedTheme) {
                    this.selectedTheme = newTheme;
                }
                
                // Force update to ensure all child components receive new theme
                this.$nextTick(() => {
                    this.$forceUpdate();
                    
                    // Explicitly update LeafletMap's tile layer
                    if (this.$refs.leafletMap && this.leafletMapInstance) {
                        const newTileProvider = this.effectiveTileProvider;
                        this.$refs.leafletMap.updateTileLayer(newTileProvider);
                    }
                });
            },
            immediate: true
        },
        
        'props.animationSpeed': {
            handler(newSpeed) {
                if (newSpeed != null && this.animationSpeedLocal !== newSpeed) {
                    this.animationSpeedLocal = newSpeed;
                    
                    // Update animationSpeedMs based on speed multiplier
                    const baseSpeedMs = Constants.ANIMATION_SPEED_MS;
                    this.animationSpeedMs = Math.round(baseSpeedMs / newSpeed);
                }
            }
        },
        
        'props.animationSpeedMs': {
            handler(newSpeedMs) {
                if (newSpeedMs && this.animationSpeedMs !== newSpeedMs) {
                    const baseSpeedMs = Constants.ANIMATION_SPEED_MS;
                    const calculatedLocal = baseSpeedMs / newSpeedMs;
                    if (this.animationSpeedLocal !== calculatedLocal) {
                        this.animationSpeedLocal = calculatedLocal;
                    }
                    this.animationSpeedMs = newSpeedMs;
                }
            }
        },
        
        'props.fadeTime': {
            handler(newFadeTime) {
                if (newFadeTime != null && this.fadeDurationDays !== newFadeTime) {
                    this.fadeDurationDays = newFadeTime;
                    
                    // Update selectedFadeOption to match
                    let newOption;
                    if (newFadeTime <= 1) {
                        newOption = 'low';
                    // eslint-disable-next-line no-magic-numbers
                    } else if (newFadeTime <= 3) {
                        newOption = 'medium';
                    } else {
                        newOption = 'high';
                    }
                    
                    if (this.selectedFadeOption !== newOption) {
                        this.selectedFadeOption = newOption;
                    }
                }
            }
        },
        
        'props.heatmapRadius': {
            handler(newRadius) {
                if (newRadius != null && this.heatmapRadiusLocal !== newRadius) {
                    this.heatmapRadiusLocal = newRadius;
                }
            }
        },
        
        'props.heatmapBlur': {
            handler(newBlur) {
                if (newBlur != null && this.heatmapBlurLocal !== newBlur) {
                    this.heatmapBlurLocal = newBlur;
                }
            }
        },
        
        'props.heatmapMinOpacity': {
            handler(newMinOpacity) {
                if (newMinOpacity != null && this.heatmapMinOpacityLocal !== newMinOpacity) {
                    this.heatmapMinOpacityLocal = newMinOpacity;
                }
            }
        },
        
        'props.dotSize': {
            handler(newSize) {
                if (newSize != null && this.dotSizeLocal !== newSize) {
                    this.dotSizeLocal = newSize;
                }
            }
        },
        
        'props.showLegend': {
            handler(newValue) {
                if (newValue !== undefined) {
                    this.isLegendEnabled = newValue !== false;
                }
            }
        },
        
        'props.showChart': {
            handler(newValue) {
                if (newValue !== undefined) {
                    this.isChartEnabled = newValue !== false;
                }
            }
        },
        
        // Watch lasso state to draw/remove polygon (map2 style)
        isLassoFilterApplied: {
            handler() {
                this.updateLassoDisplayPolygon();
            }
        },
        
        lassoPathCoords: {
            handler() {
                this.updateLassoDisplayPolygon();
            }
        },
        
        selectedMetric: {
            handler() {
                // Update choropleth data when metric changes
                if (this.currentMode === 'choropleth') {
                    this.$nextTick(() => {
                        this.updateChoroplethData();
                    });
                }
            }
        },
        
        'props.choroplethAggregationMethod': {
            handler(newValue) {
                if (newValue != null && this.selectedAggregationMethod !== newValue) {
                    this.selectedAggregationMethod = newValue;
                }
            }
        },
        
        'props.choroplethColorScheme': {
            handler(newValue) {
                if (newValue != null && this.selectedPalette !== newValue) {
                    this.selectedPalette = newValue;
                }
            },
            immediate: true
        },
        
        'props.choroplethBorderAppearance': {
            handler(newValue) {
                if (newValue != null && this.selectedBorderAppearance !== newValue) {
                    this.selectedBorderAppearance = newValue;
                }
            },
            immediate: true
        },
        
        'props.choroplethHoverBehavior': {
            handler(newValue) {
                if (newValue != null && this.selectedHoverBehavior !== newValue) {
                    this.selectedHoverBehavior = newValue;
                }
            },
            immediate: true
        },
        
        'props.particleSizeMultiplier': {
            handler(newValue) {
                if (newValue != null) {
                    // Map multiplier back to size option
                    // eslint-disable-next-line no-magic-numbers
                    if (newValue <= 0.7) {
                        this.selectedParticleSize = 'small';
                    // eslint-disable-next-line no-magic-numbers
                    } else if (newValue <= 1.0) {
                        this.selectedParticleSize = 'medium';
                    } else {
                        this.selectedParticleSize = 'large';
                    }
                }
            },
            immediate: true
        }
    },

    mounted() {
        // Initialize mode from props
        if (this.props.visualizationMode) {
            this.currentMode = this.props.visualizationMode;
        }
        
        // Initialize options panel values from props
        this.selectedTheme = this.props.theme || 'dark';
        this.selectedBorderAppearance = this.props.choroplethBorderAppearance || 'theme';
        this.selectedHoverBehavior = this.props.choroplethHoverBehavior || 'color';
        this.selectedAggregationMethod = this.props.choroplethAggregationMethod || 'sum';
        this.selectedPalette = this.props.choroplethColorScheme || (CHOROPLETH_COLOR_SCHEME_OPTIONS[0]?.value || 'YlOrRds');
        
        // Auto-set Neon palette and neon borders for dark theme ONLY on first load (when props are null)
        // Don't override user's saved preferences
        if (this.selectedTheme === 'dark' && this.currentMode === 'choropleth') {
            // Only set if prop is null (not saved yet) - don't override saved values
            if (this.props.choroplethColorScheme == null) {
                this.$set(this.props, 'choroplethColorScheme', 'Neons');
                this.propChanged('choroplethColorScheme');
                this.selectedPalette = 'Neons';
            }
            if (this.props.choroplethBorderAppearance == null) {
                this.$set(this.props, 'choroplethBorderAppearance', 'neon');
                this.propChanged('choroplethBorderAppearance');
                this.selectedBorderAppearance = 'neon';
            }
        }
        
        // Initialize selected metric - use first metric if available
        const metrics = this.props.metrics || [];
        if (metrics.length > 0) {
            this.selectedMetric = metrics[0];
        }
        
        // Initialize tooltip metrics if not configured - default to first metric for choropleth mode
        if (this.currentMode === 'choropleth' && (!this.props.choroplethTooltipMetrics || this.props.choroplethTooltipMetrics.length === 0)) {
            if (metrics.length > 0) {
                this.$set(this.props, 'choroplethTooltipMetrics', [metrics[0]]);
                this.propChanged('choroplethTooltipMetrics');
            }
        }
        
        this.isLegendEnabled = this.props.showLegend !== false;
        this.isChartEnabled = this.props.showChart !== false;
        
        // Initialize animation speed from props
        if (this.props.animationSpeed) {
            this.animationSpeedLocal = this.props.animationSpeed;
        } else if (this.props.animationSpeedMs) {
            // Convert from ms to multiplier
            const baseSpeedMs = Constants.ANIMATION_SPEED_MS;
            this.animationSpeedLocal = baseSpeedMs / this.props.animationSpeedMs;
        } else {
            this.animationSpeedLocal = 1;
        }
        
        // Initialize fade option from props
        if (this.props.fadeTime) {
            const { fadeTime } = this.props;
            if (fadeTime <= 1) {
                this.selectedFadeOption = 'low';
            // eslint-disable-next-line no-magic-numbers
            } else if (fadeTime <= 3) {
                this.selectedFadeOption = 'medium';
            } else {
                this.selectedFadeOption = 'high';
            }
        } else {
            this.selectedFadeOption = 'medium';
        }

        // Register dataset variables
        this.updateDescriptorVars();
        
        // If no dataset, ensure empty state shows
        if (!this.hasDataset) {
            this.isLoading = false;
        }
    },

    beforeDestroy() {
        // Clean up drag event listeners
        this.handleDragEnd();
        this.handleLegendDragEnd();
        // Cleanup
        this.cleanup();
    },

    methods: {
        /**
         * Get localized mode label
         */
        getModeLabel(mode) {
            const labels = {
                heatmap: 'Тепловая карта',
                dots: 'Точечная карта',
                animation: 'Анимация',
                choropleth: 'Хороплет'
            };
            return labels[mode] || mode;
        },
        
        /**
         * Update descriptor vars for cross-widget communication
         */
        updateDescriptorVars() {
            if (this.descriptor == null || this.descriptor.vars == null) {
                return;
            }
            
            // Register field variables
            const fieldVars = [
                this.props.latitudeField,
                this.props.longitudeField,
                this.props.dateField,
                this.props.categoryField,
                this.props.valueField
            ].filter(Boolean);
            
            fieldVars.forEach(fieldName => {
                if (this.descriptor.vars[fieldName] == null) {
                    this.$set(this.descriptor.vars, fieldName, { 
                        description: fieldName 
                    });
                }
                if (!this.dimensionMetricVars.includes(fieldName)) {
                    this.dimensionMetricVars.push(fieldName);
                }
            });
        },

        /**
         * Apply current filters to data
         */
        applyCurrentFilters() {
            
            let filtered = applyFilters(this.allDatasets, {
                selectedYears: this.selectedYears,
                selectedCategories: this.selectedCategories
            });
            
            
            // Apply lasso polygon filter if active (BUT NOT for dots mode - dots handles lasso internally)
            // Dots mode draws from renderedDots, not filteredDatasets, so lasso filtering happens in handleDrawDots
            if (this.isLassoFilterApplied && this.lassoPathCoords && this.lassoPathCoords.length > 0 && this.currentMode !== 'dots') {
                const LeafletLibLocal = window.L;
                if (LeafletLibLocal != null) {
                    // Create a polygon from lasso path for proper point-in-polygon check
                    const lassoPolygon = LeafletLibLocal.polygon(this.lassoPathCoords);
                    const bounds = lassoPolygon.getBounds();
                    
                    filtered = filtered.filter(record => {
                        if (record.latitude != null && record.longitude != null) {
                            const latLng = LeafletLibLocal.latLng(record.latitude, record.longitude);
                            // Quick rejection using bounding box
                            const isInBounds = bounds.contains(latLng);
                            if (isInBounds === false) {
                                return false;
                            }
                            // More precise check using the actual polygon
                            return this.isPointInPolygon(latLng, this.lassoPathCoords);
                        }
                        return false;
                    });
                }
            }
            
            
            this.filteredDatasets = filtered;
            
            // Update choropleth data when filters change (for choropleth mode)
            if (this.currentMode === 'choropleth') {
                this.$nextTick(() => {
                    this.updateChoroplethData();
                });
            }
        },

        /**
         * Handle year filter toggle - Unused but kept for potential future use
         * @param {number} year - Year to toggle
         */
        // eslint-disable-next-line no-unused-vars
        handleYearToggle(year) {
            // Intentionally unused - kept for future functionality
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.handleYearToggle(year);
            }
            const index = this.selectedYears.indexOf(year);
            if (index > -1) {
                this.selectedYears.splice(index, 1);
            } else {
                this.selectedYears.push(year);
            }
            
            // Sort years
            this.selectedYears.sort((a, b) => a - b);
            
            // Update props
            this.$set(this.props, 'selectedYears', [...this.selectedYears]);
            this.propChanged('selectedYears');
            
            // Reapply filters
            this.applyCurrentFilters();
            
            // Sync to storage
            this.syncFiltersToStorage();
            
            // Refresh visualization
            this.initializeVisualization();
        },

        /**
         * Handle category filter toggle - Unused but kept for potential future use
         * @param {string} category - Category to toggle
         */
        // eslint-disable-next-line no-unused-vars
        handleCategoryToggle(category) {
            // Intentionally unused - kept for future functionality
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.handleCategoryToggle(category);
            }
            const index = this.selectedCategories.indexOf(category);
            if (index > -1) {
                this.selectedCategories.splice(index, 1);
            } else {
                this.selectedCategories.push(category);
            }
            
            // Sort categories
            this.selectedCategories.sort();
            
            // Update props
            this.$set(this.props, 'selectedCategories', [...this.selectedCategories]);
            this.propChanged('selectedCategories');
            
            // Reapply filters
            this.applyCurrentFilters();
            
            // Sync to storage
            this.syncFiltersToStorage();
            
            // Refresh visualization
            this.initializeVisualization();
        },

        /**
         * Handle single year selection (dropdown style)
         */
        handleSingleYearChange() {
            const radix = 10;
            this.selectedYears = this.selectedSingleYear
                ? [parseInt(this.selectedSingleYear, radix)]
                : [...this.uniqueYears];
            this.applyCurrentFilters();
            this.updateDescriptorVars();
        },
        
        /**
         * Handle single category selection (dropdown style)
         */
        handleSingleCategoryChange() {
            this.selectedCategories = this.selectedSingleCategory
                ? [this.selectedSingleCategory]
                : [...this.uniqueCategories];
            this.applyCurrentFilters();
            this.updateDescriptorVars();
        },
        
        /**
         * Handle animation speed change
         */
        handleSpeedChange() {
            // Convert speed multiplier (0.5-5) to milliseconds
            // Lower multiplier = slower = higher ms
            // Higher multiplier = faster = lower ms
            const baseSpeedMs = Constants.ANIMATION_SPEED_MS;
            const calculatedSpeedMs = Math.round(baseSpeedMs / this.animationSpeedLocal);
            
            // Update local state first
            this.animationSpeedMs = calculatedSpeedMs;
            
            // Update prop
            this.$set(this.props, 'animationSpeedMs', calculatedSpeedMs);
            this.propChanged('animationSpeedMs');
            
            // Force update to ensure AnimationLayer receives the new value
            this.$nextTick(() => {
                if (this.$refs.animationLayer) {
                    this.$forceUpdate();
                }
            });
        },
        
        /**
         * Handle fade effect change
         */
        handleFadeChange() {
            // Map fade option to days
            const fadeMap = {
                low: 1,
                // eslint-disable-next-line no-magic-numbers
                medium: 3,
                // eslint-disable-next-line no-magic-numbers
                high: 7
            };
            
            // eslint-disable-next-line no-magic-numbers
            const fadeDays = fadeMap[this.selectedFadeOption] || 3;
            
            // Update local state first
            this.fadeDurationDays = fadeDays;
            
            // Update prop
            this.$set(this.props, 'fadeTime', fadeDays);
            this.propChanged('fadeTime');
            
            // Force update
            this.$nextTick(() => {
                if (this.$refs.animationLayer) {
                    this.$forceUpdate();
                }
            });
        },
        
        /**
         * Handle particle size change
         */
        handleParticleSizeChange() {
            // Map size option to multiplier
            const sizeMap = {
                // eslint-disable-next-line no-magic-numbers
                small: 0.7,
                medium: 1.0,
                // eslint-disable-next-line no-magic-numbers
                large: 1.5
            };
            
            const sizeMultiplier = sizeMap[this.selectedParticleSize] || 1.0;
            
            // Update prop
            this.$set(this.props, 'particleSizeMultiplier', sizeMultiplier);
            this.propChanged('particleSizeMultiplier');
            
            // Force canvas redraw to apply new size
            this.$nextTick(() => {
                if (this.$refs.leafletMap && this.$refs.leafletMap.canvasLayer) {
                    // eslint-disable-next-line no-underscore-dangle
                    if (typeof this.$refs.leafletMap.canvasLayer._reset === 'function') {
                        // eslint-disable-next-line no-underscore-dangle
                        this.$refs.leafletMap.canvasLayer._reset();
                    }
                }
            });
        },
        
        /**
         * Handle draw heatmap (map2 style)
         */
        handleDrawHeatmap() {
            // Show loading indicator
            this.isRenderingHeatmap = true;
            
            // Force re-render of heatmap with current settings
            this.$forceUpdate();
        },
        
        /**
         * Handle heatmap rendering start
         */
        handleHeatmapRenderingStart() {
            this.isRenderingHeatmap = true;
        },
        
        /**
         * Handle heatmap rendering end
         */
        handleHeatmapRenderingEnd() {
            this.isRenderingHeatmap = false;
        },
        
        /**
         * Handle heatmap markers needed for lasso selection (animation mode pattern)
         * Creates invisible markers through LeafletMap's exposed methods
         */
        
        /**
         * Handle reset heatmap (map2 style)  
         */
        handleResetHeatmap() {
            // Clear selection markers (animation mode pattern)
            if (this.$refs.leafletMap) {
                this.$refs.leafletMap.clearAllSelectionMarkers();
            }
            
            // Reset to default values
            this.heatmapRadiusLocal = Constants.HEATMAP_RADIUS;
            this.heatmapBlurLocal = Constants.HEATMAP_BLUR;
            this.heatmapMinOpacityLocal = Constants.HEATMAP_MIN_OPACITY;
            
            // Update props
            this.$set(this.props, 'heatmapRadius', this.heatmapRadiusLocal);
            this.$set(this.props, 'heatmapBlur', this.heatmapBlurLocal);
            this.$set(this.props, 'heatmapMinOpacity', this.heatmapMinOpacityLocal);
            
            this.propChanged('heatmapRadius');
            this.propChanged('heatmapBlur');
            this.propChanged('heatmapMinOpacity');
            
            // Force update
            this.$forceUpdate();
        },
        
        /**
         * Handle heatmap radius change
         */
        handleHeatmapRadiusChange() {
            // Update prop
            this.$set(this.props, 'heatmapRadius', this.heatmapRadiusLocal);
            this.propChanged('heatmapRadius');
        },
        
        /**
         * Handle heatmap blur change
         */
        handleHeatmapBlurChange() {
            // Update prop
            this.$set(this.props, 'heatmapBlur', this.heatmapBlurLocal);
            this.propChanged('heatmapBlur');
        },
        
        /**
         * Handle heatmap min opacity change
         */
        handleHeatmapMinOpacityChange() {
            // Update prop
            this.$set(this.props, 'heatmapMinOpacity', this.heatmapMinOpacityLocal);
            this.propChanged('heatmapMinOpacity');
        },
        
        /**
         * Handle draw dots (map2 style)
         * Populates renderedDots from filteredDatasets with optional lasso filtering
         */
        async handleDrawDots() {
            // Show loading indicator
            this.isRenderingDots = true;
            
            // Use setTimeout to allow UI to update before heavy rendering
            await this.$nextTick();
            
            setTimeout(() => {
                let pointsToDraw = this.topNFilteredDatasets || [];
                
                // Apply lasso filter if active (using simple bounds check like map2)
                if (this.isLassoFilterApplied && this.lassoFilterBounds) {
                    const LeafletLibLocal = window.L;
                    if (LeafletLibLocal != null) {
                        pointsToDraw = pointsToDraw.filter(point => {
                            if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
                                return false;
                            }
                            const latLng = LeafletLibLocal.latLng(point.latitude, point.longitude);
                            return this.lassoFilterBounds.contains(latLng);
                        });
                    }
                }
                
                // CRITICAL: Create new array reference to trigger Vue reactivity
                this.renderedDots = [...pointsToDraw];
                
                // Hide loading indicator after a small delay to ensure rendering completes
                setTimeout(() => {
                    this.isRenderingDots = false;
                }, 300); // eslint-disable-line no-magic-numbers
            }, 50); // eslint-disable-line no-magic-numbers
        },
        
        /**
         * Handle reset dots (map2 style)  
         * Clears dots data and resets size to default
         */
        handleResetDots() {
            // Clear dots data
            this.renderedDots = [];
            
            // Reset to default value
            this.dotSizeLocal = DEFAULT_PROPS.dotSize || DOT_DEFAULT_SIZE;
            
            // Update prop
            this.$set(this.props, 'dotSize', this.dotSizeLocal);
            this.propChanged('dotSize');
        },
        
        /**
         * Handle dot size change
         */
        handleDotSizeChange() {
            // Update prop (won't trigger re-render until "Draw" is clicked)
            this.$set(this.props, 'dotSize', this.dotSizeLocal);
            this.propChanged('dotSize');
        },
        
        /**
         * Toggle options panel (flip animation)
         */
        toggleOptions() {
            this.isShowingOptions = !this.isShowingOptions;
        },
        
        /**
         * Handle theme change
         */
        handleThemeChange() {
            
            // Note: Don't auto-set palettes when theme changes
            // User's saved palette preferences should be preserved
            // Only the theme itself should change
            
            // Update prop
            this.$set(this.props, 'theme', this.selectedTheme);
            this.propChanged('theme');
            
            
            // Force update for theme changes and explicitly update tile layer
            this.$nextTick(() => {
                this.$forceUpdate();
                
                // Explicitly update tile layer based on new theme
                if (this.$refs.leafletMap && this.leafletMapInstance) {
                    // Recalculate the tile provider for the new theme
                    const theme = this.selectedTheme;
                    let newTileProvider = this.props.mapTileProvider;
                    
                    // Auto-switch to dark tiles for dark themes
                    if (newTileProvider == null || newTileProvider === 'osm') {
                        newTileProvider = (theme === 'dark' || theme === 'blue') ? 'osm-dark' : 'osm';
                    }
                    
                    // Force tile layer update
                    this.$refs.leafletMap.updateTileLayer(newTileProvider);
                }
            });
        },
        
        /**
         * Handle border appearance change
         */
        handleBorderAppearanceChange() {
            this.$set(this.props, 'choroplethBorderAppearance', this.selectedBorderAppearance);
            
            this.propChanged('choroplethBorderAppearance');
            
            // Force update choropleth map to apply new border styles
            this.$nextTick(() => {
                if (this.$refs.choroplethMap) {
                    this.$refs.choroplethMap.updateRegionStyles();
                }
            });
        },
        
        /**
         * Handle hover behavior change
         */
        handleHoverBehaviorChange() {
            this.$set(this.props, 'choroplethHoverBehavior', this.selectedHoverBehavior);
            
            this.propChanged('choroplethHoverBehavior');
        },
        
        /**
         * Handle aggregation method change
         */
        handleAggregationMethodChange() {
            this.$set(this.props, 'choroplethAggregationMethod', this.selectedAggregationMethod);
            this.propChanged('choroplethAggregationMethod');
            
            // Update choropleth data when aggregation method changes
            this.$nextTick(() => {
                this.updateChoroplethData();
            });
        },
        
        /**
         * Handle metric change
         */
        handleMetricChange() {
            // Update choropleth data when metric changes
            this.$nextTick(() => {
                this.updateChoroplethData();
            });
        },
        
        /**
         * Handle palette change
         */
        handlePaletteChange() {
            this.$set(this.props, 'choroplethColorScheme', this.selectedPalette);
            
            this.propChanged('choroplethColorScheme');
            
            // Force update choropleth map to apply new color scheme
            this.$nextTick(() => {
                if (this.$refs.choroplethMap) {
                    this.$refs.choroplethMap.updateRegionStyles();
                }
            });
        },
        
        /**
         * Handle legend toggle
         */
        handleLegendToggle() {
            this.$set(this.props, 'showLegend', this.isLegendEnabled);
            this.propChanged('showLegend');
        },
        
        handleChartToggle() {
            this.$set(this.props, 'showChart', this.isChartEnabled);
            this.propChanged('showChart');
        },
        
        handleToggleChartMinimize() {
            this.isChartMinimized = !this.isChartMinimized;
        },
        
        /**
         * Toggle lasso selection tool (map2 style)
         */
        toggleLassoTool() {
            
            // Prevent rapid double-clicks
            if (this.lassoToggleTimeout) {
                return;
            }
            
            if (this.$refs.leafletMap) {
                this.$refs.leafletMap.toggleLasso();
                
                // Add debounce to prevent double-clicks
                this.lassoToggleTimeout = setTimeout(() => {
                    this.lassoToggleTimeout = null;
                }, 500); // eslint-disable-line no-magic-numbers
            }
        },
        
        /**
         * Reset lasso selection (map2 style)
         */
        resetLassoSelection() {
            if (this.$refs.leafletMap) {
                this.$refs.leafletMap.resetLasso();
            }
        },
        
        /**
         * Update lasso display polygon on map (map2 style)
         */
        updateLassoDisplayPolygon() {
            if (this.leafletMapInstance == null) {
                return;
            }
            
            const LeafletLibLocal = window.L;
            if (LeafletLibLocal == null) {
                return;
            }
            
            // Remove existing polygon
            if (this.lassoDisplayPolygon) {
                this.leafletMapInstance.removeLayer(this.lassoDisplayPolygon);
                this.lassoDisplayPolygon = null;
            }
            
            // Draw new polygon if lasso is applied
            if (this.isLassoFilterApplied && this.lassoPathCoords && this.lassoPathCoords.length > 0) {
                try {
                    // Theme-dependent color (map2 style)
                    const theme = this.props.theme || 'light';
                    const isDark = theme === 'dark' || theme === 'blue';
                    const color = isDark ? '#00A9FF' : '#007bff';
                    
                    const polygonWeight = 2;
                    const polygonOpacity = 0.7;
                    
                    this.lassoDisplayPolygon = LeafletLibLocal.polygon(this.lassoPathCoords, {
                        fill: false,
                        color,
                        weight: polygonWeight,
                        dashArray: '5, 5',
                        opacity: polygonOpacity,
                        interactive: false
                    }).addTo(this.leafletMapInstance);
                } catch (error) {
                    // Failed to draw lasso polygon
                }
            }
        },
        
        /**
         * Toggle panel visibility (minimize/expand)
         */
        togglePanelVisibility() {
            this.isPanelMinimized = !this.isPanelMinimized;
        },
        
        /**
         * Handle drag start
         */
        handleDragStart(event) {
            // Prevent dragging when clicking buttons or their children
            const { target } = event;
            if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.header-buttons')) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            
            this.isDragging = true;
            
            const { touches } = event;
            const touchEvent = touches?.[0];
            const clientX = touchEvent?.clientX ?? event.clientX;
            const clientY = touchEvent?.clientY ?? event.clientY;
            
            this.dragStartPos = { x: clientX, y: clientY };
            this.dragStartPanelPos = { ...this.panelPosition };
            
            document.addEventListener('mousemove', this.handleDragMove);
            document.addEventListener('mouseup', this.handleDragEnd);
            document.addEventListener('touchmove', this.handleDragMove, { passive: false });
            document.addEventListener('touchend', this.handleDragEnd);
        },
        
        /**
         * Handle drag move
         */
        handleDragMove(event) {
            if (this.isDragging == null || this.isDragging === false) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            
            const { touches } = event;
            const touchEvent = touches?.[0];
            const clientX = touchEvent?.clientX ?? event.clientX;
            const clientY = touchEvent?.clientY ?? event.clientY;
            
            const deltaX = clientX - this.dragStartPos.x;
            const deltaY = clientY - this.dragStartPos.y;
            
            const newLeft = this.dragStartPanelPos.left + deltaX;
            const newTop = this.dragStartPanelPos.top + deltaY;
            
            // Get panel dimensions from DOM
            const panelElement = this.$el?.querySelector('.elemwowmap-controls-panel');
            if (panelElement == null) {
                return;
            }
            
            const panelRect = panelElement.getBoundingClientRect();
            const panelWidth = panelRect.width || 280; // Fallback to default width
            const panelHeight = panelRect.height || 160; // Fallback to default height
            
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Constrain panel within viewport
            const constrainedLeft = Math.max(0, Math.min(newLeft, viewportWidth - panelWidth));
            const constrainedTop = Math.max(0, Math.min(newTop, viewportHeight - panelHeight));
            
            this.panelPosition = {
                top: constrainedTop,
                left: constrainedLeft
            };
        },
        
        /**
         * Handle drag end
         */
        handleDragEnd() {
            if (this.isDragging == null || this.isDragging === false) {
                return;
            }
            
            this.isDragging = false;
            
            document.removeEventListener('mousemove', this.handleDragMove);
            document.removeEventListener('mouseup', this.handleDragEnd);
            document.removeEventListener('touchmove', this.handleDragMove);
            document.removeEventListener('touchend', this.handleDragEnd);
        },
        
        /**
         * Handle legend drag start
         */
        handleLegendDragStart(event) {
            // Only allow dragging from legend header area
            const { target } = event;
            const isHeader = target.classList.contains('elemwowmap-legend-header') || 
                           target.classList.contains('elemwowmap-heatmap-legend-header') ||
                           target.closest('.elemwowmap-legend-header') ||
                           target.closest('.elemwowmap-heatmap-legend-header');
            
            if (!isHeader) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            
            this.isLegendDragging = true;
            
            const { touches } = event;
            const touchEvent = touches?.[0];
            const clientX = touchEvent?.clientX ?? event.clientX;
            const clientY = touchEvent?.clientY ?? event.clientY;
            
            this.legendDragStartPos = { x: clientX, y: clientY };
            this.legendDragStartLegendPos = { ...this.legendPosition };
            
            document.addEventListener('mousemove', this.handleLegendDragMove);
            document.addEventListener('mouseup', this.handleLegendDragEnd);
            document.addEventListener('touchmove', this.handleLegendDragMove, { passive: false });
            document.addEventListener('touchend', this.handleLegendDragEnd);
        },
        
        /**
         * Handle legend drag move
         */
        handleLegendDragMove(event) {
            if (this.isLegendDragging == null || this.isLegendDragging === false) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            
            const { touches } = event;
            const touchEvent = touches?.[0];
            const clientX = touchEvent?.clientX ?? event.clientX;
            const clientY = touchEvent?.clientY ?? event.clientY;
            
            const deltaX = this.legendDragStartPos.x - clientX; // Inverted for right positioning
            const deltaY = clientY - this.legendDragStartPos.y;
            
            const newRight = this.legendDragStartLegendPos.right + deltaX;
            const newTop = this.legendDragStartLegendPos.top + deltaY;
            
            // Get legend dimensions from DOM
            const legendElement = this.$el?.querySelector('.elemwowmap-legend-wrapper');
            if (legendElement == null) {
                return;
            }
            
            const legendRect = legendElement.getBoundingClientRect();
            const legendWidth = legendRect.width || 220; // Fallback to default width
            const legendHeight = legendRect.height || 160; // Fallback to default height
            
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Constrain legend within viewport
            const constrainedRight = Math.max(0, Math.min(newRight, viewportWidth - legendWidth));
            const constrainedTop = Math.max(0, Math.min(newTop, viewportHeight - legendHeight));
            
            this.legendPosition = {
                top: constrainedTop,
                right: constrainedRight
            };
        },
        
        /**
         * Handle legend drag end
         */
        handleLegendDragEnd() {
            if (this.isLegendDragging == null || this.isLegendDragging === false) {
                return;
            }
            
            this.isLegendDragging = false;
            
            document.removeEventListener('mousemove', this.handleLegendDragMove);
            document.removeEventListener('mouseup', this.handleLegendDragEnd);
            document.removeEventListener('touchmove', this.handleLegendDragMove);
            document.removeEventListener('touchend', this.handleLegendDragEnd);
        },
        
        /**
         * Sync filters to storage for cross-widget communication
         */
        syncFiltersToStorage() {
            // Register variables before committing
            if (this.props.dateField) {
                this.dimensionMetricVars = registerDescriptorVariable(
                    this.descriptor,
                    this.props.dateField,
                    this.dimensionMetricVars
                );
            }
            
            if (this.props.categoryField) {
                this.dimensionMetricVars = registerDescriptorVariable(
                    this.descriptor,
                    this.props.categoryField,
                    this.dimensionMetricVars
                );
            }
            
            // Commit to storage
            const storeData = {};
            
            if (this.props.dateField != null && this.selectedYears != null && this.selectedYears.length > 0) {
                storeData[this.props.dateField] = this.selectedYears;
            }
            
            if (this.props.categoryField != null && this.selectedCategories != null && this.selectedCategories.length > 0) {
                storeData[this.props.categoryField] = this.selectedCategories;
            }
            
            if (Object.keys(storeData).length > 0) {
                this.$storeCommit(storeData);
            }
        },
        
        /**
         * Send selected area data to store (similar to ElemWowTable.commitForSlot)
         * Collects data points within the selected area and commits variables
         */
        sendSelectedAreaToStore(selectedDataPoints) {
            if (selectedDataPoints == null || selectedDataPoints.length === 0) {
                // No selected data - reset vars to null
                this.resetSelectedAreaVariables();
                return;
            }
            
            // Get variables to commit from props
            const varsToCommit = this.props.varsToCommit || {};
            const sourceVars = varsToCommit.fromSources || [];
            const userVarsMap = varsToCommit.fromUser || {};
            
            if (sourceVars.length === 0 && (!userVarsMap || Object.keys(userVarsMap).length === 0)) {
                return;
            }
            
            // Register variables in descriptor.vars before committing (same pattern as ElemWowTable)
            const userVarKeys = userVarsMap ? Object.keys(userVarsMap) : [];
            const registeredVars = [];
            if (this.descriptor && this.descriptor.vars) {
                // Register variables from userVarsMap first (they're committed globally)
                userVarKeys.forEach(variable => {
                    if (this.descriptor.vars[variable] == null) {
                        // Direct assignment for immediate synchronous registration
                        this.descriptor.vars[variable] = { description: variable };
                        registeredVars.push(variable);
                        // Track that we added this variable
                        if (!this.dimensionMetricVars.includes(variable)) {
                            this.dimensionMetricVars.push(variable);
                        }
                    }
                });
                
                // Register variables from sourceVars
                sourceVars.forEach(variable => {
                    if (this.descriptor.vars[variable] == null) {
                        // Direct assignment for immediate synchronous registration
                        this.descriptor.vars[variable] = { description: variable };
                        registeredVars.push(variable);
                        // Track that we added this variable
                        if (!this.dimensionMetricVars.includes(variable)) {
                            this.dimensionMetricVars.push(variable);
                        }
                    }
                });
            }
            
            // Commit user vars globally (after ensuring they're registered in descriptor.vars)
            // Only commit variables that are activated in varAliases (same pattern as ElemWowTable)
            if (userVarsMap && Object.keys(userVarsMap).length > 0) {
                const activatedUserVars = {};
                Object.keys(userVarsMap).forEach(variable => {
                    const hasVarAlias = this.props.varAliases && this.props.varAliases[variable];
                    if (hasVarAlias) {
                        activatedUserVars[variable] = userVarsMap[variable];
                    }
                });
                
                if (Object.keys(activatedUserVars).length > 0) {
                    this.$storeCommit(activatedUserVars, { global: true });
                }
            }
            
            if (sourceVars.length === 0) {
                return;
            }
            
            // Collect values from selected data points
            // For multiple selection, use arrays (like ElemWowTable with canMultipleSelect)
            // Only commit variables that are activated in varAliases (same pattern as ElemWowTable)
            const dataToCommit = sourceVars.reduce((acc, variable) => {
                const hasVarAlias = this.props.varAliases && this.props.varAliases[variable];
                if (hasVarAlias) {
                    const values = selectedDataPoints
                        .map(point => point[variable])
                        .filter(val => val != null);
                    
                    if (values.length > 0) {
                        // For single selection, use the first value; for multiple, use array
                        acc[variable] = values.length === 1 ? values[0] : values;
                    }
                }
                return acc;
            }, {});
            
            if (Object.keys(dataToCommit).length > 0) {
                this.$storeCommit(dataToCommit);
            }
        },
        
        /**
         * Reset selected area variables to null (when lasso is cleared)
         */
        resetSelectedAreaVariables() {
            const varsToCommit = this.props.varsToCommit || {};
            const sourceVars = varsToCommit.fromSources || [];
            
            if (sourceVars.length === 0) {
                return;
            }
            
            // Only reset variables that are activated in varAliases (same pattern as ElemWowTable)
            const dataToCommit = sourceVars.reduce((acc, variable) => {
                const hasVarAlias = this.props.varAliases && this.props.varAliases[variable];
                if (hasVarAlias) {
                    acc[variable] = null;
                }
                return acc;
            }, {});
            
            if (Object.keys(dataToCommit).length > 0) {
                this.$storeCommit(dataToCommit);
            }
        },

        /**
         * Handle mode change
         */
        handleModeChange() {
            // Clear selection markers when switching modes (animation mode pattern)
            if (this.$refs.leafletMap) {
                this.$refs.leafletMap.clearAllSelectionMarkers();
            }
            
            // Update prop - the currentMode watcher will handle cleanup
            this.$set(this.props, 'visualizationMode', this.currentMode);
            this.propChanged('visualizationMode');
            
            this.initializeVisualization();
        },

        /**
         * Handle play/pause for animation mode
         */
        handlePlayPause() {
            this.isPlaying = !this.isPlaying;
            // Mark that animation has been played at least once
            if (this.isPlaying) {
                this.hasAnimationPlayed = true;
            }
        },

        /**
         * Handle reset for animation mode
         */
        handleReset() {
            this.isPlaying = false;
            this.currentAnimationDate = null;
            this.hasAnimationPlayed = false;
            
            if (this.$refs.animationLayer) {
                this.$refs.animationLayer.reset();
            }
        },
        
        /**
         * Load a specific data page (similar to ElemWowTable)
         * @param {number} pageNumber - Page number to load (1-indexed)
         */
        async loadDataPage(pageNumber) {
            if (this.isLoadingPage || this.limit == null || this.loadedPagesSet.has(pageNumber)) {
                return;
            }
            
            // CRITICAL: Mark page as loading immediately to prevent duplicate requests
            // This prevents race conditions where multiple animation frames try to load the same page
            this.isLoadingPage = true;
            this.loadedPagesSet.add(pageNumber);
            
            try {
                // Update page number
                this.page = pageNumber;
                
                // Trigger data load via mixin
                await this.loadData();
                
            } catch (error) {
                // Remove page from set if load failed
                this.loadedPagesSet.delete(pageNumber);
                this.isLoadingPage = false;
            }
        },
        
        /**
         * Check if we need to load next page during animation
         * Similar to ElemWowTable's performDynamicLoading
         * CURRENTLY DISABLED - Reserved for future pagination during animation
         * @param {Date} currentAnimationDate - Current date in animation
         * @param {Date} maxDataDate - Maximum date in current loaded data
         */
        // eslint-disable-next-line vue/no-unused-properties, no-unused-vars
        async checkAndLoadNextPage(currentAnimationDate, maxDataDate) {
            // Skip if already loading or no pagination
            if (this.isLoadingPage || this.limit == null || this.pages == null) {
                return;
            }
            
            // Skip if no more pages to load
            if (this.page >= this.pages) {
                return;
            }
            
            // Calculate how many days until we run out of data
            const hoursPerDay = 24;
            const millisecondsPerDay = 1000 * 60 * 60 * hoursPerDay;
            const daysRemaining = Math.ceil((maxDataDate - currentAnimationDate) / millisecondsPerDay);
            
            // Calculate total days in current loaded data
            const minDataDate = new Date(Math.min(...this.filteredDatasets.map(dataPoint => new Date(dataPoint.date_event).getTime())));
            const totalDaysLoaded = Math.ceil((maxDataDate - minDataDate) / millisecondsPerDay);
            
            // Use percentage-based threshold: load next page when 20% of time range remains
            // This is more adaptive than fixed days threshold
            const thresholdPercentage = 0.2; // 20%
            const minThresholdDays = 5; // eslint-disable-line no-magic-numbers
            const thresholdDays = Math.max(minThresholdDays, Math.ceil(totalDaysLoaded * thresholdPercentage));
            
            if (daysRemaining <= thresholdDays) {
                await this.loadDataPage(this.page + 1);
            }
        },
        
        /**
         * Handle check-load-more event from AnimationLayer
         * @param {Object} payload - Event payload with currentDate and maxDataDate
         */
        handleCheckLoadMore(payload) {
            // DISABLED: Automatic page loading during animation
            // TODO: Re-enable when pagination logic is refined
            // const { currentDate, maxDataDate } = payload;
            // this.checkAndLoadNextPage(currentDate, maxDataDate);
        },
        
        /**
         * Reset pagination state - Unused but kept for potential future use
         * Similar to ElemWowTable's resetVirtualScrollState
         */
        // eslint-disable-next-line no-unused-vars
        resetPaginationState() {
            // Intentionally unused - kept for future functionality
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.resetPaginationState();
            }
            this.page = 1;
            this.accumulatedRows = [];
            this.loadedPagesSet = new Set([1]);
            this.isLoadingPage = false;
        },

        /**
         * Handle map ready event
         */
        handleMapReady(mapInstance) {
            this.leafletMapInstance = mapInstance;
            
            this.initializeVisualization();
            
            // Auto-center on data if available
            this.$nextTick(() => {
                this.centerMapOnData();
            });
        },
        
        /**
         * Handle lasso selection finished (EXACT from map2)
         */
        handleLassoFinished(selection) {
            
            const LeafletLibLocal = window.L;
            if (LeafletLibLocal == null) {
                return;
            }

            // Handle path-based lasso (for heatmap, dots, animation)
            // This is the key - use the path to create bounds
            if (selection.path && selection.path.length > 0) {
                try {
                    // Create bounds from the lasso path polygon (map2 style)
                    const lassoPolygon = LeafletLibLocal.polygon(selection.path);
                    const derivedBounds = lassoPolygon.getBounds();
                    
                    if (derivedBounds && derivedBounds.isValid()) {
                        const lassoMapPadding = 50;
                        
                        
                        // Store both path and bounds
                        this.lassoPathCoords = selection.path;
                        this.lassoFilterBounds = derivedBounds;
                        this.isLassoFilterApplied = true;
                        this.isLassoActive = false;
                        
                        // Collect data points within the selected area
                        const selectedDataPoints = this.allDatasets.filter(record => {
                            if (record.latitude != null && record.longitude != null) {
                                const latLng = LeafletLibLocal.latLng(record.latitude, record.longitude);
                                // Quick rejection using bounding box
                                const isInBounds = derivedBounds.contains(latLng);
                                if (isInBounds === false) {
                                    return false;
                                }
                                // More precise check using the actual polygon
                                return this.isPointInPolygon(latLng, selection.path);
                            }
                            return false;
                        });
                        
                        // Send selected area data to store (same as ElemWowTable)
                        this.sendSelectedAreaToStore(selectedDataPoints);
                        
                        
                        // Apply filters with lasso bounds
                        this.applyCurrentFilters();
                        
                        
                        // For dots mode: redraw dots with lasso filter
                        if (this.currentMode === 'dots' && this.renderedDots.length > 0) {
                            this.handleDrawDots();
                        }
                        
                        // For heatmap mode: trigger redraw (HeatmapLayer watches filteredDatasets)
                        if (this.currentMode === 'heatmap') {
                            // Force reactivity update by creating new array reference
                            this.$nextTick(() => {
                                // The HeatmapLayer watches :data="filteredDatasets" prop
                                // Creating new reference ensures watcher triggers
                                this.filteredDatasets = [...this.filteredDatasets];
                            });
                        }
                        
                        // Fit map to lasso bounds (map2 style)
                        if (this.leafletMapInstance) {
                            const lassoPaddingCoords = [lassoMapPadding, lassoMapPadding];
                            this.leafletMapInstance.fitBounds(derivedBounds, { 
                                padding: lassoPaddingCoords
                            });
                        }
                    } else {
                        this.handleLassoCleared();
                    }
                } catch (error) {
                    this.handleLassoCleared();
                }
            } else {
                this.handleLassoCleared();
            }
        },

        /**
         * Handle lasso selection cleared (EXACT from map2)
         */
        handleLassoCleared() {
            this.isLassoFilterApplied = false;
            this.lassoFilterBounds = null;
            this.lassoPathCoords = null;
            this.isLassoActive = false;
            
            // Reset selected area variables to null (same as ElemWowTable)
            this.resetSelectedAreaVariables();
            
            // Reapply filters without lasso
            this.applyCurrentFilters();
            
            
            // For dots mode: redraw dots without lasso filter
            if (this.currentMode === 'dots' && this.renderedDots.length > 0) {
                this.handleDrawDots();
            }
            
            // For heatmap mode: trigger redraw
            if (this.currentMode === 'heatmap') {
                this.$nextTick(() => {
                    this.filteredDatasets = [...this.filteredDatasets];
                });
            }
            
            // Re-center map on all data (map2 style)
            this.$nextTick(() => {
                this.centerMapOnData();
            });
        },

        /**
         * Handle lasso activity changed (EXACT from map2)
         */
        handleLassoActivityChanged(isActive) {
            this.isLassoActive = isActive;
        },
        
        /**
         * Check if a point is inside a polygon using ray-casting algorithm
         * @param {Object} latLng - Leaflet LatLng object
         * @param {Array} polygonPath - Array of [lat, lng] coordinates
         * @returns {boolean} - True if point is inside polygon
         */
        isPointInPolygon(latLng, polygonPath) {
            const { lat, lng } = latLng;
            let inside = false;
            
            for (let i = 0, j = polygonPath.length - 1; i < polygonPath.length; j = i++) {
                // Support both array format [lat, lng] and object format {lat, lng}
                const pointILat = polygonPath[i].lat !== undefined ? polygonPath[i].lat : polygonPath[i][0];
                const pointILng = polygonPath[i].lng !== undefined ? polygonPath[i].lng : polygonPath[i][1];
                const pointJLat = polygonPath[j].lat !== undefined ? polygonPath[j].lat : polygonPath[j][0];
                const pointJLng = polygonPath[j].lng !== undefined ? polygonPath[j].lng : polygonPath[j][1];
                
                const isIntersect = ((pointILng > lng) !== (pointJLng > lng)) &&
                    (lat < (pointJLat - pointILat) * (lng - pointILng) / (pointJLng - pointILng) + pointILat);
                
                if (isIntersect === true) {
                    inside = inside === false;
                }
            }
            
            return inside;
        },
        
        /**
         * Center map on loaded data (like map2)
         * Respects the autoCenter prop setting
         */
        centerMapOnData() {
            // Skip if autoCenter is disabled
            if (this.props.autoCenter === false) {
                return;
            }
            
            if (this.leafletMapInstance == null || this.filteredDatasets == null || this.filteredDatasets.length === 0) {
                return;
            }
            
            try {
                // Import Leaflet for bounds calculation
                const LeafletLibLocal = window.L;
                if (LeafletLibLocal == null) {
                    return;
                }
                
                // Create bounds from data points
                const dataPoints = this.filteredDatasets
                    .filter(record => record.latitude != null && record.longitude != null)
                    .map(record => LeafletLibLocal.latLng(record.latitude, record.longitude));
                
                if (dataPoints.length > 0) {
                    const dataBounds = LeafletLibLocal.latLngBounds(dataPoints);
                    
                    if (dataBounds.isValid()) {
                        const mapPadding = 50;
                        const mapMaxZoom = 10;
                        const mapPaddingCoords = [mapPadding, mapPadding];
                        
                        // Fit bounds with padding and max zoom (matching map2 behavior)
                        this.leafletMapInstance.fitBounds(dataBounds, { 
                            padding: mapPaddingCoords, 
                            maxZoom: mapMaxZoom 
                        });
                    }
                }
            } catch (error) {
                // Could not auto-center on data  
            }
        },

        /**
         * Handle animation complete
         */
        handleAnimationComplete() {
            this.isPlaying = false;
            this.$emit('animation-complete');
        },

        /**
         * Handle animation progress
         */
        handleAnimationProgress(progress) {
            this.currentAnimationDate = progress.date;
            this.$emit('animation-progress', progress);
        },

        /**
         * Handle particles updated from AnimationLayer
         */
        handleParticlesUpdated(particles) {
            // CRITICAL: Create NEW array reference to trigger Vue reactivity in child components
            // This ensures LeafletMap's prop watcher detects the change
            this.activeParticles = particles ? [...particles] : [];
            
            // Force immediate update to LeafletMap
            this.$nextTick(() => {
                if (this.$refs.leafletMap) {
                    this.$refs.leafletMap.$forceUpdate();
                }
            });
        },

        /**
         * Initialize visualization based on current mode
         */
        initializeVisualization() {
            if (!this.hasData) {
                return;
            }

            // Clear previous visualization
            this.cleanup();

            // Initialize based on mode
            switch (this.currentMode) {
                case 'heatmap':
                    this.initializeHeatmap();
                    break;
                case 'dots':
                    this.initializeDots();
                    break;
                case 'animation':
                    this.initializeAnimation();
                    break;
                case 'choropleth':
                    this.initializeChoropleth();
                    break;
                default:
                    break;
            }
        },

        /**
         * Initialize heatmap visualization
         */
        initializeHeatmap() {
            // Heatmap initialization handled by component
        },

        /**
         * Initialize dots visualization
         */
        initializeDots() {
            // Dots initialization handled by component
        },

        /**
         * Initialize animation visualization
         */
        initializeAnimation() {
            // Animation initialization handled by component
        },

        /**
         * Initialize choropleth visualization
         */
        initializeChoropleth() {
            this.updateChoroplethData();
        },
        
        /**
         * Update choropleth data (used when metric or data changes)
         */
        updateChoroplethData() {
            if (this.filteredDatasets == null || this.filteredDatasets.length === 0) {
                this.choroplethData = {};
                return;
            }
            
            // Aggregate data by region (valueField is already handled in data transformation)
            this.choroplethData = aggregateByRegion(
                this.filteredDatasets,
                this.props.regionCodeField,
                this.props.choroplethAggregationMethod
            );
            
            // Force update choropleth map component
            this.$nextTick(() => {
                if (this.$refs.choroplethMap) {
                    this.$refs.choroplethMap.updateRegionStyles();
                }
            });
        },
        
        /**
         * Handle visible regions change from drill-down
         */
        handleVisibleRegionsChanged(visibleIds, visibleValues = {}) {
            // Replace array to ensure reactivity
            this.visibleRegionIds.splice(0, this.visibleRegionIds.length, ...(visibleIds || []));
            // Update visible region values (for parent-level coloring)
            this.visibleRegionValues = visibleValues || {};
        },
        
        /**
         * Handle region click - automatically send region code to store
         */
        handleRegionClick(regionId) {
            // Determine variable name: use regionCodeField if set, otherwise use 'regionCode' as default
            const variableName = this.props.regionCodeField || 'regionCode';
            
            // Register variable in descriptor.vars before committing
            if (this.descriptor && this.descriptor.vars) {
                if (this.descriptor.vars[variableName] == null) {
                    this.descriptor.vars[variableName] = { description: variableName };
                    if (!this.dimensionMetricVars.includes(variableName)) {
                        this.dimensionMetricVars.push(variableName);
                    }
                }
            }
            
            // Commit region code to store
            this.$storeCommit({
                [variableName]: regionId
            });
        },

        /**
         * Cleanup visualization
         */
        cleanup() {
            // Cleanup dots layer if it exists (map2 style)
            const dotsLayerRef = this.$refs.dotsLayer;
            if (dotsLayerRef && typeof dotsLayerRef.cleanup === 'function') {
                dotsLayerRef.cleanup();
            }
            
            // Cleanup animation layer if it exists
            const animationLayerRef = this.$refs.animationLayer;
            if (animationLayerRef && typeof animationLayerRef.cleanup === 'function') {
                animationLayerRef.cleanup();
            }
            
            // Cleanup lasso event listeners
            if (this.leafletMapInstance) {
                this.leafletMapInstance.off('lasso.finished');
                this.leafletMapInstance.off('lasso.cleared');
                
                // Remove lasso display polygon
                if (this.lassoDisplayPolygon) {
                    this.leafletMapInstance.removeLayer(this.lassoDisplayPolygon);
                    this.lassoDisplayPolygon = null;
                }
            }
        },

        /**
         * Handle navigate to source (from empty state)
         */
        handleNavigateToSource() {
            // This will be handled by the platform to navigate to dataset panel
            this.$emit('navigateToSource');
        }
    }
};
</script>
<!-- eslint-enable vue/component-name-in-template-casing -->

<style src="./styles/style.pcss" lang="pcss" scoped></style>

