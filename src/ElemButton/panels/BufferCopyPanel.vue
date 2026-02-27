<template>
    <w-panel>
        <ui-container>

            <!-- ── Что копировать ──────────────────────────────────────────── -->
            <div class="copy-label">При нажатии скопировать:</div>
            <div class="copy-modes">
                <button
                    v-for="m in copyModes"
                    :key="m.value"
                    class="copy-mode"
                    :class="{ 'copy-mode--active': copyMode === m.value }"
                    @click="copyMode = m.value">
                    <i :class="['mdi', m.icon]" />
                    <span>{{ m.label }}</span>
                </button>
            </div>

            <!-- Подсказка: ссылка со состоянием -->
            <div v-if="copyMode === 'url'" class="copy-hint">
                <div class="copy-hint__row">
                    <i class="mdi mdi-share-variant copy-hint__ico" />
                    <strong>Поделиться состоянием страницы</strong>
                </div>
                <p class="copy-hint__text">
                    Кнопка сохраняет в буфер ссылку, по которой страница
                    откроется <em>точно такой же</em> — с теми же
                    выбранными значениями (даты, категории, параметры).
                </p>
                <div class="copy-hint__example">
                    <i class="mdi mdi-link copy-hint__ex-ico" />
                    <span class="copy-hint__ex-url">/page<span class="copy-hint__ex-qs">?city=Москва&amp;from=2024-01</span></span>
                </div>
            </div>

            <!-- Поле: свой текст -->
            <ui-textarea
                v-if="copyMode === 'text'"
                prop="textToCopy"
                placeholder="Введите текст для копирования…">
                Текст
            </ui-textarea>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from 'goodt-wcore';

export default {
    extends: Panel,
    meta: { name: 'Копирование в буфер', icon: 'content-copy' },
    data: () => ({
        copyModes: [
            { value: '',     label: 'Ничего',    icon: 'mdi-minus-circle-outline' },
            { value: 'url',  label: 'Снимок',    icon: 'mdi-share-variant' },
            { value: 'text', label: 'Свой текст', icon: 'mdi-text-box-outline' }
        ]
    }),
    computed: {
        copyMode: {
            get() {
                if (this.props.isCopyStore)    return 'url';
                if (this.props.shouldCopyText) return 'text';
                return '';
            },
            set(val) {
                this.props.isCopyStore    = val === 'url';
                this.props.shouldCopyText = val === 'text';
                this.propChanged('isCopyStore');
                this.propChanged('shouldCopyText');
            }
        }
    }
};
</script>

<style scoped>
.copy-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
}

/* ── Три карточки выбора режима ─────────────────────────────────── */
.copy-modes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 10px;
}

.copy-mode {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 6px 9px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #fafbfc;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, box-shadow 0.12s;
    user-select: none;
}
.copy-mode .mdi {
    font-size: 20px;
    color: #94a3b8;
    transition: color 0.12s;
    line-height: 1;
}
.copy-mode span {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    line-height: 1;
    transition: color 0.12s;
}
.copy-mode:hover {
    border-color: #c0cfe0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.copy-mode--active {
    border-color: #4f6aff;
    background: #eff2ff;
    box-shadow: 0 2px 8px rgba(79,106,255,0.15);
}
.copy-mode--active .mdi { color: #4f6aff; }
.copy-mode--active span { color: #3730a3; }

/* ── Подсказка для режима «ссылка» ──────────────────────────────── */
.copy-hint {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    font-size: 12px;
    color: #1e3a8a;
    line-height: 1.5;
}
.copy-hint__row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    font-size: 12px;
    color: #1e40af;
}
.copy-hint__ico { font-size: 15px; color: #3b82f6; }
.copy-hint__text { margin: 0; color: #1e40af; }
.copy-hint__text em { font-style: normal; font-weight: 600; }

/* пример URL */
.copy-hint__example {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    background: #dbeafe;
    border-radius: 6px;
    font-family: monospace;
    font-size: 11px;
    color: #1d4ed8;
    overflow: hidden;
}
.copy-hint__ex-ico { font-size: 13px; color: #3b82f6; flex-shrink: 0; }
.copy-hint__ex-url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.copy-hint__ex-qs  { color: #6366f1; }
</style>
