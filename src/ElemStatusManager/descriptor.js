/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-syntax */
import panels from './panels';
import { TaskTypeId, WorkMode } from './constants';
import {
    PLACEHOLDER_OPENED_TEXT,
    defaultChildTaskTypeIds,
    SelectSetting,
    SelectSettingLabel,
    StatusIconBindingsLabel,
    PopupSetting,
    PopupSettingLabel,
    StatusIconBindingFactory
} from './config';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({
    IS_ACTIVE: 'is_active',
    TASK_ID: 'taskId'
});

export const Events = Object.freeze({
    RELOAD: 'reload',
    STATUS_CHANGE: 'statusChangedEvent'
});

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        taskSettingsApiUrl: {
            type: String,
            default: 'https://goodt-dev.goodt.me:8488/'
        },
        presetUserRoleId: {
            type: Number,
            default: null
        },
        placeholderOpenedText: {
            type: String,
            default: PLACEHOLDER_OPENED_TEXT
        },
        useStatusIdAsEvent: {
            type: Boolean,
            default: false
        },
        isBulkStatusChange: {
            type: Boolean,
            default: false
        },
        parentTaskTypeId: {
            type: Number,
            default: TaskTypeId.PERFORMANCE_MAP
        },
        childTaskTypeIds: {
            type: Array,
            default: () => [...defaultChildTaskTypeIds]
        },
        workMode: {
            type: String,
            default: WorkMode.STANDARD,
            label: 'Режим работы'
        },
        statusIconBindings: {
            type: Array,
            default: () => [],
            factory: StatusIconBindingFactory,
            label: StatusIconBindingsLabel
        },
        popupSetting: {
            type: Object,
            default: () => ({ ...PopupSetting }),
            label: PopupSettingLabel
        },
        selectSetting: {
            type: Object,
            default: () => ({ ...SelectSetting }),
            label: SelectSettingLabel
        },
        events: {
            type: Object,
            default: () => ({
                [Events.RELOAD]: 'reload',
                [Events.STATUS_CHANGE]: 'statusChanged'
            })
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    events: {
        [Events.RELOAD]: {
            listen: `events.${Events.RELOAD}`
        },
        [Events.STATUS_CHANGE]: {
            trigger: `events.${Events.STATUS_CHANGE}`
        }
    }
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: false
};

export default descriptor;
