<template>
    <w-elem>
        <div v-if="isLoading" class="preloader" />
        <template v-else-if="isAvailable">
            <w-status-select v-if="isSelectMode" v-bind="{ currentStatus, options }" @option-selected="onOptionClick" />
            <w-standard-status-manager
                v-else
                v-bind="{ options, selectedOptionTitle }"
                @option-selected="onOptionClick" />
        </template>

        <w-comment-frame
            v-if="isOpenedPopup"
            v-bind="{ buttonName: selectedOption.title }"
            @on-cancel="onPopupClose"
            @change-accepted="onChangeAccepted" />
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { widget } from '@goodt-wcore/utils';
import { WCommentFrame, WStatusSelect, WStandardStatusManager } from './components';
import { ApiMixins, ApiMixinsTypeDescriptor } from './api';
import { meta, Vars, Events } from './descriptor';
import { ModelDataService, ViewModel } from './presentation';
import { WorkMode } from './constants';

export default {
    extends: Elem,
    components: {
        WCommentFrame,
        WStatusSelect,
        WStandardStatusManager
    },
    mixins: [...ApiMixins],
    meta,
    data: () => ({
        isOpenedPopup: false,
        /* Vetur HACK for type hinting */
        ...ApiMixinsTypeDescriptor
    }),
    watchStore: [
        {
            all: true,
            vars: [Vars.TASK_ID],
            handler() {
                this.viewModel.init();
            }
        }
    ],
    watchEditor: {
        'props.presetUserRoleId': {
            handler() {
                if (this.taskId != null) {
                    this.viewModel.init();
                }
            }
        }
    },
    computed: {
        isAvailable() {
            return this.options.length > 0 && this.options.some(({ isAvailable }) => isAvailable);
        },
        taskId() {
            return this.$storeState[Vars.TASK_ID];
        },
        isLoading() {
            return this.viewModel.isLoading;
        },
        options() {
            return this.viewModel.options;
        },
        selectedOptionTitle() {
            return this.viewModel.selectedOptionTitle;
        },
        selectedOption() {
            return this.viewModel.selectedOption;
        },
        currentStatus() {
            return this.viewModel.currentStatus;
        }
    },
    computedEditor: {
        placeholderOpened() {
            return this.props.placeholderOpenedText;
        },
        isSelectMode() {
            return this.props.workMode === WorkMode.SELECT;
        }
    },
    subscribe: [
        {
            event: Events.RELOAD,
            handler() {
                this.reloadWidget();
            }
        }
    ],
    created() {
        this.setup();
    },
    methods: {
        setup() {
            this.modelDataService = new ModelDataService({
                taskSettingsApiService: this.taskSettingsApiService
            });

            this.modelDataService.addErrorHandler(this.handleError.bind(this));

            this.viewModel = new ViewModel({
                modelDataService: this.modelDataService,
                widget: widget(this)
            });
        },
        async reloadWidget() {
            this.onPopupClose();
            await this.viewModel.init();
        },
        onPopupClose() {
            this.isOpenedPopup = false;
        },
        onOptionClick(option) {
            this.viewModel.selectedOption = option;
            this.isOpenedPopup = true;
            this.isOpenedPopover = false;
        },
        async onChangeAccepted() {
            await this.viewModel.changeTaskStatus();
            await this.viewModel.init();
        }
    },
    implicitCssModule: true
};
</script>

<style module lang="pcss" src="./style.pcss"></style>
