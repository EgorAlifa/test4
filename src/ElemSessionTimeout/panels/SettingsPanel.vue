<template>
    <w-panel>
        <ui-container>

            <!-- ── Enabled toggle ────────────────────────────────────── -->
            <div class="sp-row">
                <label class="sp-label">Автовыход активен</label>
                <ui-toggle
                    :value="props.stEnabled"
                    @change="v => { props.stEnabled = v; propChanged('stEnabled'); }" />
            </div>

            <!-- ── Timeout ────────────────────────────────────────────── -->
            <div class="sp-section">Таймаут бездействия</div>
            <div class="sp-row">
                <label class="sp-label">Минут до выхода</label>
                <ui-input
                    type="number"
                    :min="1"
                    :value="props.stTimeoutMinutes"
                    @change="v => { props.stTimeoutMinutes = Number(v); propChanged('stTimeoutMinutes'); }" />
            </div>
            <div class="sp-hint">
                Отсчёт сбрасывается при любом движении мыши, клике или нажатии клавиши.
            </div>

            <!-- ── Warning ────────────────────────────────────────────── -->
            <div class="sp-section">Предупреждение</div>
            <div class="sp-row">
                <label class="sp-label">Показывать предупреждение</label>
                <ui-toggle
                    :value="props.stShowWarning"
                    @change="v => { props.stShowWarning = v; propChanged('stShowWarning'); }" />
            </div>
            <div v-if="props.stShowWarning">
                <div class="sp-row">
                    <label class="sp-label">За сколько секунд предупреждать</label>
                    <ui-input
                        type="number"
                        :min="5"
                        :value="props.stWarningSeconds"
                        @change="v => { props.stWarningSeconds = Number(v); propChanged('stWarningSeconds'); }" />
                </div>
                <div class="sp-row sp-row--col">
                    <label class="sp-label">Текст предупреждения</label>
                    <ui-input
                        :value="props.stWarningMessage"
                        @change="v => { props.stWarningMessage = v; propChanged('stWarningMessage'); }" />
                    <div class="sp-hint"><code>{seconds}</code> — подставляет оставшиеся секунды.</div>
                </div>
            </div>

            <!-- ── Redirect ───────────────────────────────────────────── -->
            <div class="sp-section">Редирект при выходе</div>
            <div class="sp-row sp-row--col">
                <label class="sp-label">URL перенаправления</label>
                <ui-input
                    :value="props.stRedirectUrl"
                    placeholder="https://example.com/auth (пусто — Keycloak logout)"
                    @change="v => { props.stRedirectUrl = v; propChanged('stRedirectUrl'); }" />
                <div class="sp-hint">
                    Оставьте пустым, чтобы использовать стандартный Keycloak logout.<br>
                    Укажите полный URL для редиректа на произвольную страницу авторизации.
                </div>
            </div>

            <!-- ── Appearance ─────────────────────────────────────────── -->
            <div v-if="props.stShowWarning" class="sp-section">Внешний вид предупреждения</div>
            <div v-if="props.stShowWarning">
                <div class="sp-row">
                    <label class="sp-label">Фон оверлея</label>
                    <ui-color
                        :value="props.stOverlayBg"
                        @change="v => { props.stOverlayBg = v; propChanged('stOverlayBg'); }" />
                </div>
                <div class="sp-row">
                    <label class="sp-label">Фон карточки</label>
                    <ui-color
                        :value="props.stCardBg"
                        @change="v => { props.stCardBg = v; propChanged('stCardBg'); }" />
                </div>
                <div class="sp-row">
                    <label class="sp-label">Акцентный цвет</label>
                    <ui-color
                        :value="props.stAccentColor"
                        @change="v => { props.stAccentColor = v; propChanged('stAccentColor'); }" />
                </div>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'timer-outline' }
};
</script>

<style scoped>
.sp-section {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 14px 0 6px;
}
.sp-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
}
.sp-row--col {
    flex-direction: column;
    align-items: stretch;
}
.sp-label {
    font-size: 12px;
    color: #334155;
    flex: 1;
    min-width: 0;
}
.sp-hint {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.5;
    margin-top: 2px;
}
.sp-hint code {
    font-family: monospace;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    color: #475569;
}
</style>
