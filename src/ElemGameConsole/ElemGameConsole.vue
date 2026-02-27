<template>
    <w-elem>
        <div class="arcade" :style="{ '--accent': props.accentColor }">
            <!-- ======== GAME SELECT ======== -->
            <template v-if="!currentGame">
                <div class="arcade-header">
                    <span class="arcade-logo">🕹 ARCADE</span>
                    <span class="arcade-sub">ВЫБЕРИ ИГРУ</span>
                </div>

                <div class="arcade-grid">
                    <div
                        v-for="game in visibleGames"
                        :key="game.id"
                        class="arcade-card"
                        :style="{ '--gc': game.color }"
                        @click="play(game)"
                    >
                        <div class="arcade-card__art">{{ game.art }}</div>
                        <div class="arcade-card__name">{{ game.name }}</div>
                        <div class="arcade-card__desc">{{ game.desc }}</div>
                        <div class="arcade-card__controls">
                            <span
                                v-for="ctrl in game.controls"
                                :key="ctrl"
                                class="arcade-card__key"
                            >{{ ctrl }}</span>
                        </div>
                        <div v-if="game.secret" class="arcade-card__secret">⭐ СЕКРЕТ</div>
                        <div class="arcade-card__play">ИГРАТЬ ▶</div>
                    </div>
                </div>

                <div class="arcade-footer">
                    Управление клавиатурой · Пробел — старт/огонь
                </div>
            </template>

            <!-- ======== GAME BAR (when game selected) ======== -->
            <template v-if="currentGame">
                <div class="arcade-bar" :style="{ '--gc': currentGame.color }">
                    <button class="arcade-bar__back" @click="exit">← ВЫХОД</button>
                    <span class="arcade-bar__title">{{ currentGame.art }} {{ currentGame.name }}</span>
                    <span class="arcade-bar__hint">F - полный экран</span>
                </div>

                <!-- INSTRUCTION CARD (before game starts) -->
                <div v-if="!gameStarted" class="arcade-stage" :style="{ '--gc': currentGame.color }">
                    <div class="inst-card">
                        <div class="inst-header">
                            <span class="inst-art">{{ currentGame.art }}</span>
                            <div>
                                <div class="inst-name">{{ currentGame.name }}</div>
                                <div class="inst-desc">{{ currentGame.desc }}</div>
                            </div>
                        </div>
                        <div class="inst-controls">
                            <div v-for="row in currentGame.keyboard" :key="row.action" class="inst-row">
                                <div class="inst-keys">
                                    <span v-for="k in row.keys" :key="k" class="inst-key">{{ k }}</span>
                                </div>
                                <span class="inst-action">— {{ row.action }}</span>
                            </div>
                        </div>
                        <button class="inst-play-btn" @click="startGame">▶ ИГРАТЬ</button>
                    </div>
                </div>

                <!-- IFRAME (after start) -->
                <div v-if="gameStarted" class="arcade-stage" :style="{ '--gc': currentGame.color }" @click="focusFrame">
                    <iframe
                        ref="gameFrame"
                        :srcdoc="currentGame.html"
                        class="arcade-frame"
                        tabindex="0"
                        sandbox="allow-scripts"
                        allowfullscreen
                    ></iframe>
                </div>
            </template>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import snakeHtml    from './games/snake';
import racingHtml   from './games/racing';
import shooterHtml  from './games/shooter';
import csHtml       from './games/cs';
import racing3dHtml from './games/racing3d';
import marioHtml    from './games/mario';

