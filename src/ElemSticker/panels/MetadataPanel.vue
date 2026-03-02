<template>
    <w-panel>
        <div class="elemsticker-metadata-panel">
            <!-- Metadata Display -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Отображение метаданных</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Показать метаданные</span>
                    <ui-switch
                        :value="props.showMetadata"
                        @input="handleShowMetadataChange"
                    />
                </div>

                <template v-if="props.showMetadata">
                    <div class="panel-row panel-row--inline">
                        <span class="panel-label">Позиция</span>
                        <ui-select
                            :value="props.metadataPosition"
                            :options="metadataPositionOptions"
                            @input="handleMetadataPositionChange"
                        />
                    </div>

                    <div class="panel-row panel-row--inline">
                        <span class="panel-label">Формат даты</span>
                        <ui-select
                            :value="props.dateFormat"
                            :options="dateFormatOptions"
                            @input="handleDateFormatChange"
                        />
                    </div>
                </template>
            </div>

            <!-- Author -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Автор</span>
                </div>

                <div class="panel-row">
                    <ui-input
                        :value="props.author"
                        placeholder="Введите имя автора"
                        @input="handleAuthorChange"
                    />
                </div>
            </div>

            <!-- Dates -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Даты</span>
                </div>

                <div class="panel-row">
                    <span class="panel-label-block">Создано</span>
                    <ui-input
                        :value="formattedCreatedAt"
                        disabled
                        class="date-input"
                    />
                </div>

                <div class="panel-row">
                    <span class="panel-label-block">Изменено</span>
                    <ui-input
                        :value="formattedModifiedAt"
                        disabled
                        class="date-input"
                    />
                </div>

                <button class="reset-dates-btn" @click="resetDates">
                    <i class="mdi mdi-refresh" /> Сбросить даты
                </button>
            </div>

            <!-- Priority -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Приоритет</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Показать приоритет</span>
                    <ui-switch
                        :value="props.showPriority"
                        @input="handleShowPriorityChange"
                    />
                </div>

                <div v-if="props.showPriority" class="priority-selector">
                    <button
                        v-for="priority in priorityOptions"
                        :key="priority.value"
                        class="priority-btn"
                        :class="{ 'is-active': props.priority === priority.value }"
                        :style="{ '--priority-color': priority.color }"
                        @click="handlePriorityChange(priority.value)"
                    >
                        <i v-if="priority.icon" :class="`mdi ${priority.icon}`" :style="{ color: priority.color }" />
                        <span>{{ priority.label }}</span>
                    </button>
                </div>
            </div>

            <!-- Tags -->
            <div class="panel-section">
                <div class="panel-section__header">
                    <span class="panel-section__title">Теги</span>
                </div>

                <div class="panel-row panel-row--inline">
                    <span class="panel-label">Показать теги</span>
                    <ui-switch
                        :value="props.showTags"
                        @input="handleShowTagsChange"
                    />
                </div>

                <div v-if="props.showTags" class="panel-row">
                    <ui-input
                        :value="tagsString"
                        placeholder="тег1, тег2, тег3"
                        @change="handleTagsChange"
                    />
                    <span class="panel-hint">Введите теги через запятую и нажмите Enter</span>
                </div>

                <div v-if="props.showTags && props.tags && props.tags.length > 0" class="tags-preview">
                    <span
                        v-for="(tag, index) in props.tags"
                        :key="index"
                        class="tag-chip"
                    >
                        {{ tag }}
                        <button class="tag-remove" @click="removeTag(index)">
                            <i class="mdi mdi-close" />
                        </button>
                    </span>
                </div>
            </div>
        </div>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { UiInput, UiSelect, UiSwitch } from '@goodt-wcore/panel-ui';
