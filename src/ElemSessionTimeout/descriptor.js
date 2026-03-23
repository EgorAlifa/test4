import panels from './panels';

export const descriptor = () => ({
    props: {
        // ── Timeout ───────────────────────────────────────────────────
        stTimeoutMinutes: {
            type: Number,
            default: 30,
            label: 'Таймаут бездействия (минуты)'
        },
        stWarningSeconds: {
            type: Number,
            default: 60,
            label: 'Предупреждение за N секунд до выхода (0 — отключить)'
        },
        // ── Redirect ──────────────────────────────────────────────────
        stRedirectUrl: {
            type: String,
            default: '',
            label: 'URL для редиректа (пусто — Keycloak logout по умолчанию)'
        },
        // ── Behaviour ─────────────────────────────────────────────────
        stEnabled: {
            type: Boolean,
            default: true,
            label: 'Включить автовыход'
        },
        stShowWarning: {
            type: Boolean,
            default: true,
            label: 'Показывать предупреждение перед выходом'
        },
        stWarningMessage: {
            type: String,
            default: 'Сессия завершится через {seconds} сек. из-за неактивности.',
            label: 'Текст предупреждения ({seconds} — подстановка оставшихся секунд)'
        },
        // ── Appearance ────────────────────────────────────────────────
        stOverlayBg: {
            type: String,
            default: 'rgba(15,23,42,0.75)',
            label: 'Фон оверлея предупреждения'
        },
        stCardBg: {
            type: String,
            default: '#ffffff',
            label: 'Фон карточки предупреждения'
        },
        stAccentColor: {
            type: String,
            default: '#ef4444',
            label: 'Акцентный цвет (кнопка выхода)'
        }
    },
    vars: {
        sessionActive: { description: 'true — сессия активна, false — выход выполнен' },
        secondsLeft: { description: 'Секунд до выхода (при обратном отсчёте)' }
    },
    cssVars: {}
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: false
};

export default descriptor;
