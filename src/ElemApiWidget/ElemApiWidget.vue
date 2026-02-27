<template>
    <w-elem :placeholder="$placeholder" class="api-widget">
        <div class="api-widget-container" :style="containerStyles">
            <!-- Панель управления -->
            <div class="api-widget-controls">
                <button
                    class="api-widget-btn api-widget-btn-primary"
                    :class="{ 'api-widget-btn-loading': requestStatus === 'loading' }"
                    :disabled="!canMakeRequest || requestStatus === 'loading'"
                    @click="handleExecuteRequest"
                    aria-label="Выполнить запрос"
                    tabindex="0">
                    <span v-if="requestStatus === 'loading'" class="spinner"></span>
                    <span v-else>{{ httpMethodLabel }}</span>
                </button>
                
                <div class="api-widget-url">
                    <input
                        v-model="currentUrl"
                        type="text"
                        class="api-widget-url-input"
                        placeholder="Введите URL..."
                        @keydown.enter="handleExecuteRequest"
                        aria-label="API URL"
                        tabindex="0" />
                </div>
                
                <div class="api-widget-actions">
                    <button
                        v-if="props.enableCopy && responseData"
                        class="api-widget-btn api-widget-btn-secondary"
                        @click="handleCopyResponse"
                        aria-label="Копировать ответ"
                        tabindex="0">
                        📋
                    </button>
                    
                    <button
                        v-if="props.enableDownload && responseData"
                        class="api-widget-btn api-widget-btn-secondary"
                        @click="handleDownloadResponse"
                        aria-label="Скачать JSON"
                        tabindex="0">
                        💾
                    </button>
                </div>
            </div>
            
            <!-- Информация о статусе -->
            <div v-if="requestStatus !== 'idle'" class="api-widget-status">
                <div class="api-widget-status-info">
                    <span
                        v-if="props.showStatusCode && statusCode"
                        class="api-widget-status-code"
                        :class="statusCodeClass">
                        {{ statusCode }} {{ statusText }}
                    </span>
                    
                    <span
                        v-if="props.showResponseTime && responseTime"
                        class="api-widget-response-time">
                        ⏱ {{ responseTime }}ms
                    </span>
                </div>
            </div>
            
            <!-- Отображение результата -->
            <div v-if="requestStatus === 'loading'" class="api-widget-loading">
                <div class="loading-spinner"></div>
                <p>Загрузка...</p>
            </div>
            
            <div v-else-if="requestStatus === 'error'" class="api-widget-error">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка запроса</h3>
                <p>{{ errorMessage }}</p>
            </div>
            
            <div v-else-if="requestStatus === 'success' && responseData" class="api-widget-response">
                <!-- Заголовки ответа -->
                <div v-if="props.showHeaders && responseHeaders" class="api-widget-headers">
                    <details>
                        <summary class="api-widget-headers-toggle">
                            📋 Заголовки ответа
                        </summary>
                        <div class="api-widget-headers-content">
                            <div
                                v-for="(value, key) in responseHeaders"
                                :key="key"
                                class="api-widget-header-item">
                                <span class="header-key">{{ key }}:</span>
                                <span class="header-value">{{ value }}</span>
                            </div>
                        </div>
                    </details>
                </div>
                
                <!-- Данные ответа -->
                <div class="api-widget-data">
                    <!-- Режим дерева -->
                    <JsonTreeView
                        v-if="props.displayMode === 'tree'"
                        :data="displayData"
                        :maxDepth="props.maxDepth"
                        :colors="colorScheme" />
                    
                    <!-- Режим таблицы -->
                    <JsonTableView
                        v-else-if="props.displayMode === 'table'"
                        :data="displayData"
                        :colors="colorScheme" />
                    
                    <!-- Сырой JSON -->
                    <pre v-else class="api-widget-raw-json">{{ formattedJson }}</pre>
                </div>
            </div>
            
            <div v-else class="api-widget-empty">
                <div class="empty-icon">🔌</div>
                <p>Настройте параметры запроса и нажмите кнопку выполнения</p>
            </div>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin } from '@goodt-common/data';
import { meta } from './descriptor';
import JsonTreeView from './components/JsonTreeView.vue';
import JsonTableView from './components/JsonTableView.vue';
import { 
    parseHeaders, 
    parseBody, 
    getValueByPath, 
    formatJson 
} from './utils';
import { REQUEST_STATUSES } from './constants';

