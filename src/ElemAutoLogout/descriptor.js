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
        /* ── Visual styling props (Стили panel) ─────────────────── */
        overlayColor: {
            type: String,
            default: '#000000',
            label: 'Цвет подложки'
        },
        overlayOpacity: {
            type: Number,
            default: 45,
            label: 'Непрозрачность подложки (%)'
        },
        dialogBgColor: {
            type: String,
            default: '',
            label: 'Фон диалога'
        },
        dialogTextColor: {
            type: String,
            default: '',
            label: 'Цвет текста диалога'
        },
        dialogRadius: {
            type: Number,
            default: 8,
            label: 'Скругление окна предупреждения (px)'
        },
        btnBgColor: {
            type: String,
            default: '',
            label: 'Фон кнопки'
        },
        btnTextColor: {
            type: String,
            default: '',
            label: 'Цвет текста кнопки'
        },
        btnRadius: {
            type: Number,
            default: 8,
            label: 'Скругление кнопки (px)'
        },
        iconColor: {
            type: String,
            default: '',
            label: 'Цвет иконки'
        },
        fontFamily: {
            type: String,
            default: '',
            label: 'Шрифт окна предупреждения'
        },
        btnFontSize: {
            type: String,
            default: '',
            label: 'Размер шрифта кнопки'
        },
        btnFontWeight: {
            type: String,
            default: '',
            label: 'Насыщенность шрифта кнопки'
        },
        btnTextTransform: {
            type: String,
            default: 'none',
            label: 'Регистр текста кнопки'
        },
        letterSpacing: {
            type: String,
            default: '',
            label: 'Межбуквенный интервал'
        },
        dialogMaxWidth: {
            type: Number,
            default: 380,
            label: 'Ширина окна предупреждения (px)'
        },
        /* ── Raw CSS overrides (Я дизайнер panel) ───────────────── */
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
