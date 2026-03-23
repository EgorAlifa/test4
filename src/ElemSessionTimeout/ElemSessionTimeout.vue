<template>
    <w-elem style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;">
        <!-- Warning overlay — only rendered during countdown, and only in runtime -->
        <transition name="st-fade">
            <div
                v-if="showOverlay"
                class="st-overlay"
                :style="{ background: props.stOverlayBg }"
                style="pointer-events:all">
                <div class="st-card" :style="{ background: props.stCardBg }">
                    <div class="st-card__icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
                            <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p class="st-card__msg">{{ warningText }}</p>
                    <div class="st-card__progress">
                        <div
                            class="st-card__progress-bar"
                            :style="{
                                width: progressPct + '%',
                                background: props.stAccentColor
                            }" />
                    </div>
                    <div class="st-card__actions">
                        <button
                            class="st-btn st-btn--primary"
                            :style="{ background: props.stAccentColor }"
                            @click="doLogout">
                            Выйти сейчас
                        </button>
                        <button class="st-btn st-btn--ghost" @click="resetTimer">
                            Я здесь
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </w-elem>
</template>

<script>
import { Elem } from 'goodt-wcore';

// Activity events that reset the idle timer
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export default {
    name: 'ElemSessionTimeout',
    extends: Elem,

    meta: {
        name: 'Session Timeout',
        icon: 'timer-sand',
        description: 'Автовыход при бездействии пользователя'
    },

    data: () => ({
        /** Main idle countdown — seconds remaining until logout */
        secondsLeft: 0,
        /** Whether the warning overlay is visible */
        showOverlay: false,
        /** Internal interval handle */
        _tickInterval: null,
        /** Whether the component has already triggered logout (prevents double-fire) */
        _loggedOut: false
    }),

    computed: {
        timeoutSeconds() {
            return (this.props.stTimeoutMinutes || 30) * 60;
        },
        warnAt() {
            return this.props.stShowWarning ? (this.props.stWarningSeconds || 60) : 0;
        },
        warningText() {
            const msg = this.props.stWarningMessage || 'Сессия завершится через {seconds} сек.';
            return msg.replace('{seconds}', this.secondsLeft);
        },
        progressPct() {
            const warn = this.warnAt;
            if (!warn) return 0;
            return Math.max(0, Math.min(100, (this.secondsLeft / warn) * 100));
        }
    },

    watch: {
        'props.stEnabled'(val) {
            if (val) this._start();
            else this._stop();
        },
        'props.stTimeoutMinutes'() {
            if (this.props.stEnabled && !this.isEditorMode) this.resetTimer();
        }
    },

    mounted() {
        if (!this.isEditorMode && this.props.stEnabled) {
            this._start();
        }
        // Expose secondsLeft to store on each tick
        this._emitState(true);
    },

    beforeDestroy() {
        this._stop();
    },

    methods: {
        // ── Lifecycle ──────────────────────────────────────────────────

        _start() {
            this._loggedOut = false;
            this.secondsLeft = this.timeoutSeconds;
            this.showOverlay = false;
            this._bindActivity();
            this._tickInterval = setInterval(this._tick, 1000);
        },

        _stop() {
            clearInterval(this._tickInterval);
            this._tickInterval = null;
            this._unbindActivity();
            this.showOverlay = false;
        },

        // ── Timer ──────────────────────────────────────────────────────

        _tick() {
            if (this._loggedOut) return;

            this.secondsLeft -= 1;
            this._emitState(false);

            if (this.secondsLeft <= 0) {
                this.doLogout();
                return;
            }

            if (this.warnAt > 0 && this.secondsLeft <= this.warnAt) {
                this.showOverlay = true;
            }
        },

        resetTimer() {
            if (this._loggedOut) return;
            this.secondsLeft = this.timeoutSeconds;
            this.showOverlay = false;
            this._emitState(false);
        },

        // ── Activity listeners ─────────────────────────────────────────

        _bindActivity() {
            this._activityHandler = this.resetTimer.bind(this);
            ACTIVITY_EVENTS.forEach((evt) => {
                document.addEventListener(evt, this._activityHandler, { passive: true });
            });
        },

        _unbindActivity() {
            if (!this._activityHandler) return;
            ACTIVITY_EVENTS.forEach((evt) => {
                document.removeEventListener(evt, this._activityHandler);
            });
            this._activityHandler = null;
        },

        // ── Logout ─────────────────────────────────────────────────────

        doLogout() {
            if (this._loggedOut) return;
            this._loggedOut = true;
            this._stop();
            this._emitState(false);

            const redirectUrl = (this.props.stRedirectUrl || '').trim();

            // Try Keycloak logout if window.$keycloak is available (standard Goodt setup)
            if (window.$keycloak && typeof window.$keycloak.logout === 'function') {
                const opts = redirectUrl ? { redirectUri: redirectUrl } : {};
                window.$keycloak.logout(opts);
                return;
            }

            // Fallback: direct redirect
            if (redirectUrl) {
                window.location.href = redirectUrl;
                return;
            }

            // Last resort: try common Keycloak logout endpoint with current origin as redirect
            const origin = window.location.origin;
            window.location.href = `${origin}/auth/realms/master/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(origin)}`;
        },

        // ── Store output ───────────────────────────────────────────────

        _emitState(initial) {
            const active = !this._loggedOut;
            if (initial) {
                this.$storeCommit({ sessionActive: active, secondsLeft: this.secondsLeft });
            } else {
                this.$storeCommit({ sessionActive: active, secondsLeft: this.secondsLeft });
            }
        }
    }
};
</script>

<style scoped>
.st-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
}

.st-card {
    width: 360px;
    max-width: calc(100vw - 32px);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12);
    padding: 32px 28px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
}

.st-card__icon {
    color: #ef4444;
    line-height: 0;
}

.st-card__msg {
    font-size: 15px;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.5;
    margin: 0;
}

.st-card__progress {
    width: 100%;
    height: 6px;
    background: #f1f5f9;
    border-radius: 3px;
    overflow: hidden;
}

.st-card__progress-bar {
    height: 100%;
    border-radius: 3px;
    transition: width 1s linear;
}

.st-card__actions {
    display: flex;
    gap: 10px;
    width: 100%;
}

.st-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s, transform 0.1s;
}
.st-btn:hover { opacity: 0.88; }
.st-btn:active { transform: scale(0.97); }

.st-btn--primary {
    color: #fff;
}

.st-btn--ghost {
    background: #f1f5f9;
    color: #475569;
}
.st-btn--ghost:hover { background: #e2e8f0; }

/* Transition */
.st-fade-enter-active, .st-fade-leave-active { transition: opacity 0.25s; }
.st-fade-enter, .st-fade-leave-to { opacity: 0; }
</style>
