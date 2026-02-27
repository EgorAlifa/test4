/* place render data: texts, ui control settings, options lists, css class and styles map here */

import { IMAGE_SOURCE_TYPES, IMAGE_FIT_OPTIONS } from './constants';

export const imageSourceOptions = [
    { value: IMAGE_SOURCE_TYPES.DATASET, label: 'Из датасета' },
    { value: IMAGE_SOURCE_TYPES.MANUAL, label: 'Задать вручную' }
];

export const imageFitOptions = IMAGE_FIT_OPTIONS;

