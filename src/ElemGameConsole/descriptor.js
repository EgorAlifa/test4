/* eslint-disable no-restricted-syntax */
import panels from './panels';

/**
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        emulatorJsPath: {
            type: String,
            default: 'http://localhost:3000/emulatorjs/data/',
            label: 'Путь к EmulatorJS',
            hint: 'URL до папки data/ вашей локальной установки EmulatorJS. Например: http://localhost:3000/emulatorjs/data/ — для офлайн-работы скачайте EmulatorJS с github.com/EmulatorJS/EmulatorJS и поднимите локальный сервер.'
        },
        accentColor: {
            type: String,
            default: '#00ff88',
            label: 'Акцентный цвет',
            hint: 'Цвет подсветки и неона в интерфейсе библиотеки'
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
