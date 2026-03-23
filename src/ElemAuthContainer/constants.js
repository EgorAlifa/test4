export const State = {
    LOADING: 'loading',
    DEFAULT: 'default',
    NOT_AUTHORIZED: 'not-authorized'
};

export const Behaviour = {
    RENDER: 'render',
    REDIRECT: 'redirect',
    LOGIN: 'login'
};

export const LocalizedState = Object.freeze({
    [State.LOADING]: 'Загрузка',
    [State.DEFAULT]: 'По умолчанию',
    [State.NOT_AUTHORIZED]: 'Не авторизован'
});

export const LocalizedBehaviour = Object.freeze({
    [Behaviour.RENDER]: 'Отображение',
    [Behaviour.REDIRECT]: 'Переадресация',
    [Behaviour.LOGIN]: 'Авторизация'
});
