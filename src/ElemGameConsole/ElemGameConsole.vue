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
                        v-for="game in GAMES"
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
                        <div class="arcade-card__play">ИГРАТЬ ▶</div>
                    </div>
                </div>

                <div class="arcade-footer">
                    Управление клавиатурой · Пробел — старт/огонь
                </div>
            </template>

            <!-- ======== GAME SCREEN ======== -->
            <template v-if="currentGame">
                <div class="arcade-bar" :style="{ '--gc': currentGame.color }">
                    <button class="arcade-bar__back" @click="exit">← ВЫХОД</button>
                    <span class="arcade-bar__title">{{ currentGame.art }} {{ currentGame.name }}</span>
                    <span class="arcade-bar__hint">F - полный экран</span>
                </div>
                <div class="arcade-stage" :style="{ '--gc': currentGame.color }" @click="focusFrame">
                    <iframe
                        ref="gameFrame"
                        :srcdoc="currentGame.html"
                        class="arcade-frame"
                        tabindex="0"
                        sandbox="allow-scripts"
                        allowfullscreen
                    ></iframe>
                    <button v-if="!gameStarted" class="arcade-start-btn" @click.stop="startGame">
                        ▶ ИГРАТЬ
                    </button>
                </div>
            </template>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import snakeHtml from './games/snake';
import racingHtml from './games/racing';
import shooterHtml from './games/shooter';
import csHtml from './games/cs';
import racing3dHtml from './games/racing3d';

const GAMES = [
    {
        id: 'snake',
        name: 'SNAKE',
        art: '🐍',
        desc: 'Собирай еду, не врезайся в себя',
        controls: ['↑', '↓', '←', '→'],
        color: '#00ff88',
        html: snakeHtml
    },
    {
        id: 'racing',
        name: 'RACING',
        art: '🏎',
        desc: 'Уклоняйся от машин, набирай скорость',
        controls: ['←', '→'],
        color: '#ff6b35',
        html: racingHtml
    },
    {
        id: 'shooter',
        name: 'SHOOTER',
        art: '🚀',
        desc: 'Уничтожай врагов, выживай в волнах',
        controls: ['←', '→', 'SPC'],
        color: '#00d4ff',
        html: shooterHtml
    },
    {
        id: 'cs',
        name: 'CS-STYLE',
        art: '🔫',
        desc: 'Зачисти карту от врагов (от 1-го лица)',
        controls: ['WASD', '←→', 'SPC'],
        color: '#ff4455',
        html: csHtml
    },
    {
        id: 'racing3d',
        name: 'MOTO 3D',
        art: '🏍',
        desc: 'Гонки от третьего лица — объезжай машины',
        controls: ['←', '→'],
        color: '#cc44ff',
        html: racing3dHtml
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
                const sendStart = () => {
                    frame.focus();
                    try {
                        frame.contentWindow.postMessage(
                            { type: 'start', maxWaves: this.props.maxWaves || 10 },
                            '*'
                        );
                    } catch (e) { /* sandboxed — ignore */ }
                };
                // send after srcdoc finishes loading so listeners are attached
                frame.addEventListener('load', sendStart, { once: true });
            });
        },

        focusFrame() {
            if (this.gameStarted && this.$refs.gameFrame) {
                this.$refs.gameFrame.focus();
            }
        },

        exit() {
            this.currentGame = null;
            this.gameStarted = false;
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
