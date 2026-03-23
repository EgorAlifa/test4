export const RedirectType = {
    DEFAULT: 'default',
    CUSTOM: 'custom'
};

export const LocalizedRedirectType = Object.freeze({
    [RedirectType.DEFAULT]: 'Страница авторизации Keycloak',
    [RedirectType.CUSTOM]: 'Пользовательская страница'
});

export const ACTIVITY_EVENTS = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'click',
    'scroll',
    'wheel'
];
