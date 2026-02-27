import { BaseService } from '@goodt-common/application';

export class ModelDataService extends BaseService {
    _taskSettingsApiService;

    constructor({ taskSettingsApiService }) {
        super();
        this._taskSettingsApiService = taskSettingsApiService;
    }

    async fetchTaskAvailableStatuses({ taskId, presetUserRoleId }) {
        const { isError, result, error } = await this._taskSettingsApiService.getTaskAvailableStatuses(taskId, {
            withConditionGroups: false,
            taskTypeRoleId: presetUserRoleId
        });
        if (isError) {
            this.handleError(error);
            return [];
        }
        return result;
    }

    async changeTaskStatus({ taskId, statusChangeRuleId }) {
        const { isError, error } = await this._taskSettingsApiService.updateTaskStatus(taskId, {
            statusChangeRuleId
        });

        if (isError) {
            this.handleError(error);
        }

        return !isError;
    }

    async fetchTaskTypeRoles() {
        const { isError, result: taskInfo, error } = await this._taskSettingsApiService.getTaskTypeRoles();
        if (isError) {
            this.handleError(error);
            return [];
        }
        return taskInfo;
    }

    async fetchTasksByFilter({
        taskIds,
        taskTypeIds,
        userIds,
        parentIds,
        processId,
        processTypeId,
        taskFieldTypeId,
        taskFieldValue,
        taskField = {},
        rootId
    }) {
        const { isError, result, error } = await this._taskSettingsApiService.getTasksByFilter({
            taskIds,
            taskTypeIds,
            userIds,
            parentIds,
            processId,
            processTypeId,
            taskFieldTypeId,
            taskFieldValue,
            taskField,
            rootId
        });

        if (isError) {
            this.handleError(error);
            return [];
        }

        return result?.data ?? [];
    }

    async updateTasksStatuses({
        userIds = [],
        taskTypeIds = [],
        statusIds = [],
        processIds = [],
        taskIds = [],
        targetStatusId = []
    }) {
        const { isError, error } = await this._taskSettingsApiService.updateTasksStatuses(
            { userIds, taskTypeIds, statusIds, processIds, taskIds },
            targetStatusId
        );

        if (isError) {
            this.handleError(error);
        }

        return !isError;
    }
}
