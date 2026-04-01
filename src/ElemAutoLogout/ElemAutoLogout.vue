<template>
    <w-elem>
        <component :is="'style'" v-html="customCssContent" />
        <!-- Displayed only in editor mode as a visual placeholder -->
        <div v-if="isEditorMode" class="auto-logout__placeholder">
            <i class="mdi mdi-timer-off-outline"></i>
            <span>Автовыход: {{ props.timeoutSeconds }}с бездействия</span>
        </div>
        <!-- Warning overlay shown before automatic logout -->
        <transition name="auto-logout">
            <div v-if="showWarning" class="auto-logout__overlay">
                <div class="auto-logout__dialog">
                    <i class="mdi mdi-alert-circle-outline auto-logout__dialog-icon"></i>
                    <div class="auto-logout__dialog-title">{{ props.labels.warningTitle }}</div>
                    <div class="auto-logout__dialog-message">
                        {{ props.labels.warningMessage }}
                        <strong>{{ countdown }} {{ props.labels.seconds }}</strong>
                    </div>
                    <button class="btn btn-primary auto-logout__dialog-btn" @click="onStayLoggedIn">
                        {{ props.labels.stayLoggedIn }}
                    </button>
                </div>
            </div>
        </transition>
    </w-elem>
</template>
<script>
import { AuthManager } from '@goodt-wcore/managers';
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { ACTIVITY_EVENTS } from './constants';

/**
 * sessionStorage key used to remember the page URL at the moment auto-logout
 * was triggered. On the next successful login, ElemAutoLogout reads this key
 * and redirects back to the saved URL before starting activity tracking.
 */
const RETURN_URL_KEY = '__elemAutoLogout_returnUrl';

