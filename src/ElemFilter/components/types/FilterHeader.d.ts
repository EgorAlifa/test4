import { TElemInstance } from '../../types/ElemFilter';
import { TooltipOptions } from '../config';

export type TFilterHeaderInstance = {
    // static
    TooltipOptions: typeof TooltipOptions;

    // computed editor
    parentProps: TElemInstance['props'];
    searchModePlaceholderText: string;
    placeholderText: string;
    isQuickInput: boolean;
};
