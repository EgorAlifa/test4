import panels from './panels';
import { RedirectType, LocalizedRedirectType } from './constants';

/**
 * @return {import('goodt-wcore').ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        timeoutSeconds: {
            type: Number,
            default: 1800,
            label: 'Время бездействия (секунды)'
        },
        redirectType: {
            type: String,
            default: RedirectType.DEFAULT,
            label: 'Тип перенаправления после выхода',
            options: Object.entries(LocalizedRedirectType).map(([value, label]) => ({ value, label }))
        },
        customRedirectUrl: {
            type: String,
            default: '',
            label: 'URL перенаправления (для пользовательской страницы)'
        },
        warningEnabled: {
            type: Boolean,
            default: true,
            label: 'Показывать предупреждение перед выходом'
        },
        warningDuration: {
            type: Number,
            default: 30,
            label: 'Время предупреждения (секунды)'
        },
        labels: {
            type: Object,
            label: {
                labels: 'Настройки текстов',
                'labels.warningTitle': 'Заголовок предупреждения',
                'labels.warningMessage': 'Сообщение предупреждения',
                'labels.stayLoggedIn': 'Текст кнопки продления сессии',
                'labels.seconds': 'Сокращение "секунд"'
            },
            default: () => ({
                warningTitle: 'Сессия истекает',
                warningMessage: 'Вы будете автоматически выведены из системы через',
                stayLoggedIn: 'Оставаться в системе',
                seconds: 'сек.'
            })
        },
        overlayCustomCss: {
            type: String,
            default: '',
            label: 'CSS подложки (overlay)'
        },
        dialogCustomCss: {
            type: String,
            default: '',
            label: 'CSS диалогового окна'
        },
        dialogBtnCustomCss: {
            type: String,
            default: '',
            label: 'CSS кнопки в диалоге'
        }
    }
});

export const meta = {
    descriptor,
    panels
};

export default descriptor;
