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

            <!-- Исключения переменных -->
            <template v-if="copyMode === 'url'">
                <div class="excl-row">
                    <span class="copy-label" style="margin:0">Исключить переменные из ссылки</span>
                    <button
                        class="excl-toggle"
                        :class="{ 'excl-toggle--on': excludeEnabled }"
                        @click="excludeEnabled = !excludeEnabled">
                        <span class="excl-toggle__thumb" />
                    </button>
                </div>
                <template v-if="excludeEnabled">
                    <div class="copy-hint copy-hint--warn">Переменные из этого списка <em>не попадут</em> в ссылку — получатель сохранит свои значения.</div>
                    <ui-textarea
                        prop="isCopyStoreExcludeVars"
                        placeholder="employee_id, dept_id, …"
                        :rows="2">
                        Переменные (через запятую)
                    </ui-textarea>
                </template>
            </template>

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
            { value: 'url',  label: 'Поделиться', icon: 'mdi-share-variant' },
            { value: 'text', label: 'Свой текст', icon: 'mdi-text-box-outline' }
        ],
        excludeEnabled: false
    }),
    watch: {
        'props.isCopyStoreExcludeVars': {
            immediate: true,
            handler(val) { this.excludeEnabled = !!(val && val.trim()); }
        },
        excludeEnabled(val) {
            if (!val) { this.props.isCopyStoreExcludeVars = ''; this.propChanged('isCopyStoreExcludeVars'); }
        }
    },
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

.copy-hint--warn {
    display: block;
    background: #fffbeb;
    border-color: #fde68a;
    color: #78350f;
}
.copy-hint--warn em { font-style: normal; font-weight: 600; }

/* ── Exclude toggle row ─────────────────────────────────────── */
.excl-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px 0 6px;
}
.excl-toggle {
    position: relative;
    width: 32px;
    height: 18px;
    border-radius: 9px;
    border: none;
    background: #cbd5e1;
    cursor: pointer;
    transition: background 0.18s;
    flex-shrink: 0;
    padding: 0;
}
.excl-toggle--on { background: #4f6aff; }
.excl-toggle__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.18s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18);
}
.excl-toggle--on .excl-toggle__thumb { transform: translateX(14px); }
</style>