import { priorityOptions } from '../constants/priorityLevels';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export default {
    name: 'MetadataPanel',

    extends: Panel,

    meta: { name: 'Метаданные', icon: 'information-outline' },

    components: {
        UiInput,
        UiSelect,
        UiSwitch
    },

    data() {
        return {
            priorityOptions,
            metadataPositionOptions: [
                { value: 'top', label: 'Сверху' },
                { value: 'bottom', label: 'Снизу' }
            ],
            dateFormatOptions: [
                { value: 'DD MMM YYYY', label: '01 Янв 2024' },
                { value: 'DD/MM/YYYY', label: '01/01/2024' },
                { value: 'MM/DD/YYYY', label: '01/01/2024 (США)' },
                { value: 'YYYY-MM-DD', label: '2024-01-01' },
                { value: 'DD MMM YYYY HH:mm', label: '01 Янв 2024 14:30' },
                { value: 'relative', label: 'Относительно (2 дня назад)' }
            ]
        };
    },

    computed: {
        formattedCreatedAt() {
            if (!this.props.createdAt) return 'Не задано';
            if (this.props.dateFormat === 'relative') {
                return this.getRelativeTime(this.props.createdAt);
            }
            return dayjs(this.props.createdAt).format(this.props.dateFormat);
        },

        formattedModifiedAt() {
            if (!this.props.modifiedAt) return 'Не задано';
            if (this.props.dateFormat === 'relative') {
                return this.getRelativeTime(this.props.modifiedAt);
            }
            return dayjs(this.props.modifiedAt).format(this.props.dateFormat);
        },

        tagsString() {
            if (!this.props.tags || !Array.isArray(this.props.tags)) return '';
            return this.props.tags.join(', ');
        }
    },

    methods: {
        handleShowMetadataChange(value) {
            this.$set(this.props, 'showMetadata', value);
            this.propChanged('showMetadata');
        },

        handleMetadataPositionChange(value) {
            this.$set(this.props, 'metadataPosition', value);
            this.propChanged('metadataPosition');
        },

        handleDateFormatChange(value) {
            this.$set(this.props, 'dateFormat', value);
            this.propChanged('dateFormat');
        },

        handleAuthorChange(value) {
            this.$set(this.props, 'author', value);
            this.propChanged('author');
        },

        handleShowPriorityChange(value) {
            this.$set(this.props, 'showPriority', value);
            this.propChanged('showPriority');
        },

        handlePriorityChange(value) {
            this.$set(this.props, 'priority', value);
            this.propChanged('priority');
        },

        handleShowTagsChange(value) {
            this.$set(this.props, 'showTags', value);
            this.propChanged('showTags');
        },

        handleTagsChange(value) {
            const tags = value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            this.$set(this.props, 'tags', tags);
            this.propChanged('tags');
        },

        removeTag(index) {
            const tags = [...(this.props.tags || [])];
            tags.splice(index, 1);
            this.$set(this.props, 'tags', tags);
            this.propChanged('tags');
        },

        resetDates() {
            const now = new Date().toISOString();
            this.$set(this.props, 'createdAt', now);
            this.$set(this.props, 'modifiedAt', now);
            this.propChanged('createdAt');
            this.propChanged('modifiedAt');
        },

        getRelativeTime(dateStr) {
            const date = dayjs(dateStr);
            const now = dayjs();
            const diffMinutes = now.diff(date, 'minute');
            const diffHours = now.diff(date, 'hour');
            const diffDays = now.diff(date, 'day');

            if (diffMinutes < 1) return 'Только что';
            if (diffMinutes < 60) return `${diffMinutes} мин. назад`; // eslint-disable-line no-magic-numbers
            if (diffHours < 24) return `${diffHours} ч. назад`; // eslint-disable-line no-magic-numbers
            if (diffDays < 7) return `${diffDays} дн. назад`; // eslint-disable-line no-magic-numbers
            return date.format('DD MMM YYYY');
        }
    }
};
</script>

<style lang="postcss" scoped>
.elemsticker-metadata-panel {
    padding: 12px;

    .panel-section {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }

        &__header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }

        &__title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: #666;
            letter-spacing: 0.5px;
        }
    }

    .panel-row {
        margin-bottom: 8px;

        &:last-child {
            margin-bottom: 0;
        }

        &--inline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
    }

    .panel-label {
        font-size: 12px;
        color: #333;
        flex-shrink: 0;
    }

    .panel-label-block {
        display: block;
        font-size: 11px;
        color: #666;
        margin-bottom: 4px;
    }

    .panel-hint {
        display: block;
        font-size: 10px;
        color: #999;
        margin-top: 4px;
    }

    .date-input {
        font-size: 12px;
        color: #666;
    }

    .reset-dates-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        margin-top: 8px;
        font-size: 11px;
        color: #666;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
            background: #eee;
            color: #333;
        }

        .mdi {
            font-size: 14px;
        }
    }

    .priority-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
    }

    .priority-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        font-size: 11px;
        background: #f5f5f5;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
            background: #eee;
        }

        &.is-active {
            border-color: var(--priority-color, #666);
            background: #fff;
        }

        .mdi {
            font-size: 12px;
        }
    }

    .tags-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 8px;
    }

    .tag-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        font-size: 11px;
        background: #e3f2fd;
        border-radius: 12px;
        color: #1565c0;
    }

    .tag-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        padding: 0;
        background: transparent;
        border: none;
        cursor: pointer;
        border-radius: 50%;
        color: #1565c0;
        opacity: 0.6;
        transition: opacity 0.15s;

        &:hover {
            opacity: 1;
            background: rgba(0, 0, 0, 0.1);
        }

        .mdi {
            font-size: 10px;
        }
    }
}
</style>
