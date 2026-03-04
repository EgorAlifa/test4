<template>
    <w-panel>
        <ui-container>

            <!-- ── Элементы аккордеона ──────────────────────────────── -->
            <div class="section-label">
                <i class="mdi mdi-format-list-bulleted" />
                Элементы
                <span class="badge">{{ props.items.length }}</span>
            </div>

            <div
                v-for="(item, index) in props.items"
                :key="index"
                class="acc-item"
                :class="{ 'acc-item--drag-over': dragOverIndex === index }"
                draggable="true"
                @dragstart="onItemDragStart(index, $event)"
                @dragover.prevent="onItemDragOver(index)"
                @drop.prevent="onItemDrop(index)"
                @dragend="onItemDragEnd">
                <div class="acc-item__hd" @click="toggleItem(index)">
                    <i class="mdi mdi-drag acc-item__drag" @mousedown.stop />
                    <span class="acc-item__num">{{ index + 1 }}</span>
                    <span class="acc-item__title">{{ item.title || 'Без названия' }}</span>
                    <button
                        class="star-btn"
                        :class="{ 'star-btn--active': props.defaultOpenIndex === index }"
                        :title="props.defaultOpenIndex === index ? 'Убрать открытый по умолчанию' : 'Открывать по умолчанию'"
                        @click.stop="toggleDefaultOpen(index)">
                        <i class="mdi" :class="props.defaultOpenIndex === index ? 'mdi-star' : 'mdi-star-outline'" />
                    </button>
                    <button class="del-btn" @click.stop="removeItem(index)">
                        <i class="mdi mdi-close" />
                    </button>
                    <i class="mdi acc-item__chev" :class="openItems[index] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="openItems[index]" class="acc-item__body">
                    <ui-input v-model="item.title" @input="save">Заголовок</ui-input>
                    <div class="form-label">Содержимое</div>
                    <textarea
                        v-model="item.content"
                        class="content-textarea"
                        placeholder="Текст или HTML"
                        @input="save" />
                </div>
            </div>

            <ui-button type="ghost" @click="addItem">+ Добавить элемент</ui-button>

            <div class="hint-row">
                <i class="mdi mdi-star" style="color:#f59e0b;font-size:12px" />
                <span>— элемент, открытый по умолчанию</span>
            </div>

            <div class="divider" />

            <ui-switch prop="multipleOpen">Несколько одновременно</ui-switch>

            <!-- ── Иконка ───────────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 12px">
                <i class="mdi mdi-chevron-down" />
                Иконка
            </div>

            <ui-select prop="iconPosition" :options="iconPositionOptions">Расположение</ui-select>

            <!-- Иконка: закрыто -->
            <div class="form-label" style="margin-top:8px">Иконка (закрыто)</div>
            <div class="icon-row">
                <button
                    class="icon-preview-btn"
                    :title="props.iconClosed || 'Нет иконки'"
                    @click.stop="iconPickerOpen = iconPickerOpen === 'closed' ? null : 'closed'">
                    <i v-if="props.iconClosed" :class="props.iconClosed" />
                    <i v-else class="mdi mdi-image-outline" style="opacity:.4" />
                </button>
                <div class="icon-input-wrap">
                    <span class="icon-prefix">mdi-</span>
                    <input
                        class="icon-name-input"
                        :value="iconNameOnly(props.iconClosed)"
                        placeholder="chevron-down"
                        @input="onIconInput('closed', $event)"
                        @focus="iconPickerOpen = 'closed'" />
                </div>
                <button v-if="props.iconClosed" class="icon-clear-btn" @click.stop="clearIcon('closed')">
                    <i class="mdi mdi-close" />
                </button>
            </div>
            <div v-if="iconPickerOpen === 'closed'" class="icon-picker">
                <div class="icon-picker__hd">
                    <span>Выбор иконки</span>
                    <button class="icon-picker__close" @click.stop="iconPickerOpen = null">
                        <i class="mdi mdi-close" />
                    </button>
                </div>
                <div class="icon-picker__grid">
                    <button
                        v-for="ico in quickIcons"
                        :key="ico"
                        class="icon-picker__btn"
                        :class="{ 'icon-picker__btn--active': props.iconClosed === `mdi mdi-${ico}` }"
                        :title="ico"
                        @click.stop="pickIcon('closed', ico)">
                        <i :class="`mdi mdi-${ico}`" />
                    </button>
                </div>
            </div>

            <!-- Иконка: открыто -->
            <div class="form-label" style="margin-top:8px">Иконка (открыто)</div>
            <div class="icon-row">
                <button
                    class="icon-preview-btn"
                    :title="props.iconOpen || 'Нет иконки'"
                    @click.stop="iconPickerOpen = iconPickerOpen === 'open' ? null : 'open'">
                    <i v-if="props.iconOpen" :class="props.iconOpen" />
                    <i v-else class="mdi mdi-image-outline" style="opacity:.4" />
                </button>
                <div class="icon-input-wrap">
                    <span class="icon-prefix">mdi-</span>
                    <input
                        class="icon-name-input"
                        :value="iconNameOnly(props.iconOpen)"
                        placeholder="chevron-up"
                        @input="onIconInput('open', $event)"
                        @focus="iconPickerOpen = 'open'" />
                </div>
                <button v-if="props.iconOpen" class="icon-clear-btn" @click.stop="clearIcon('open')">
                    <i class="mdi mdi-close" />
                </button>
            </div>
            <div v-if="iconPickerOpen === 'open'" class="icon-picker">
                <div class="icon-picker__hd">
                    <span>Выбор иконки</span>
                    <button class="icon-picker__close" @click.stop="iconPickerOpen = null">
                        <i class="mdi mdi-close" />
                    </button>
                </div>
                <div class="icon-picker__grid">
                    <button
                        v-for="ico in quickIcons"
                        :key="ico"
                        class="icon-picker__btn"
                        :class="{ 'icon-picker__btn--active': props.iconOpen === `mdi mdi-${ico}` }"
                        :title="ico"
                        @click.stop="pickIcon('open', ico)">
                        <i :class="`mdi mdi-${ico}`" />
                    </button>
                </div>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

