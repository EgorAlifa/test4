<template>
    <w-elem>
        <div
            class="game-vault"
            :class="{ 'is-dragging': isDragging }"
            :style="{ '--accent': props.accentColor }"
            @dragover.prevent="isDragging = true"
            @dragleave.self="isDragging = false"
            @drop.prevent="onDrop"
        >
            <!-- ========== LIBRARY VIEW ========== -->
            <template v-if="view === 'library'">
                <!-- Header -->
                <div class="gv-header">
                    <div class="gv-brand">
                        <span class="gv-brand__icon">🕹</span>
                        <span class="gv-brand__title">GAME VAULT</span>
                        <span class="gv-brand__count">{{ games.length }} ромок</span>
                    </div>
                    <div class="gv-controls">
                        <div class="gv-search">
                            <input
                                v-model="search"
                                class="gv-search__input"
                                placeholder="Поиск..."
                            />
                        </div>
                        <button class="gv-btn-add" @click="triggerImport">+ Добавить ROM</button>
                        <input
                            ref="fileInput"
                            type="file"
                            multiple
                            class="gv-file-hidden"
                            accept=".nes,.md,.gen,.smd,.sms,.gg,.gb,.gbc,.gba,.sfc,.smc,.n64,.z64,.v64,.bin,.iso,.cue,.pbp,.chd"
                            @change="onFileInput"
                        />
                    </div>
                </div>

                <!-- Platform filters -->
                <div class="gv-filters">
                    <button
                        class="gv-pill"
                        :class="{ active: !platformFilter }"
                        @click="platformFilter = null"
                    >
                        Все ({{ games.length }})
                    </button>
                    <button
                        v-for="p in availablePlatforms"
                        :key="p.id"
                        class="gv-pill"
                        :class="{ active: platformFilter === p.id }"
                        :style="
                            platformFilter === p.id
                                ? { background: p.color, borderColor: p.color, color: '#fff' }
                                : { borderColor: p.color + '66', color: p.color }
                        "
                        @click="platformFilter = p.id"
                    >
                        {{ p.emoji }} {{ p.short }}
                        <span class="gv-pill__count">{{ platformCounts[p.id] }}</span>
                    </button>
                </div>

                <!-- Games grid -->
                <div v-if="filteredGames.length > 0" class="gv-grid">
                    <div
                        v-for="game in filteredGames"
                        :key="game.id"
                        class="gv-card"
                        :style="{ '--pc': getPlatform(game.platformId).color }"
                        :title="game.name"
                        @click="launchGame(game)"
                    >
                        <div class="gv-card__cover">
                            <span class="gv-card__letter">{{ game.name[0].toUpperCase() }}</span>
                            <span class="gv-card__platform-emoji">{{
                                getPlatform(game.platformId).emoji
                            }}</span>
                            <div v-if="game.playCount" class="gv-card__played">
                                ▶ {{ game.playCount }}
                            </div>
                        </div>
                        <div class="gv-card__body">
                            <div class="gv-card__name">{{ game.name }}</div>
                            <div class="gv-card__meta">{{ getPlatform(game.platformId).short }}</div>
                        </div>
                        <button
                            class="gv-card__del"
                            title="Удалить"
                            @click.stop="confirmDelete(game)"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else class="gv-empty">
                    <div class="gv-empty__icon">🕹</div>
                    <div class="gv-empty__title">
                        {{ search || platformFilter ? 'Ничего не найдено' : 'Библиотека пуста' }}
                    </div>
                    <div class="gv-empty__sub">
                        {{
                            search || platformFilter
                                ? 'Попробуйте изменить фильтры'
                                : 'Перетащите ROM файлы сюда или нажмите кнопку выше'
                        }}
                    </div>
                    <div v-if="!search && !platformFilter" class="gv-empty__formats">
                        .nes .md .gen .snes .gb .gbc .gba .sms .gg .n64 ...
                    </div>
                </div>

                <!-- Drag overlay -->
                <transition name="fade">
                    <div v-if="isDragging" class="gv-drag-overlay">
                        <div class="gv-drag-overlay__box">
                            <div class="gv-drag-overlay__icon">📦</div>
                            <div class="gv-drag-overlay__text">Отпустите ROM файлы</div>
                            <div class="gv-drag-overlay__sub">
                                Поддерживаются: NES, Sega, SNES, GB, GBA, PS1 и другие
                            </div>
                        </div>
                    </div>
                </transition>

                <!-- Import progress -->
                <transition name="slide-up">
                    <div v-if="isImporting" class="gv-progress">
                        <div
                            class="gv-progress__bar"
                            :style="{ width: importPct + '%' }"
                        ></div>
                        <span class="gv-progress__label">
                            Импорт {{ importDone }}/{{ importTotal }} ({{ importPct }}%)
                        </span>
                    </div>
                </transition>

                <!-- Delete confirm -->
                <transition name="fade">
                    <div v-if="gameToDelete" class="gv-confirm">
                        <div class="gv-confirm__box">
                            <div class="gv-confirm__title">Удалить игру?</div>
                            <div class="gv-confirm__name">{{ gameToDelete.name }}</div>
                            <div class="gv-confirm__actions">
                                <button class="gv-confirm__cancel" @click="gameToDelete = null">
                                    Отмена
                                </button>
                                <button class="gv-confirm__ok" @click="doDelete">Удалить</button>
                            </div>
                        </div>
                    </div>
                </transition>
            </template>

            <!-- ========== EMULATOR VIEW ========== -->
            <template v-if="view === 'emulator'">
                <div class="gv-emu-bar">
                    <button class="gv-emu-back" @click="backToLibrary">← Библиотека</button>
                    <span v-if="currentGame" class="gv-emu-title">{{ currentGame.name }}</span>
                    <span v-if="currentGame" class="gv-emu-platform">
                        {{ getPlatform(currentGame.platformId).emoji }}
                        {{ getPlatform(currentGame.platformId).name }}
                    </span>
                    <div class="gv-emu-hint">F1 — меню эмулятора &nbsp;|&nbsp; F9 — сохранить &nbsp;|&nbsp; F10 — загрузить</div>
                </div>
                <div class="gv-emu-area">
                    <iframe
                        v-if="emulatorSrcdoc"
                        ref="emulatorFrame"
                        :srcdoc="emulatorSrcdoc"
                        class="gv-emu-frame"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                        allowfullscreen
                        allow="fullscreen; gamepad"
                    ></iframe>
                    <div v-else class="gv-emu-loading">
                        <div class="gv-emu-loading__spinner"></div>
                        <div>Загрузка эмулятора...</div>
                    </div>
                </div>
            </template>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { PLATFORMS, EXT_TO_PLATFORM, PLATFORM_MAP, UNKNOWN_PLATFORM } from './constants';
