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
                class="acc-item">
                <div class="acc-item__hd" @click="toggleItem(index)">
                    <i class="mdi mdi-drag acc-item__drag" />
                    <span class="acc-item__num">{{ index + 1 }}</span>
                    <span class="acc-item__title">{{ item.title || 'Без названия' }}</span>
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

            <!-- ── Поведение ────────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 12px">
                <i class="mdi mdi-cog-outline" />
                Поведение
            </div>

            <ui-switch prop="multipleOpen">
                Разрешить открывать несколько
            </ui-switch>

            <ui-input prop="defaultOpenIndex" type="number" placeholder="0 = первый, -1 = ни один">
                Открыт по умолчанию (индекс)
            </ui-input>

            <!-- ── Иконка ───────────────────────────────────────────── -->
            <div class="section-label" style="margin-top: 12px">
                <i class="mdi mdi-chevron-down" />
                Иконка
            </div>

            <ui-select prop="iconType" :options="iconTypeOptions">Тип иконки</ui-select>
            <ui-select prop="iconPosition" :options="iconPositionOptions">Расположение</ui-select>

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
        openItems: {},
        iconTypeOptions: [
            { label: 'Шеврон (стрелка)', value: 'chevron' },
            { label: 'Плюс / Минус', value: 'plus' },
            { label: 'Стрелка вверх/вниз', value: 'arrow' }
        ],
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
}
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