const QUICK_ICONS = [
    'chevron-down', 'chevron-up', 'chevron-right', 'chevron-left',
    'arrow-down', 'arrow-up', 'arrow-right', 'arrow-left',
    'plus', 'minus', 'close', 'check',
    'caret-down', 'caret-up', 'menu-down', 'menu-up',
    'triangle-down', 'triangle-up', 'triangle-small-down', 'triangle-small-up',
    'unfold-more-horizontal', 'unfold-less-horizontal',
    'expand-all', 'collapse-all',
    'home', 'magnify', 'cog-outline', 'pencil', 'delete-outline',
    'star-outline', 'heart-outline', 'bell-outline', 'bookmark-outline',
    'information-outline', 'alert-circle-outline', 'help-circle-outline',
    'check-circle-outline', 'close-circle-outline',
    'account-circle-outline', 'lock-outline', 'eye-outline', 'eye-off-outline',
    'filter-variant', 'dots-vertical', 'menu', 'view-list-outline',
    'link-variant', 'map-marker-outline', 'calendar-outline', 'clock-outline',
    'file-document-outline', 'image-outline', 'camera-outline', 'qrcode'
];

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'cog' },
    data: () => ({
        ...PanelInstanceTypeDescriptor,
        openItems: {},
        iconPickerOpen: null,  // null | 'closed' | 'open'
        dragIndex: null,
        dragOverIndex: null,
        quickIcons: QUICK_ICONS,
        iconPositionOptions: [
            { label: 'Справа', value: 'right' },
            { label: 'Слева', value: 'left' }
        ]
    }),
    methods: {
        toggleItem(index) {
            this.openItems = { ...this.openItems, [index]: !this.openItems[index] };
        },
        addItem() {
            this.props.items.push(this.descriptor.props.items.factory());
            this.save();
            const idx = this.props.items.length - 1;
            this.openItems = { ...this.openItems, [idx]: true };
        },
        removeItem(index) {
            this.props.items.splice(index, 1);
            this.save();
        },
        save() {
            this.propChanged('items');
        },
        toggleDefaultOpen(index) {
            const next = this.props.defaultOpenIndex === index ? -1 : index;
            this.props.defaultOpenIndex = next;
            this.propChanged('defaultOpenIndex');
        },

        // ── Drag and drop ────────────────────────────────────────────
        onItemDragStart(index, e) {
            this.dragIndex = index;
            e.dataTransfer.effectAllowed = 'move';
        },
        onItemDragOver(index) {
            this.dragOverIndex = index;
        },
        onItemDrop(index) {
            if (this.dragIndex === null || this.dragIndex === index) {
                this.dragIndex = null;
                this.dragOverIndex = null;
                return;
            }
            const items = [...this.props.items];
            const [moved] = items.splice(this.dragIndex, 1);
            items.splice(index, 0, moved);
            this.props.items = items;
            this.propChanged('items');
            // adjust defaultOpenIndex after reorder
            const def = this.props.defaultOpenIndex;
            if (def >= 0) {
                if (def === this.dragIndex) {
                    this.props.defaultOpenIndex = index;
                } else if (def > this.dragIndex && def <= index) {
                    this.props.defaultOpenIndex = def - 1;
                } else if (def < this.dragIndex && def >= index) {
                    this.props.defaultOpenIndex = def + 1;
                }
                this.propChanged('defaultOpenIndex');
            }
            this.dragIndex = null;
            this.dragOverIndex = null;
        },
        onItemDragEnd() {
            this.dragIndex = null;
            this.dragOverIndex = null;
        },

        // ── Icon picker ──────────────────────────────────────────────
        iconNameOnly(cls) {
            if (!cls) return '';
            return cls.replace(/^mdi\s+mdi-/, '').replace(/^mdi-/, '');
        },
        onIconInput(target, e) {
            const raw = (e.target.value || '').trim();
            const name = raw.replace(/^mdi\s+mdi-/, '').replace(/^mdi-/, '');
            const full = name ? `mdi mdi-${name}` : '';
            const prop = target === 'closed' ? 'iconClosed' : 'iconOpen';
            this.props[prop] = full;
            this.propChanged(prop);
        },
        pickIcon(target, ico) {
            const prop = target === 'closed' ? 'iconClosed' : 'iconOpen';
            this.props[prop] = `mdi mdi-${ico}`;
            this.propChanged(prop);
            this.iconPickerOpen = null;
        },
        clearIcon(target) {
            const prop = target === 'closed' ? 'iconClosed' : 'iconOpen';
            this.props[prop] = '';
            this.propChanged(prop);
        }
    }
};
</script>

