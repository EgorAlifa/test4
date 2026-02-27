/* eslint-disable no-magic-numbers */
import { TaskTypeId } from './constants';

export const POPUP_TITLE = 'Изменение статуса';
export const DECLINE_BUTTON_TITLE = 'Отменить';
export const PLACEHOLDER_OPENED_TEXT = 'ВЫБЕРИТЕ ДЕЙСТВИЕ';
export const POPUP_DESCRIPTION = 'Вы уверены, что хотите изменить статус карточки?';

export const defaultChildTaskTypeIds = [TaskTypeId.INDICATOR_KPE, TaskTypeId.PRIORITY_GOAL];

export const DefaultOption = Object.freeze({ value: null, label: 'По авторизованному' });

export const SelectSetting = Object.freeze({
    statusCssClass: [],
    selectCssClass: [],
    statusIconCssClass: [],
    datalistCssClass: [],
    optionCssClass: [],
    optionStatusIconCssClass: []
});

export const SelectSettingLabel = Object.freeze({
    'selectSetting.statusCssClass': 'Класс статуса без селекта',
    'selectSetting.selectCssClass': 'Класс селекта',
    'selectSetting.statusIconCssClass': 'Класс иконки статуса',
    'selectSetting.datalistCssClass': 'Класс выпадающего списка',
    'selectSetting.optionCssClass': 'Класс элемента вып. списка',
    'selectSetting.optionStatusIconCssClass': 'Класс иконки статус вып. списка'
});

export const StatusIconBindingFactory = () => ({
    status: null,
    icon: '',
    color: ''
});

export const StatusIconBindingsLabel = Object.freeze({
    'statusIconBindings.status': 'Статус',
    'statusIconBindings.icon': 'Иконка',
    'statusIconBindings.color': 'Цвет иконки'
});

export const PopupSetting = Object.freeze({
    popupCssClass: [],
    titleCssClass: [],
    closeIconCssClass: [],
    bodyCssClass: [],
    footerCssClass: [],
    cancelButtonCssClass: [],
    confirmButtonCssClass: []
});

export const PopupSettingLabel = Object.freeze({
    'popupSetting.popupCssClass': 'Класс попапа',
    'popupSetting.titleCssClass': 'Класс заголовка',
    'popupSetting.closeIconCssClass': 'Класс иконки закрытия',
    'popupSetting.bodyCssClass': 'Класс описания',
    'popupSetting.footerCssClass': 'Класс футера',
    'popupSetting.cancelButtonCssClass': 'Класс кнопки отмены',
    'popupSetting.confirmButtonCssClass': 'Класс кнопки подтверждения'
});
