import { TInstance as TElemInstance } from '/ElemApiWidget';
import { TInstance as TPanelInstance } from './ApiConfigPanel';

export const ElemInstanceTypeDescriptor: TElemInstance = undefined;
export const PanelInstanceTypeDescriptor: TPanelInstance = undefined;

export interface ElemApiWidgetProps {
    // API Configuration
    apiUrl: string;
    httpMethod: string;
    headers: string;
    bodyFormat: string;
    bodyContent: string;
    
    // Response Settings
    responsePath: string;
    displayMode: string;
    maxDepth: number;
    
    // Auto-request
    autoRequest: boolean;
    requestInterval: number;
    
    // Styling
    primaryColor: string;
    successColor: string;
    errorColor: string;
    fontSize: string;
    borderRadius: string;
    padding: string;
    
    // Display Options
    showHeaders: boolean;
    showStatusCode: boolean;
    showResponseTime: boolean;
    enableCopy: boolean;
    enableDownload: boolean;
}

export interface RequestStatus {
    idle: 'idle';
    loading: 'loading';
    success: 'success';
    error: 'error';
}

