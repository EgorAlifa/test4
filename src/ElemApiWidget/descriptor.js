import { useDatasetMeta } from '@goodt-common/data';
import { DatasetPanelMixin } from './panels';

import panels from './panels';

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        // API Configuration
        apiUrl: {
            type: String,
            default: '',
            label: 'API URL'
        },
        httpMethod: {
            type: String,
            default: 'GET',
            label: 'HTTP метод'
        },
        headers: {
            type: String,
            default: '',
            label: 'Headers'
        },
        bodyFormat: {
            type: String,
            default: 'none',
            label: 'Формат Body'
        },
        bodyContent: {
            type: String,
            default: '',
            label: 'Body содержимое'
        },
        
        // Response Settings
        responsePath: {
            type: String,
            default: '',
            label: 'Путь к данным в ответе'
        },
        displayMode: {
            type: String,
            default: 'tree',
            label: 'Режим отображения'
        },
        maxDepth: {
            type: Number,
            default: 3,
            label: 'Максимальная глубина JSON'
        },
        
        // Auto-request
        autoRequest: {
            type: Boolean,
            default: false,
            label: 'Автозапрос'
        },
        requestInterval: {
            type: Number,
            default: 0,
            label: 'Интервал запросов (сек)'
        },
        
        // Styling
        primaryColor: {
            type: String,
            default: '#3b82f6',
            label: 'Основной цвет'
        },
        successColor: {
            type: String,
            default: '#10b981',
            label: 'Цвет успеха'
        },
        errorColor: {
            type: String,
            default: '#ef4444',
            label: 'Цвет ошибки'
        },
        fontSize: {
            type: String,
            default: '14px',
            label: 'Размер шрифта'
        },
        borderRadius: {
            type: String,
            default: '8px',
            label: 'Радиус границ'
        },
        padding: {
            type: String,
            default: '16px',
            label: 'Внутренние отступы'
        },
        
        // Display Options
        showHeaders: {
            type: Boolean,
            default: true,
            label: 'Показывать заголовки'
        },
        showStatusCode: {
            type: Boolean,
            default: true,
            label: 'Показывать статус код'
        },
        showResponseTime: {
            type: Boolean,
            default: true,
            label: 'Показывать время ответа'
        },
        enableCopy: {
            type: Boolean,
            default: true,
            label: 'Включить копирование'
        },
        enableDownload: {
            type: Boolean,
            default: true,
            label: 'Включить скачивание'
        }
    }
});

export const metaBase = {
    descriptor,
    panels,
    isChildAllowed: false
};

export const meta = useDatasetMeta(metaBase, {
    panel: {
        mixins: [DatasetPanelMixin]
    }
});