<style scoped>
.section-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f1f5f9;
}
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #e0e7ff;
    color: #4f6aff;
    border-radius: 10px;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 700;
    margin-left: 4px;
}

/* ── Accordion item editor ──────────────────────────────────── */
.acc-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 5px;
    overflow: hidden;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
}
.acc-item--drag-over { border-color: #4f6aff; box-shadow: 0 0 0 2px rgba(79,106,255,0.2); }
.acc-item__hd {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    cursor: pointer;
    user-select: none;
    transition: background 0.1s;
}
.acc-item__hd:hover { background: #f8fafc; }
.acc-item__drag { color: #cbd5e1; font-size: 15px; cursor: grab; }
.acc-item__num {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    flex-shrink: 0;
}
.acc-item__title {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.acc-item__chev { color: #94a3b8; font-size: 16px; flex-shrink: 0; }
.acc-item__body {
    padding: 6px 10px 10px;
    border-top: 1px solid #f0f4f8;
    background: #fafcff;
}

.star-btn {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    cursor: pointer;
    color: #94a3b8;
    font-size: 13px;
    padding: 0;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
}
.star-btn:hover { border-color: #fbbf24; color: #f59e0b; background: #fffbeb; }
.star-btn--active { border-color: #f59e0b; color: #f59e0b; background: #fffbeb; }

.del-btn {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    cursor: pointer;
    color: #94a3b8;
    font-size: 12px;
    padding: 0;
    transition: background 0.1s, color 0.1s;
}
.del-btn:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

.form-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-top: 6px;
    margin-bottom: 3px;
}
.content-textarea {
    width: 100%;
    min-height: 80px;
    padding: 7px 9px;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    font-size: 12px;
    font-family: inherit;
    color: #334155;
    background: #fff;
    resize: vertical;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}
.content-textarea:focus { border-color: #4f6aff; }

.hint-row {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #94a3b8;
    margin-top: 5px;
    padding: 0 2px;
}
.divider {
    height: 1px;
    background: #f1f5f9;
    margin: 10px 0;
}

/* ── Icon picker ──────────────────────────────────────── */
.icon-row {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 4px;
}
.icon-preview-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    background: #f8fafc;
    cursor: pointer;
    font-size: 16px;
    color: #4f6aff;
    transition: border-color 0.12s, background 0.12s;
}
.icon-preview-btn:hover { border-color: #a5b4fc; background: #f0f4ff; }
.icon-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    background: #fff;
    overflow: hidden;
    height: 32px;
}
.icon-prefix {
    padding: 0 4px 0 8px;
    font-size: 11px;
    color: #94a3b8;
    font-family: monospace;
    white-space: nowrap;
}
.icon-name-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 12px;
    font-family: monospace;
    color: #334155;
    background: transparent;
    padding: 0 8px 0 0;
    height: 100%;
}
.icon-clear-btn {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #94a3b8;
    font-size: 12px;
    padding: 0;
    transition: color 0.1s;
}
.icon-clear-btn:hover { color: #dc2626; }
.icon-picker {
    border: 1.5px solid #e0e7ff;
    border-radius: 10px;
    background: #fff;
    margin-bottom: 6px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(79,106,255,0.08);
}
.icon-picker__hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: #f5f7ff;
    border-bottom: 1px solid #e0e7ff;
    font-size: 11px;
    font-weight: 600;
    color: #4f6aff;
}
.icon-picker__close {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    font-size: 14px;
    padding: 0;
    display: flex;
    align-items: center;
}
.icon-picker__grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    padding: 6px;
    max-height: 160px;
    overflow-y: auto;
}
.icon-picker__btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid transparent;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    font-size: 15px;
    color: #475569;
    transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.icon-picker__btn:hover { background: #f0f4ff; color: #4f6aff; }
.icon-picker__btn--active { border-color: #4f6aff; background: #eef0ff; color: #4f6aff; }
</style>
