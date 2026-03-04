<template>
    <w-panel>
        <ui-container>

            <!-- ── Вкладки ──────────────────────────────────────────── -->
            <div class="section-label">
                <i class="mdi mdi-tab" />
                Вкладки
                <span class="badge">{{ props.tabs.length }}</span>
            </div>

            <div
                v-for="(tab, index) in props.tabs"
                :key="index"
                class="tab-item"
                :class="{
                    'tab-item--drag-over': dragOverIndex === index,
                    'tab-item--sub': (tab.level || 0) === 1,
                    'tab-item--disabled': tab.enabled === false
                }"
                draggable="true"
                @dragstart="onTabDragStart(index, $event)"
                @dragover.prevent="onTabDragOver(index)"
                @drop.prevent="onTabDrop(index)"
                @dragend="onTabDragEnd">
                <div class="tab-item__hd" @click="toggleTab(index)">
                    <i class="mdi mdi-drag tab-item__drag" @mousedown.stop />
                    <span class="tab-item__num">{{ index + 1 }}</span>
                    <i v-if="tab.icon" :class="tab.icon" class="tab-item__icon-preview" />
                    <span class="tab-item__label">{{ tab.label || 'Без названия' }}</span>
                    <button
                        class="star-btn"
                        :class="{ 'star-btn--active': (props.activeTab || 0) === index }"
                        :title="(props.activeTab || 0) === index ? 'Открыта по умолчанию' : 'Сделать открытой по умолчанию'"
                        @click.stop="setActiveTab(index)">
                        <i class="mdi" :class="(props.activeTab || 0) === index ? 'mdi-star' : 'mdi-star-outline'" />
                    </button>
                    <button
                        class="icon-action-btn"
                        :class="{ 'icon-action-btn--off': tab.enabled === false }"
                        :title="tab.enabled !== false ? 'Скрыть вкладку' : 'Показать вкладку'"
                        @click.stop="toggleEnabled(index)">
                        <i class="mdi" :class="tab.enabled !== false ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" />
                    </button>
                    <button
                        class="icon-action-btn"
                        :class="{ 'icon-action-btn--active': (tab.level || 0) === 1 }"
                        :title="(tab.level || 0) === 0 ? 'Сделать вложенной' : 'Сделать корневой'"
                        @click.stop="toggleLevel(index)">
                        <i class="mdi" :class="(tab.level || 0) === 1 ? 'mdi-subdirectory-arrow-right' : 'mdi-format-indent-increase'" />
                    </button>
                    <button class="del-btn" @click.stop="removeTab(index)">
                        <i class="mdi mdi-close" />
                    </button>
                    <i class="mdi tab-item__chev" :class="openTabs[index] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="openTabs[index]" class="tab-item__body">
                    <ui-input v-model="tab.label" @input="save">Название вкладки</ui-input>

                    <!-- MDI icon picker -->
                    <div class="form-label">Иконка вкладки</div>
                    <div class="icon-row">
                        <button
                            class="icon-preview-btn"
                            :title="tab.icon || 'Нет иконки'"
                            @click.stop="toggleIconPicker(index)">
                            <i v-if="tab.icon" :class="tab.icon" />
                            <i v-else class="mdi mdi-image-outline" style="opacity:.4" />
                        </button>
                        <div class="icon-input-wrap">
                            <span class="icon-prefix">mdi-</span>
                            <input
                                class="icon-name-input"
                                :value="iconNameOnly(tab.icon)"
                                placeholder="home"
                                @input="onTabIconInput(index, $event)"
                                @focus="iconPickerOpenFor = index" />
                        </div>
                        <button v-if="tab.icon" class="icon-clear-btn" title="Убрать иконку" @click.stop="clearTabIcon(index)">
                            <i class="mdi mdi-close" />
                        </button>
                    </div>

                    <!-- Quick icon grid -->
                    <div v-if="iconPickerOpenFor === index" class="icon-picker">
                        <div class="icon-picker__hd">
                            <span>Быстрый выбор</span>
                            <button class="icon-picker__close" @click.stop="iconPickerOpenFor = null">
                                <i class="mdi mdi-close" />
                            </button>
                        </div>
                        <div class="icon-picker__grid">
                            <button
                                v-for="ico in quickIcons"
                                :key="ico"
                                class="icon-picker__btn"
                                :class="{ 'icon-picker__btn--active': tab.icon === `mdi mdi-${ico}` }"
                                :title="ico"
                                @click.stop="pickTabIcon(index, ico)">
                                <i :class="`mdi mdi-${ico}`" />
                            </button>
                        </div>
                    </div>

                    <div class="form-label" style="margin-top:8px">Содержимое</div>
                    <textarea
                        v-model="tab.content"
                        class="content-textarea"
                        placeholder="Текст или HTML"
                        @input="save" />
                </div>
            </div>

            <ui-button type="ghost" @click="addTab">+ Добавить вкладку</ui-button>

            <!-- ── Вид и расположение ───────────────────────────────── -->
            <div class="section-label" style="margin-top: 12px">
                <i class="mdi mdi-view-dashboard-outline" />
                Вид и расположение
            </div>

            <ui-select prop="tabPosition" :options="positionOptions">
                Расположение вкладок
            </ui-select>

            <ui-select prop="indicatorType" :options="indicatorOptions">
                Тип индикатора
            </ui-select>

            <ui-switch prop="showBorder">Показывать рамку содержимого</ui-switch>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