const GAMES = [
    {
        id: 'snake',
        name: 'SNAKE',
        art: '🐍',
        desc: 'Собирай еду, не врезайся в себя',
        controls: ['↑↓←→'],
        color: '#00ff88',
        html: snakeHtml,
        keyboard: [
            { keys: ['↑', '↓', '←', '→'], action: 'ДВИЖЕНИЕ' },
            { keys: ['SPC'], action: 'СТАРТ' }
        ]
    },
    {
        id: 'racing',
        name: 'RACING',
        art: '🏎',
        desc: 'Уклоняйся от машин, набирай скорость',
        controls: ['←', '→'],
        color: '#ff6b35',
        html: racingHtml,
        keyboard: [
            { keys: ['←', '→'], action: 'РУЛЬ' },
            { keys: ['SPC'], action: 'СТАРТ' }
        ]
    },
    {
        id: 'shooter',
        name: 'SHOOTER',
        art: '🚀',
        desc: 'Уничтожай врагов, выживай в волнах',
        controls: ['←', '→', 'SPC'],
        color: '#00d4ff',
        html: shooterHtml,
        keyboard: [
            { keys: ['←', '→'], action: 'ДВИЖЕНИЕ' },
            { keys: ['SPC'], action: 'ОГОНЬ / СТАРТ' }
        ]
    },
    {
        id: 'cs',
        name: 'CS-STYLE',
        art: '🔫',
        desc: 'Зачисти карту от врагов (от 1-го лица)',
        controls: ['WASD', '←→', 'ПКМ'],
        color: '#ff4455',
        html: csHtml,
        keyboard: [
            { keys: ['W', 'A', 'S', 'D'], action: 'ХОДЬБА' },
            { keys: ['←', '→'], action: 'ПОВОРОТ' },
            { keys: ['ПКМ', 'SPC'], action: 'ОГОНЬ' },
            { keys: ['R'], action: 'ПЕРЕЗАРЯДКА' }
        ]
    },
    {
        id: 'racing3d',
        name: 'MOTO 3D',
        art: '🏍',
        desc: 'Гонки от третьего лица — объезжай машины',
        controls: ['←', '→'],
        color: '#cc44ff',
        html: racing3dHtml,
        keyboard: [
            { keys: ['←', '→'], action: 'ПОВОРОТ' },
            { keys: ['SPC'], action: 'СТАРТ' }
        ]
    },
    {
        id: 'mario',
        name: 'MARIO',
        art: '🍄',
        desc: 'Секретный платформер — достигни флага!',
        controls: ['←→', '↑'],
        color: '#ff4400',
        html: marioHtml,
        secret: true,
        keyboard: [
            { keys: ['←', '→'], action: 'ДВИЖЕНИЕ' },
            { keys: ['↑', 'SPC'], action: 'ПРЫЖОК' }
        ]
    }
];

export default {
    extends: Elem,

    meta,

    static: {},

    data: () => ({
        ...ElemInstanceTypeDescriptor,
        GAMES,
        currentGame: null,
        gameStarted: false
    }),

    computed: {
        visibleGames() {
            return this.GAMES.filter((g) => !g.secret || this.props.secretEnabled);
        }
    },

    created() {
        this._onMessage = (event) => {
            if (event.data && event.data.type === 'exit') {
                this.exit();
            }
        };
        window.addEventListener('message', this._onMessage);
    },

    beforeDestroy() {
        window.removeEventListener('message', this._onMessage);
    },

    methods: {
        play(game) {
            this.currentGame = game;
            this.gameStarted = false;
        },

        startGame() {
            this.gameStarted = true;
            this.$nextTick(() => {
                const frame = this.$refs.gameFrame;
                if (!frame) return;
                frame.addEventListener('load', () => {
                    frame.focus();
                    try {
                        frame.contentWindow.postMessage(
                            {
                                type: 'start',
                                maxWaves: this.props.maxWaves || 10,
                                turnSensitivity: this.props.turnSensitivity || 3
                            },
                            '*'
                        );
                    } catch (e) { /* sandboxed */ }
                }, { once: true });
            });
        },

        focusFrame() {
            if (this.$refs.gameFrame) this.$refs.gameFrame.focus();
        },

        exit() {
            this.currentGame = null;
            this.gameStarted = false;
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
