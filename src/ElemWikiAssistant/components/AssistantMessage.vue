<template>
    <div class="aiw-msg" :class="[`aiw-msg--${message.role}`, `aiw-msg--${message.status}`]">
        <!-- Вопрос пользователя: только текстом, без HTML -->
        <div v-if="message.role === 'user'" class="aiw-msg__bubble">{{ message.text }}</div>

        <template v-else>
            <div v-if="message.status === 'pending' && !message.text" class="aiw-msg__bubble aiw-msg__bubble--typing">
                <span class="aiw-typing" aria-label="Помощник печатает">
                    <i></i>
                    <i></i>
                    <i></i>
                </span>
            </div>

            <div v-else-if="message.status === 'error'" class="aiw-msg__bubble aiw-msg__bubble--error" role="alert">
                {{ message.error }}
            </div>

            <!-- Ответ: только безопасный HTML из answerHtml -->
            <div v-else class="aiw-msg__bubble aiw-answer" v-html="html"></div>

            <div v-if="hasSources" class="aiw-sources">
                <span class="aiw-sources__label">Источники:</span>
                <a
                    v-for="page in visibleSources"
                    :key="page.id"
                    href="#"
                    class="aiw-source"
                    :data-page-id="page.id"
                    :title="page.title">{{ page.title }}</a>
                <button v-if="hiddenCount > 0" type="button" class="aiw-source aiw-source--more" @click="isExpanded = true">
                    Ещё {{ hiddenCount }}
                </button>
            </div>
        </template>
    </div>
</template>

<script>
import { answerHtml, partialAnswer } from '../core/chat/render.js';
import { SOURCES_CHIPS_MIN, SOURCES_VISIBLE } from '../constants';

export default {
    name: 'AssistantMessage',

    props: {
        /** { id, role, text, status, isLocal, pageIds, error } */
        message: {
            type: Object,
            required: true
        },
        /** Map<id, page> — не реактивный, меняется вместе с версией корпуса */
        pagesById: {
            type: Map,
            default: null
        }
    },

    data: () => ({
        isExpanded: false
    }),

    computed: {
        html() {
            return answerHtml(partialAnswer(this.message.text), this.pagesById);
        },

        sources() {
            const ids = this.message.pageIds || [];
            if (!this.pagesById) {
                return [];
            }
            return ids
                .map((id) => {
                    const page = this.pagesById.get(id);
                    return page ? { id, title: page.title || page.slug || id } : null;
                })
                .filter(Boolean);
        },

        hasSources() {
            return this.message.status === 'done' && this.sources.length > SOURCES_CHIPS_MIN;
        },

        visibleSources() {
            return this.isExpanded ? this.sources : this.sources.slice(0, SOURCES_VISIBLE);
        },

        hiddenCount() {
            return this.sources.length - this.visibleSources.length;
        }
    }
};
</script>