import { getAllGames, addGame, deleteGame } from './db';

export default {
    extends: Elem,

    meta,

    static: {},

    data: () => ({
        ...ElemInstanceTypeDescriptor,

        view: 'library',
        games: [],
        search: '',
        platformFilter: null,
        isDragging: false,
        isImporting: false,
        importDone: 0,
        importTotal: 0,

        currentGame: null,
        emulatorSrcdoc: null,
        _romObjectUrl: null,

        gameToDelete: null
    }),

    computed: {
        filteredGames() {
            const q = this.search.toLowerCase();
            return this.games.filter((g) => {
                const matchSearch = !q || g.name.toLowerCase().includes(q);
                const matchPlatform = !this.platformFilter || g.platformId === this.platformFilter;
                return matchSearch && matchPlatform;
            });
        },
        availablePlatforms() {
            const ids = new Set(this.games.map((g) => g.platformId));
            return PLATFORMS.filter((p) => ids.has(p.id));
        },
        platformCounts() {
            return this.games.reduce((acc, g) => {
                acc[g.platformId] = (acc[g.platformId] || 0) + 1;
                return acc;
            }, {});
        },
        importPct() {
            return this.importTotal > 0
                ? Math.round((this.importDone / this.importTotal) * 100)
                : 0;
        }
    },

    async mounted() {
        await this.loadGames();
    },

    beforeDestroy() {
        this._cleanupEmulator();
    },

    methods: {
        async loadGames() {
            this.games = await getAllGames();
        },

        getPlatform(id) {
            return PLATFORM_MAP[id] || UNKNOWN_PLATFORM;
        },

        triggerImport() {
            this.$refs.fileInput.value = '';
            this.$refs.fileInput.click();
        },

        onFileInput(e) {
            this.handleFiles(Array.from(e.target.files));
        },

        onDrop(e) {
            this.isDragging = false;
            this.handleFiles(Array.from(e.dataTransfer.files));
        },

        async handleFiles(files) {
            const valid = files.filter((f) => {
                const ext = '.' + f.name.split('.').pop().toLowerCase();
                return !!EXT_TO_PLATFORM[ext];
            });

            if (!valid.length) return;

            this.isImporting = true;
            this.importTotal = valid.length;
            this.importDone = 0;

            for (const file of valid) {
                const game = await this.processFile(file);
                if (game) {
                    await addGame(game);
                    this.importDone++;
                }
            }

            this.isImporting = false;
            await this.loadGames();
        },

        async processFile(file) {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            const platform = EXT_TO_PLATFORM[ext];
            if (!platform) return null;

            const romData = await file.arrayBuffer();
            const name = file.name.replace(/\.[^/.]+$/, '');

            return {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                name,
                platformId: platform.id,
                romData,
                addedAt: new Date().toISOString(),
                lastPlayed: null,
                playCount: 0
            };
        },

        async launchGame(game) {
            this._cleanupEmulator();

            game.lastPlayed = new Date().toISOString();
            game.playCount = (game.playCount || 0) + 1;
            await addGame(game);

            const romBlob = new Blob([game.romData]);
            const romUrl = URL.createObjectURL(romBlob);
            this._romObjectUrl = romUrl;

            const ejsPath = this.props.emulatorJsPath;

            this.emulatorSrcdoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; width: 100vw; height: 100vh; }
    #game { width: 100%; height: 100%; }
  </style>
  <script>
    var EJS_player = '#game';
    var EJS_core = '${game.platformId}';
    var EJS_gameUrl = '${romUrl}';
    var EJS_pathtodata = '${ejsPath}';
    var EJS_startOnLoaded = true;
    var EJS_color = '${this.props.accentColor}';
    var EJS_backgroundColor = '#000000';
    var EJS_AdContent = false;
    var EJS_Buttons = {
      playPause: true,
      restart: true,
      mute: true,
      settings: true,
      fullscreen: true,
      saveState: true,
      loadState: true,
      screenRecord: false,
      gamepad: true,
      cheat: false,
      volume: true,
      saveSavFiles: true,
      loadSavFiles: true,
      screenshot: true
    };
  <\/script>
</head>
<body>
  <div id="game"></div>
  <script src="${ejsPath}loader.js"><\/script>
</body>
</html>`;

            this.currentGame = game;
            this.view = 'emulator';
        },

        confirmDelete(game) {
            this.gameToDelete = game;
        },

        async doDelete() {
            if (!this.gameToDelete) return;
            await deleteGame(this.gameToDelete.id);
            this.gameToDelete = null;
            await this.loadGames();
        },

        backToLibrary() {
            this._cleanupEmulator();
            this.view = 'library';
            this.currentGame = null;
        },

        _cleanupEmulator() {
            if (this._romObjectUrl) {
                URL.revokeObjectURL(this._romObjectUrl);
                this._romObjectUrl = null;
            }
            this.emulatorSrcdoc = null;
        }
    }
};
</script>

<style lang="pcss" scoped src="./style.pcss"></style>