const QUICK_ICONS = [
    'home', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
    'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
    'plus', 'minus', 'close', 'check', 'pencil', 'delete-outline',
    'download', 'upload', 'share-variant', 'send', 'refresh', 'magnify',
    'star-outline', 'heart-outline', 'bookmark-outline', 'bell-outline',
    'eye-outline', 'eye-off-outline', 'lock-outline', 'account-circle-outline',
    'cog-outline', 'filter-variant', 'menu', 'dots-vertical',
    'email-outline', 'phone-outline', 'chat-outline',
    'play', 'pause', 'stop', 'skip-next', 'volume-high',
    'information-outline', 'alert-circle-outline', 'help-circle-outline',
    'check-circle-outline', 'close-circle-outline',
    'link-variant', 'map-marker-outline', 'calendar-outline',
    'clock-outline', 'lightning-bolt', 'cart-outline',
    'file-document-outline', 'image-outline', 'camera-outline', 'qrcode',
    'tab', 'tab-unselected', 'text', 'view-dashboard-outline', 'view-list-outline',
    'view-grid-outline', 'account', 'settings', 'tune', 'format-list-bulleted'
];

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'cog' },
    data: () => ({
        ...PanelInstanceTypeDescriptor,
        openTabs: {},
        iconPickerOpenFor: null,
        dragIndex: null,
        dragOverIndex: null,
        quickIcons: QUICK_ICONS,
        positionOptions: [
            { label: 'Сверху', value: 'top' },
            { label: 'Снизу', value: 'bottom' },
            { label: 'Слева', value: 'left' }
        ],
        indicatorOptions: [
            { label: 'Подчёркивание', value: 'underline' },
            { label: 'Таблетка (фон)', value: 'pill' },
            { label: 'Рамка', value: 'border' }
        ]
    }),
    methods: {
        toggleTab(index) {
            this.openTabs = { ...this.openTabs, [index]: !this.openTabs[index] };
        },
        addTab() {
            this.props.tabs.push(this.descriptor.props.tabs.factory());
            this.save();
            const idx = this.props.tabs.length - 1;
            this.openTabs = { ...this.openTabs, [idx]: true };
        },
        removeTab(index) {
            this.props.tabs.splice(index, 1);
            if (this.iconPickerOpenFor === index) this.iconPickerOpenFor = null;
            this.save();
        },
        save() {
            this.propChanged('tabs');
        },
        setActiveTab(idx) {
            this.props.activeTab = idx;
            this.propChanged('activeTab');
        },
        toggleEnabled(index) {
            this.props.tabs[index].enabled = this.props.tabs[index].enabled !== false ? false : true;
            this.save();
        },
        toggleLevel(index) {
            const current = this.props.tabs[index].level || 0;
            this.props.tabs[index].level = current === 0 ? 1 : 0;
            this.save();
        },

        // ── Drag and drop ────────────────────────────────────────────
        onTabDragStart(index, e) {
            this.dragIndex = index;
            e.dataTransfer.effectAllowed = 'move';
        },
        onTabDragOver(index) {
            this.dragOverIndex = index;
        },
        onTabDrop(index) {
            if (this.dragIndex === null || this.dragIndex === index) {
                this.dragIndex = null;
                this.dragOverIndex = null;
                return;
            }
            const tabs = [...this.props.tabs];
            const [moved] = tabs.splice(this.dragIndex, 1);
            tabs.splice(index, 0, moved);
            this.props.tabs = tabs;
            this.propChanged('tabs');
            // adjust activeTab after reorder
            const active = this.props.activeTab || 0;
            if (active === this.dragIndex) {
                this.props.activeTab = index;
                this.propChanged('activeTab');
            } else if (active > this.dragIndex && active <= index) {
                this.props.activeTab = active - 1;
                this.propChanged('activeTab');
            } else if (active < this.dragIndex && active >= index) {
                this.props.activeTab = active + 1;
                this.propChanged('activeTab');
            }
            this.dragIndex = null;
            this.dragOverIndex = null;
        },
        onTabDragEnd() {
            this.dragIndex = null;
            this.dragOverIndex = null;
        },

        // ── Icon picker ──────────────────────────────────────────────
        iconNameOnly(cls) {
            if (!cls) return '';
            return cls.replace(/^mdi\s+mdi-/, '').replace(/^mdi-/, '');
        },
        toggleIconPicker(index) {
            this.iconPickerOpenFor = this.iconPickerOpenFor === index ? null : index;
        },
        onTabIconInput(index, e) {
            const raw = (e.target.value || '').trim();
            const name = raw.replace(/^mdi\s+mdi-/, '').replace(/^mdi-/, '');
            this.props.tabs[index].icon = name ? `mdi mdi-${name}` : '';
            this.save();
        },
        pickTabIcon(index, ico) {
            this.props.tabs[index].icon = `mdi mdi-${ico}`;
            this.save();
            this.iconPickerOpenFor = null;
        },
        clearTabIcon(index) {
            this.props.tabs[index].icon = '';
            this.save();
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
.tab-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 5px;
    overflow: hidden;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
}
.tab-item--drag-over { border-color: #4f6aff; box-shadow: 0 0 0 2px rgba(79,106,255,0.2); }
.tab-item__drag { color: #cbd5e1; font-size: 15px; cursor: grab; flex-shrink: 0; }
.tab-item__hd {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    cursor: pointer;
    user-select: none;
    transition: background 0.1s;
}
.tab-item__hd:hover { background: #f8fafc; }
.tab-item__num {
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
.tab-item__icon-preview { font-size: 14px; color: #4f6aff; flex-shrink: 0; }
.tab-item__label {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tab-item__chev { color: #94a3b8; font-size: 16px; flex-shrink: 0; }
.tab-item__body {
    padding: 6px 10px 10px;
    border-top: 1px solid #f0f4f8;
    background: #fafcff;
}
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

/* ── Star button (default tab marker) ────────────────────────── */
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

/* ── Generic icon action button ─────────────────────────────────── */
.icon-action-btn {
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
.icon-action-btn:hover { border-color: #a5b4fc; color: #4f6aff; background: #f0f4ff; }
.icon-action-btn--off { color: #cbd5e1; border-color: #f1f5f9; }
.icon-action-btn--active { border-color: #4f6aff; color: #4f6aff; background: #eff2ff; }

/* ── Hierarchy visual indentation ────────────────────────────────── */
.tab-item--sub { margin-left: 20px; border-color: #c7d2fe; }
.tab-item--sub .tab-item__num { background: #e0e7ff; color: #4f6aff; }
.tab-item--disabled { opacity: 0.55; }
.tab-item--disabled .tab-item__label { text-decoration: line-through; color: #94a3b8; }
</style>
