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
                class="tab-item">
                <div class="tab-item__hd" @click="toggleTab(index)">
                    <span class="tab-item__num">{{ index + 1 }}</span>
                    <span class="tab-item__label">{{ tab.label || 'Без названия' }}</span>
                    <button class="del-btn" @click.stop="removeTab(index)">
                        <i class="mdi mdi-close" />
                    </button>
                    <i class="mdi tab-item__chev" :class="openTabs[index] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                </div>
                <div v-if="openTabs[index]" class="tab-item__body">
                    <ui-input v-model="tab.label" @input="save">Название вкладки</ui-input>
                    <ui-input v-model="tab.icon" placeholder="mdi mdi-home" @input="save">
                        Иконка (MDI класс)
                    </ui-input>
                    <div class="form-label">Содержимое</div>
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

            <ui-input prop="activeTab" type="number" placeholder="0">
                Начальная вкладка (индекс)
            </ui-input>

            <ui-switch prop="showBorder">Показывать рамку содержимого</ui-switch>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    meta: { name: 'Настройки', icon: 'cog' },
    data: () => ({
        ...PanelInstanceTypeDescriptor,
        openTabs: {},
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
            this.save();
        },
        save() {
            this.propChanged('tabs');
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
}
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
</style>