const DatasetMixin = useElemDatasetMixin({
    drilldown: false,
    panel: false,
});

export default {
    extends: Elem,
    mixins: [DatasetMixin],
    components: {
        JsonTreeView,
        JsonTableView
    },
    
    meta,
    
    data: () => ({
        requestStatus: REQUEST_STATUSES.IDLE,
        responseData: null,
        responseHeaders: null,
        statusCode: null,
        statusText: '',
        responseTime: null,
        errorMessage: '',
        currentUrl: '',
        intervalId: null
    }),
    
    computed: {
        httpMethodLabel() {
            return this.props.httpMethod || 'GET';
        },
        
        canMakeRequest() {
            return this.currentUrl && this.currentUrl.trim().length > 0;
        },
        
        displayData() {
            if (!this.responseData) return null;
            
            if (this.props.responsePath) {
                return getValueByPath(this.responseData, this.props.responsePath) || this.responseData;
            }
            
            return this.responseData;
        },
        
        formattedJson() {
            return formatJson(this.displayData);
        },
        
        statusCodeClass() {
            if (!this.statusCode) return '';
            
            if (this.statusCode >= 200 && this.statusCode < 300) {
                return 'status-success';
            } else if (this.statusCode >= 400) {
                return 'status-error';
            }
            return 'status-warning';
        },
        
        colorScheme() {
            return {
                primary: this.props.primaryColor,
                success: this.props.successColor,
                error: this.props.errorColor,
                border: '#e5e7eb'
            };
        },
        
        containerStyles() {
            return {
                '--primary-color': this.props.primaryColor,
                '--success-color': this.props.successColor,
                '--error-color': this.props.errorColor,
                '--font-size': this.props.fontSize,
                '--border-radius': this.props.borderRadius,
                '--padding': this.props.padding
            };
        }
    },
    
    watch: {
        'props.apiUrl': {
            handler(newUrl) {
                this.currentUrl = newUrl || '';
            },
            immediate: true
        },
        
        'props.autoRequest': {
            handler(value) {
                if (value) {
                    this.handleExecuteRequest();
                }
            }
        },
        
        'props.requestInterval': {
            handler(interval) {
                this.setupAutoRequest();
            }
        }
    },
    
    methods: {
        async handleExecuteRequest() {
            if (!this.canMakeRequest) return;
            
            this.requestStatus = REQUEST_STATUSES.LOADING;
            this.errorMessage = '';
            
            const startTime = performance.now();
            
            try {
                const headers = parseHeaders(this.props.headers);
                const body = this.shouldIncludeBody() 
                    ? parseBody(this.props.bodyContent, this.props.bodyFormat)
                    : undefined;
                
                // Добавляем Content-Type если это JSON
                if (this.props.bodyFormat === 'json' && body) {
                    headers['Content-Type'] = 'application/json';
                }
                
                const options = {
                    method: this.props.httpMethod,
                    headers
                };
                
                if (body !== undefined && this.props.bodyFormat !== 'formData') {
                    options.body = typeof body === 'string' ? body : JSON.stringify(body);
                } else if (body instanceof FormData) {
                    options.body = body;
                    // FormData сам установит правильный Content-Type
                    delete headers['Content-Type'];
                }
                
                const response = await fetch(this.currentUrl, options);
                
                const endTime = performance.now();
                this.responseTime = Math.round(endTime - startTime);
                
                this.statusCode = response.status;
                this.statusText = response.statusText;
                
                // Сохраняем заголовки ответа
                this.responseHeaders = {};
                response.headers.forEach((value, key) => {
                    this.responseHeaders[key] = value;
                });
                
                // Парсим ответ
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    this.responseData = await response.json();
                } else {
                    const text = await response.text();
                    this.responseData = { response: text };
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                this.requestStatus = REQUEST_STATUSES.SUCCESS;
            } catch (error) {
                this.requestStatus = REQUEST_STATUSES.ERROR;
                this.errorMessage = error.message || 'Неизвестная ошибка при выполнении запроса';
                console.error('API Request Error:', error);
            }
        },
        
        shouldIncludeBody() {
            const methodsWithBody = ['POST', 'PUT', 'PATCH'];
            return methodsWithBody.includes(this.props.httpMethod) && 
                   this.props.bodyFormat !== 'none';
        },
        
        handleCopyResponse() {
            if (!this.displayData) return;
            
            const textToCopy = formatJson(this.displayData);
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Можно добавить уведомление об успешном копировании
                console.log('Скопировано в буфер обмена');
            }).catch(err => {
                console.error('Ошибка копирования:', err);
            });
        },
        
        handleDownloadResponse() {
            if (!this.displayData) return;
            
            const jsonStr = formatJson(this.displayData);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `api-response-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
        
        setupAutoRequest() {
            // Очищаем предыдущий интервал
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            // Устанавливаем новый интервал если нужно
            if (this.props.requestInterval > 0) {
                this.intervalId = setInterval(() => {
                    this.handleExecuteRequest();
                }, this.props.requestInterval * 1000);
            }
        }
    },
    
    mounted() {
        if (this.props.autoRequest) {
            this.handleExecuteRequest();
        }
        
        if (this.props.requestInterval > 0) {
            this.setupAutoRequest();
        }
    },
    
    beforeDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
};
</script>

<style scoped>
.api-widget {
    width: 100%;
    height: 100%;
}

.api-widget-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: var(--padding, 16px);
    font-size: var(--font-size, 14px);
    height: 100%;
    overflow: auto;
}

/* Панель управления */
.api-widget-controls {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.api-widget-btn {
    padding: 8px 16px;
    border: none;
    border-radius: var(--border-radius, 8px);
    cursor: pointer;
    font-size: var(--font-size, 14px);
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.api-widget-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.api-widget-btn-primary {
    background-color: var(--primary-color, #3b82f6);
    color: white;
    min-width: 80px;
    justify-content: center;
}

.api-widget-btn-primary:hover:not(:disabled) {
    opacity: 0.9;
}

.api-widget-btn-secondary {
    background-color: #f3f4f6;
    color: #1f2937;
    padding: 8px 12px;
}

.api-widget-btn-secondary:hover:not(:disabled) {
    background-color: #e5e7eb;
}

.api-widget-btn-loading {
    pointer-events: none;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.api-widget-url {
    flex: 1;
    min-width: 200px;
}

.api-widget-url-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: var(--border-radius, 8px);
    font-size: var(--font-size, 14px);
    outline: none;
    transition: border-color 0.2s;
}

.api-widget-url-input:focus {
    border-color: var(--primary-color, #3b82f6);
}

.api-widget-actions {
    display: flex;
    gap: 8px;
}

/* Статус */
.api-widget-status {
    padding: 8px 12px;
    border-radius: var(--border-radius, 8px);
    background-color: #f9fafb;
}

.api-widget-status-info {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
}

.api-widget-status-code {
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
}

.status-success {
    background-color: #d1fae5;
    color: var(--success-color, #10b981);
}

.status-error {
    background-color: #fee2e2;
    color: var(--error-color, #ef4444);
}

.status-warning {
    background-color: #fef3c7;
    color: #f59e0b;
}

.api-widget-response-time {
    color: #6b7280;
    font-size: 0.9em;
}

/* Загрузка */
.api-widget-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #6b7280;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

/* Ошибка */
.api-widget-error {
    padding: 40px 20px;
    text-align: center;
    color: var(--error-color, #ef4444);
}

.error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.api-widget-error h3 {
    margin: 0 0 8px 0;
    font-size: 1.2em;
}

.api-widget-error p {
    margin: 0;
    color: #6b7280;
}

/* Пустое состояние */
.api-widget-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #9ca3af;
    text-align: center;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
}

/* Ответ */
.api-widget-response {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.api-widget-headers {
    border: 1px solid #e5e7eb;
    border-radius: var(--border-radius, 8px);
    overflow: hidden;
}

.api-widget-headers-toggle {
    padding: 12px 16px;
    background-color: #f9fafb;
    cursor: pointer;
    font-weight: 500;
    user-select: none;
}

.api-widget-headers-toggle:hover {
    background-color: #f3f4f6;
}

.api-widget-headers-content {
    padding: 12px 16px;
    background-color: white;
}

.api-widget-header-item {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.header-key {
    font-weight: 600;
    color: var(--primary-color, #3b82f6);
}

.header-value {
    color: #1f2937;
}

/* Данные */
.api-widget-data {
    border: 1px solid #e5e7eb;
    border-radius: var(--border-radius, 8px);
    padding: 16px;
    background-color: white;
    overflow: auto;
}

.api-widget-raw-json {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #1f2937;
}
</style>


