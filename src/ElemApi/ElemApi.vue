<template>
    <w-elem>
        <div v-if="isLoading" class="preloader color-primary mar-left-5"></div>
        <div v-else @[rootMouseEventName]="onRootClick(Mode.BUTTON)">
            <slot>
                <code v-if="isEditorMode">default slot</code>
            </slot>
        </div>
    </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/core';
import { AuthManager, store, unwrapStoreValue } from '@goodt-wcore/managers';
import { meta } from './descriptor';
import { Mode, Status200Code, Status300Code } from './constants';

const getAuthToken = async () => {
    const { adapter } = AuthManager.instance;
    if (adapter == null) {
        return null;
    }
    try {
        await adapter.updateToken();
        const { token } = adapter;
        return token;
    } catch (error) {
        setTimeout(() => {
            throw error;
        });
        AuthManager.instance.authError(error);
        return null;
    }
};

export default {
    extends: Elem,
    meta,
    data: ({ isEditorMode }) => ({
        rootMouseEventName: isEditorMode ? 'dblclick' : 'click',
        isLoading: false
    }),
    static: { Mode },
    subscribe: [
        {
            event() {
                const { requests } = this.props;
                return [...new Set(requests.flatMap(({ events }) => events))];
            },
            handler(event) {
                this.onRootClick(Mode.EVENT, event.type);
            }
        }
    ],
    methods: {
        async onRootClick(eventMode, eventName) {
            const { requests, mode, generatedOAuthToken } = this.props;

            if (eventMode !== mode) {
                return;
            }

            this.isLoading = true;
            let adaptRequests = requests;

            if (eventMode === Mode.EVENT) {
                adaptRequests = adaptRequests.filter(
                    ({ events }) => eventMode === Mode.EVENT && events.includes(eventName)
                );
            }

            try {
                const results = await Promise.all(
                    adaptRequests.map(async (req) => {
                        const {
                            successEvents = [],
                            errorEvents = [],
                            method,
                            url,
                            responseCode,
                            responseMessage,
                            headers,
                            params,
                            bodyKey,
                            body,
                            authKey,
                            auth
                        } = req;

                        const config = { method, headers: this.composeHeaderContentType(bodyKey) };

                        const isOAuth = authKey === 'oAuth';

                        if (headers.length > 0) {
                            config.headers = {
                                ...config.headers,
                                ...this.composeKeyValueData(this.convertFromStoreValues(headers))
                            };
                        }

                        if (bodyKey != null) {
                            config.body = this.composeBody(this.convertFromStoreValues(body), bodyKey);
                        }

                        if (authKey != null) {
                            config.headers = {
                                ...config.headers,
                                ...(isOAuth === true && generatedOAuthToken != null
                                    ? {
                                          Authorization: generatedOAuthToken,
                                          'Content-Type': 'application/x-www-form-urlencoded'
                                      }
                                    : await this.composeAuth(auth, authKey))
                            };
                        }

                        try {
                            const composedUrl = this.composeUrl(
                                this.convertFromStoreValues(url),
                                this.convertFromStoreValues(params)
                            );
                            const res = await fetch(composedUrl, config);

                            // Парсим ответ в зависимости от Content-Type
                            let json;
                            const contentType = res.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                json = await res.json();
                            } else {
                                // Если не JSON, пытаемся получить текст
                                const text = await res.text();
                                try {
                                    json = JSON.parse(text);
                                } catch {
                                    // Если парсинг не удался, возвращаем как есть
                                    json = { message: text, statusCode: res.status };
                                }
                            }

                            return {
                                keys: {
                                    statusKey: responseCode,
                                    responseKey: responseMessage
                                },
                                status: res.status,
                                data: json,
                                events:
                                    res.status >= Status200Code && res.status < Status300Code
                                        ? successEvents
                                        : errorEvents
                            };
                        } catch (error) {
                            this.handleError(error);
                            return null;
                        }
                    })
                );

                results
                    .filter((res) => res != null)
                    .forEach(({ keys: { statusKey, responseKey }, status, data, events }) => {
                        try {
                            this.$storeCommit({ [statusKey]: status, [responseKey]: data }, { hasMap: false });
                        } catch (error) {
                            this.$handleError(error);
                        } finally {
                            if (events.length > 0) {
                                events.forEach((event) => this.$eventTrigger(event));
                            }
                        }
                    });
            } catch (error) {
                this.handleError(error);
            } finally {
                this.isLoading = false;
            }
        },

        composeKeyValueData(arr) {
            return arr
                .filter(({ key }) => Boolean(key))
                .reduce((acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                }, {});
        },

        composeUrl(url, paramsArr) {
            return paramsArr.length > 0
                ? `${url}?${new URLSearchParams(this.composeKeyValueData(paramsArr)).toString()}`
                : url;
        },

        composeBody(body, bodyKey) {
            switch (bodyKey) {
                case 'json':
                    return body[bodyKey].data;

                case 'text':
                case 'html':
                case 'xml':
                    return body[bodyKey].data;

                case 'formData': {
                    const { data: formDataArr } = body[bodyKey] ?? {};

                    const formDataInst = new FormData();

                    for (const { key, value } of formDataArr) {
                        formDataInst.append(key, value);
                    }

                    return formDataInst;
                }

                case 'urlencoded': {
                    const { data: urlencodedDataArr } = body[bodyKey] ?? {};
                    const res = [];

                    for (const { key, value } of urlencodedDataArr) {
                        const encodedKey = encodeURIComponent(key);
                        const encodedValue = encodeURIComponent(value);
                        res.push(`${encodedKey}=${encodedValue}`);
                    }

                    return res.join('&');
                }

                default:
                    return {};
            }
        },

        composeHeaderContentType(bodyKey) {
            switch (bodyKey) {
                case 'json':
                    return { 'Content-Type': 'application/json' };

                case 'text':
                case 'html':
                case 'xml':
                    return { 'Content-Type': 'text/html; charset=utf-8' };

                case 'formData':
                    return { 'Content-Type': 'multipart/form-data; boundary=ExampleBoundaryString' };

                case 'urlencoded':
                    return { 'Content-Type': 'application/x-www-form-urlencoded' };

                default:
                    return {};
            }
        },

        async composeAuth(auth, authKey) {
            switch (authKey) {
                case 'basicAuth': {
                    const { name, pass } = auth[authKey] ?? {};
                    return {
                        Authorization: `Basic ${btoa(`${name}:${pass}`)}`
                    };
                }

                case 'bearer':
                    return {
                        Authorization: `Bearer ${auth[authKey].token}`
                    };

                case 'authManager': {
                    const token = await getAuthToken();
                    return {
                        ...(auth && { Authorization: `Bearer ${token}` })
                    };
                }

                default:
                    return {};
            }
        },

        convertFromStoreValues(value) {
            if (value == null) {
                return value;
            }

            const stringifyValue = JSON.stringify(value);
            const matches = stringifyValue.matchAll(/{{\s*(.*?)\s*}}/g);

            return JSON.parse(
                [...matches].reduce((acc, [match, key]) => {
                    const storeValue = unwrapStoreValue(store.state[key]);
                    if (storeValue !== undefined) {
                        // Экранируем специальные символы JSON (кавычки, слэши и т.д.)
                        // JSON.stringify добавляет обрамляющие кавычки, поэтому убираем их
                        const escapedValue = JSON.stringify(storeValue).slice(1, -1);
                        return acc.replace(match, escapedValue);
                    }
                    return acc;
                }, stringifyValue)
            );
        }
    },

    implicitCssModule: true
};
</script>
