import { useTaskSettingsApiServiceMixin, TaskSettingsApiVersion } from '@goodt-widgets-vkph/api';

const TaskSettingsApiServiceMixin = useTaskSettingsApiServiceMixin(
    {
        apiBaseURL: 'props.taskSettingsApiUrl'
    },
    { name: 'taskSettingsApiService', version: TaskSettingsApiVersion.V2 }
);

export const TaskSettingsApiServiceMixinTypeDescriptor = undefined;

export const ApiMixins = [TaskSettingsApiServiceMixin];

export const ApiMixinsTypeDescriptor = {
    ...TaskSettingsApiServiceMixinTypeDescriptor
};
