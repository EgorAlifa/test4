import { BaseViewModel } from '@goodt-common/application';
import { reactive } from '@goodt-common/utils';
import { uniqBy } from 'lodash';
import { ONCE_OPTION, WorkMode } from '../constants';
import { Events, Vars } from '../descriptor';

export class ViewModel extends BaseViewModel {
    _modelDataService;

    _widget;

    _taskId;

    _state = reactive({
        isLoading: false,
        currentStatus: null,
        options: [],
        selectedOption: null,
        selectedOptionTitle: null
    });

    get isLoading() {
        return this._state.isLoading;
    }

    get options() {
        return this.isSelectMode ? this.extendStatusOptionsWithIconBindings(this._state.options) : this._state.options;
    }

    get selectedOption() {
        return this._state.selectedOption;
    }

    set selectedOption(option) {
        this._state.selectedOption = option;
    }

    get selectedOptionTitle() {
        return this._state.selectedOptionTitle;
    }

    get currentStatus() {
        return this._state.currentStatus;
    }

    get isSelectMode() {
        const { workMode } = this._widget.props;
        return workMode === WorkMode.SELECT;
    }

    constructor({ modelDataService, widget }) {
        super();
        this._modelDataService = modelDataService;
        this._widget = widget;
    }

    async init() {
        const { [Vars.TASK_ID]: taskId } = this._widget.storeState;
        if (taskId == null) {
            return;
        }

        this._taskId = taskId;
        this._state.isLoading = true;

        const { presetUserRoleId } = this._widget.props;
        const statuses = await this._modelDataService.fetchTaskAvailableStatuses({
            taskId,
            presetUserRoleId
        });
        if (statuses.length === 0) {
            this._state.isLoading = false;
            return;
        }

        this._state.options = this.buildStatusOptions(statuses);

        if (this.isSelectMode) {
            const [firstStatus] = statuses;
            this._state.currentStatus = this.createCurrentStatusInfo(firstStatus);
        }

        const { length: optionsCounter } = this._state.options;
        this._state.selectedOptionTitle = optionsCounter === ONCE_OPTION ? this._state.options[0].title : null;

        this._state.isLoading = false;
    }

    extendStatusOptionsWithIconBindings(statusOptions) {
        const { statusIconBindings } = this._widget.props;
        return statusOptions.map((option) => {
            const foundStatusIconBinding = statusIconBindings.find(({ status }) => status === option.statusToId);
            return { ...option, ...foundStatusIconBinding };
        });
    }

    buildStatusOptions(statuses) {
        return uniqBy(
            statuses
                .map(
                    ({
                        status_change_rule: {
                            id: statusId,
                            status_to: { name: title, id: statusToId, index }
                        },
                        result
                    }) => ({ title, statusId, statusToId, index, isAvailable: result ?? false })
                )
                .sort((a, b) => a.index - b.index),
            'statusToId'
        );
    }

    createCurrentStatusInfo(status) {
        const { statusIconBindings } = this._widget.props;

        const {
            status_change_rule: {
                id: statusId,
                status_from: { name: title, id: statusToId, index }
            },
            result
        } = status;
        const foundStatusIconBinding = statusIconBindings.find(
            (statusIconBinding) => statusIconBinding.status === statusToId
        );
        return { title, statusId, statusToId, index, isAvailable: result ?? false, ...foundStatusIconBinding };
    }

    async changeTaskStatus() {
        const { useStatusIdAsEvent, isBulkStatusChange } = this._widget.props;
        const { statusToId, statusId, title } = this._state.selectedOption;

        this._state.isLoading = true;

        if (isBulkStatusChange) {
            await this.changeChildTaskStatus(statusToId);
        }

        const isChangeSuccessful = await this._modelDataService.changeTaskStatus({
            statusChangeRuleId: statusId,
            taskId: this._taskId
        });

        if (isChangeSuccessful) {
            this._widget.eventTrigger(Events.STATUS_CHANGE, statusId);

            if (useStatusIdAsEvent) {
                this._widget.eventTrigger(String(statusId));
            }

            this._state.selectedOptionTitle = title;
        }

        this._state.isLoading = false;
    }

    async changeChildTaskStatus(statusToId) {
        const { parentTaskTypeId, childTaskTypeIds } = this._widget.props;

        if (parentTaskTypeId == null || childTaskTypeIds.length === 0 || this._taskId == null) {
            return;
        }

        const tasks = await this._modelDataService.fetchTasksByFilter({
            taskIds: [this._taskId],
            taskTypeIds: [parentTaskTypeId]
        });
        const [task] = tasks.filter(({ date_to: dateTo }) => dateTo == null);
        if (task == null) {
            return;
        }

        const childTasks = await this._modelDataService.fetchTasksByFilter({
            rootId: this._taskId,
            taskTypeIds: childTaskTypeIds
        });

        const filteredChildTaskIds = childTasks.filter(({ date_to: dateTo }) => dateTo == null).map(({ id }) => id);
        if (filteredChildTaskIds.length === 0) {
            return;
        }

        await this._modelDataService.updateTasksStatuses({
            taskIds: filteredChildTaskIds,
            targetStatusId: statusToId
        });
    }
}