export default {
    extends: Elem,
    meta,
    data: () => ({
        showWarning: false,
        countdown: 0
    }),
    computed: {
        customCssContent() {
            const p = this.props;

            // ── Overlay ───────────────────────────────────────────────────
            const hex = (p.overlayColor && p.overlayColor.startsWith('#')) ? p.overlayColor : '#000000';
            const r = parseInt(hex.slice(1, 3), 16) || 0;
            const g = parseInt(hex.slice(3, 5), 16) || 0;
            const b = parseInt(hex.slice(5, 7), 16) || 0;
            const a = ((p.overlayOpacity != null ? p.overlayOpacity : 45) / 100).toFixed(2);
            let overlayCss = `background: rgba(${r},${g},${b},${a});`;
            if (p.overlayCustomCss) overlayCss += ` ${p.overlayCustomCss}`;
            let css = `.auto-logout__overlay { ${overlayCss} }`;

            // ── Dialog ────────────────────────────────────────────────────
            let dlg = '';
            if (p.dialogBgColor)   dlg += `background: ${p.dialogBgColor};`;
            if (p.dialogTextColor) dlg += `color: ${p.dialogTextColor};`;
            if (p.dialogRadius != null) dlg += `border-radius: ${p.dialogRadius}px;`;
            if (p.dialogCustomCss) dlg += ` ${p.dialogCustomCss}`;
            if (dlg) css += ` .auto-logout__dialog { ${dlg} }`;

            // Explicitly override child text elements (style.pcss has hardcoded colors that block inheritance)
            if (p.dialogTextColor) {
                css += ` .auto-logout__dialog-title { color: ${p.dialogTextColor}; }`;
                css += ` .auto-logout__dialog-message { color: ${p.dialogTextColor}; }`;
            }
            if (p.fontFamily) {
                css += ` .auto-logout__dialog, .auto-logout__dialog-title, .auto-logout__dialog-message, .auto-logout__dialog-btn { font-family: ${p.fontFamily}; }`;
            }
            if (p.letterSpacing) {
                css += ` .auto-logout__dialog-title, .auto-logout__dialog-message, .auto-logout__dialog-btn { letter-spacing: ${p.letterSpacing}; }`;
            }
            if (p.textTransform && p.textTransform !== 'none') {
                css += ` .auto-logout__dialog-title, .auto-logout__dialog-message, .auto-logout__dialog-btn { text-transform: ${p.textTransform}; }`;
            }
            if (p.dialogMaxWidth != null) {
                css += ` .auto-logout__dialog { max-width: ${p.dialogMaxWidth}px; }`;
            }

            // ── Button ────────────────────────────────────────────────────
            let btn = '';
            if (p.btnBgColor)   btn += `background: ${p.btnBgColor} !important; border-color: ${p.btnBgColor} !important;`;
            if (p.btnTextColor) btn += `color: ${p.btnTextColor} !important;`;
            if (p.btnRadius != null) btn += `border-radius: ${p.btnRadius}px;`;
            if (p.btnFontSize)   btn += `font-size: ${p.btnFontSize} !important;`;
            if (p.btnFontWeight) btn += `font-weight: ${p.btnFontWeight} !important;`;
            if (p.dialogBtnCustomCss) btn += ` ${p.dialogBtnCustomCss}`;
            if (btn) {
                css += ` .auto-logout__dialog-btn { ${btn} }`;
                // Also override :hover/:focus so the framework's btn-primary hover doesn't bleed through
                if (p.btnBgColor) {
                    css += ` .auto-logout__dialog-btn:hover, .auto-logout__dialog-btn:focus { background: ${p.btnBgColor} !important; border-color: ${p.btnBgColor} !important; filter: brightness(0.88); }`;
                }
            }

            // ── Icon ──────────────────────────────────────────────────────
            if (p.iconColor) css += ` .auto-logout__dialog-icon { color: ${p.iconColor}; }`;

            return css;
        }
    },
    mounted() {
        if (this.isEditorMode) {
            return;
        }

        /** @type {{ adapter: import('@goodt-common/auth/adapters/Adapter').default }} */
        const { adapter } = AuthManager.instance;
        if (!adapter || !adapter.authenticated) {
            // User is already logged out (e.g. widget lives on the /login page too).
            // Do not start tracking — avoids a logout loop after redirect.
            return;
        }

        // After re-login: redirect back to the page where auto-logout occurred.
        // We use sessionStorage so the URL survives the Keycloak redirect round-trip
        // without relying on the logout redirect_uri (which may be overwritten by
        // Keycloak's fragment-mode auth code response on the way back in).
        if (this.props.preserveReturnUrl) {
            try {
                const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
                if (returnUrl) {
                    sessionStorage.removeItem(RETURN_URL_KEY);
                    const saved = new URL(returnUrl);
                    if (saved.origin === window.location.origin
                            && saved.href !== window.location.href) {
                        // If the saved URL differs only by hash this is an in-page
                        // navigation — the component stays mounted and startTracking()
                        // must be called here.  If it triggers a full page reload the
                        // component will be destroyed anyway, so the extra startTracking()
                        // call is harmless.
                        window.location.replace(returnUrl);
                    }
                }
            } catch (e) {
                // ignore sessionStorage errors
            }
        }

        this.startTracking();
    },
    beforeDestroy() {
        this.stopTracking();
    },
    methods: {
        ...ElemInstanceTypeDescriptor,

        /**
         * Attach activity listeners and start the inactivity timer.
         */
        startTracking() {
            this._boundHandleActivity = this.handleActivity.bind(this);
            ACTIVITY_EVENTS.forEach((event) => {
                document.addEventListener(event, this._boundHandleActivity, { passive: true });
            });
            this.resetTimer();
        },

        /**
         * Remove activity listeners and clear all timers.
         */
        stopTracking() {
            if (this._boundHandleActivity) {
                ACTIVITY_EVENTS.forEach((event) => {
                    document.removeEventListener(event, this._boundHandleActivity);
                });
                this._boundHandleActivity = null;
            }
            this.clearTimers();
        },

        /**
         * Called on each user activity event.
         * Resets timer only when no warning is currently shown.
         */
        handleActivity() {
            if (!this.showWarning) {
                this.resetTimer(true);
            }
        },

        /**
         * Reset the inactivity timer from scratch.
         * @param {boolean} [fromActivity] - true when called from a DOM activity event
         */
        resetTimer(fromActivity = false) { // eslint-disable-line no-unused-vars
            this.clearTimers();
            this.showWarning = false;

            const { timeoutSeconds, warningEnabled, warningDuration } = this.props;
            const effectiveWarning = warningEnabled ? Math.min(warningDuration, timeoutSeconds) : 0;
            const idleDelay = (timeoutSeconds - effectiveWarning) * 1000;

            if (effectiveWarning > 0) {
                this._idleTimer = setTimeout(() => {
                    this.startWarning(effectiveWarning);
                }, idleDelay);
            } else {
                this._idleTimer = setTimeout(() => {
                    this.performLogout();
                }, timeoutSeconds * 1000);
            }
        },

        /**
         * Show the warning dialog and start the countdown to logout.
         * @param {number} seconds
         */
        startWarning(seconds) {
            this.showWarning = true;
            this.countdown = seconds;

            this._countdownInterval = setInterval(() => {
                this.countdown -= 1;
                if (this.countdown <= 0) {
                    clearInterval(this._countdownInterval);
                    this.performLogout();
                }
            }, 1000);
        },

        /**
         * Clear all active timers and intervals.
         */
        clearTimers() {
            clearTimeout(this._idleTimer);
            clearInterval(this._countdownInterval);
            this._idleTimer = null;
            this._countdownInterval = null;
        },

        /**
         * "Stay logged in" button handler — dismiss warning and reset timer.
         */
        onStayLoggedIn() {
            this.resetTimer();
        },

        /**
         * Perform logout via AuthManager.instance.logout().
         *
         * AuthManager.instance.logout() fires all _logoutHandlers registered by
         * the platform (router, session manager, etc.) — this is the correct
         * platform-level logout, analogous to how ElemAuthContainer uses
         * AuthManager.instance.login() for the platform-level login redirect.
         *
         * Calling adapter.logout() directly would bypass these handlers; for the
         * Keycloak SSO adapter it is literally a no-op (calls super → Promise.resolve).
         */
        async performLogout() {
            this.clearTimers();
            this.showWarning = false;

            // Persist the current URL before Keycloak redirects away.
            // Hash-based player routes (e.g. #/1) are included in href but would
            // be overwritten by Keycloak's fragment-mode auth response on re-login,
            // so sessionStorage is the only reliable way to carry them across.
            if (this.props.preserveReturnUrl) {
                try {
                    sessionStorage.setItem(RETURN_URL_KEY, window.location.href);
                } catch (e) {
                    // ignore sessionStorage errors
                }
            }

            try {
                await AuthManager.instance.logout();
            } catch (err) {
                // ignore logout errors
            }
        }
    }
};
</script>
<style lang="pcss" src="./style.pcss"></style>
