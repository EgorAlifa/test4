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
                <div class="arcade-stage">
                    <iframe
                        ref="gameFrame"
                        :srcdoc="currentGame.html"
                        class="arcade-frame"
                        sandbox="allow-scripts allow-same-origin"
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
import snakeHtml from './games/snake';
import racingHtml from './games/racing';
import shooterHtml from './games/shooter';

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
    }
];

export default {
    extends: Elem,

    meta,

    static: {},

    data: () => ({
        ...ElemInstanceTypeDescriptor,
        GAMES,
        currentGame: null
    }),

    methods: {
        play(game) {
            this.currentGame = game;
            this.$nextTick(() => {
                if (this.$refs.gameFrame) {
                    this.$refs.gameFrame.focus();
                }
            });
        },

        exit() {
            this.currentGame = null;
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
