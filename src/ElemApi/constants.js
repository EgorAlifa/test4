export const Mode = {
    EVENT: 'event',
    BUTTON: 'button'
};

export const ModeOptions = [
    { label: 'Ожидание события', value: Mode.EVENT },
    { label: 'Кнопка', value: Mode.BUTTON }
];

export const MethodOptions = [
    { label: 'GET', value: 'get' },
    { label: 'PUT', value: 'put' },
    { label: 'POST', value: 'post' },
    { label: 'DELETE', value: 'delete' }
];

export const BodyTypeOptions = [
    { label: '-', value: null },
    { label: 'Text', value: 'text' },
    { label: 'JSON', value: 'json' },
    { label: 'HTML', value: 'html' },
    { label: 'XML', value: 'xml' },
    { label: 'form-data', value: 'formData' },
    { label: 'x-www-form-urlencoded', value: 'urlencoded' }
];

export const AuthTypeOptions = [
    { label: '-', value: null },
    { label: 'Basic Auth', value: 'basicAuth' },
    { label: 'Bearer token', value: 'bearer' },
    { label: 'Авторизация из проекта', value: 'authManager' }
    // { label: 'OAuth 2.0', value: 'oAuth' } // Временно скрываем
];

export const RequestTemplate = {
    name: '',
    method: 'get',
    url: '',
    events: [],
    successEvents: [],
    errorEvents: [],
    responseCode: 'response_code',
    responseMessage: 'response_message',
    headers: [],
    params: [],
    bodyKey: null,
    body: {
        text: {
            data: ''
        },
        json: {
            data: ''
        },
        html: {
            data: ''
        },
        xml: {
            data: ''
        },
        formData: {
            data: []
        },
        urlencoded: {
            data: []
        }
    },
    authKey: null,
    auth: {
        basicAuth: {
            name: '',
            pass: ''
        },
        bearer: {
            token: ''
        },
        oAuth: {
            authUrl: '',
            clientId: '',
            clientSecret: ''
        }
    }
};

export const KeyValueTemplate = {
    key: '',
    value: ''
};

export const Status200Code = 200;
export const Status300Code = 300;
