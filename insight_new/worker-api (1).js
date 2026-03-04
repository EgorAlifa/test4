
const createBroadcastChannel = () => new BroadcastChannel('oauth-internal');

window.$api = (() => {
    const AuthEvent = {
        TOKEN: 'token',
        PROFILE: 'profile',
        LOGIN: 'login',
        LOGOUT: 'logout',
        GET_LOGIN_URL: 'getLoginUrl',
        GET_PASSWORD_RESET_URL: 'getPasswordResetUrl',
        GET_OPTIONS:'getOptions'
    };
    const CommonEvent = {
        UNREGISTER: 'unregister'
    };

    const log = (...rest) =>
        console.log.apply(console.log, [
            '%cEDITOR.SW.CLIENT',
            'background:#ac44f7;font-weight:bold;border-radius:999px;padding: 1px 5px;',
            ...rest
        ]);

    const workerSend = (type, details = {}) =>
        navigator.serviceWorker.controller.postMessage({ type, details });

    const workerOnce = (eventType) => {
        return new Promise((resolve, reject) => {
            const dispose = () => navigator.serviceWorker.removeEventListener('message', cb);
            const cb = ({ data: { type, details, error } }) => {
                if (type !== eventType) {
                    return;
                }
                dispose();
                if (error) {
                    reject(error);
                } else {
                    resolve({ type, details });
                }
            };
            navigator.serviceWorker.addEventListener('message', cb);
        });
    };

    const popupOpen = ({ url, width = 400, height = 600, onclose }) => {
        let left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        left = left < 0 ? 0 : left;

        let isUserClose = true;
        let interval = onclose
            ? setInterval(() => {
                if (win.closed && isUserClose) {
                    clearInterval(interval);
                    onclose();
                }
            }, 1000)
            : null;
        const win = window.open(
            url,
            'auth0:authorize:popup',
            `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`
        );
        const close = () => {
            isUserClose = false;
            win.close();
            clearInterval(interval);
        };
        return { win, close };
    };

    /**
     * @param {ServiceWorkerRegistration} registration
     */
    const serviceWorkerRegistrationHandler = (registration) => {
        /**
         * @param {Function?} resolver
         */
        const reloadWorker = (resolver) => {
            if (resolver) {
                resolver();
            }
            if (window.parent) {
                window.parent.location.reload();
            } else {
                location.reload();
            }
        };

        return new Promise((resolve) => {
            // just to ensure that another weird registration worker trap hasnt occured
            const timeoutId = setTimeout(() => {
                console.error('serviceWorkerRegistrationHandler took too long');
                reloadWorker(resolve);
            }, 5000);

            /**
             * @param {{ target:ServiceWorker }}
             */
            const onStateChange = ({ target }) => {
                const isActivated = target.state == 'activated';
                const { controller } = navigator.serviceWorker;

                if (isActivated) {
                    worker.onstatechange = null;
                    if (controller) {
                        clearTimeout(timeoutId);
                        resolve();
                    }
                    //
                    else {
                        // https://web.dev/service-worker-lifecycle/#shift-reload
                        reloadWorker(resolve);
                    }
                }
            };
            const worker = registration.installing || registration.waiting || registration.active;
            worker.onstatechange = onStateChange;
            onStateChange({ target: worker });
        });
    };

    const AuthActions = {
        token: () => {
            const event = AuthEvent.TOKEN;
            const promise = workerOnce(event);
            workerSend(event);
            return promise;
        },
        profile: () => {
            const event = AuthEvent.PROFILE;
            const promise = workerOnce(event);
            workerSend(event);
            return promise;
        },
        login: ({ username, password, code, redirectUrl }) => {
            const event = AuthEvent.LOGIN;
            const promise = workerOnce(event);
            workerSend(event, { username, password, code, redirectUrl });
            return promise;
        },
        loginPopup: async ({ width = 400, height = 550 } = {}) => {
            const redirectUrl = new URL(location.pathname, location.origin).toString();
            const {
                details: { url }
            } = await AuthActions.getLoginUrl({ redirectUrl });

            return new Promise((resolve, reject) => {
                const ch = createBroadcastChannel();
                ch.onmessage = ({ data }) => {
                    const { code, error, error_description } = data;
                    log('loginPopup()', 'ch.payload', data);
                    popup.close();
                    ch.onmessage = null;

                    if (error) {
                        const err = new Error(error);
                        err.name = error;
                        err.message = error_description ?? error;
                        reject(err);
                    } else {
                        AuthActions.login({ code, redirectUrl }).then(resolve).catch(reject);
                    }
                };

                const popup = popupOpen({
                    url,
                    width,
                    height,
                    onclose: () => {
                        ch.onmessage = null;
                        ch.close();
                        reject(new Error('close'));
                    }
                });
                if (popup.win == null) {
                    reject(new Error('popup'));
                }
            });
        },
        onLogin: () => workerOnce(AuthEvent.LOGIN),
        logout: () => {
            const event = AuthEvent.LOGOUT;
            const promise = workerOnce(event);
            workerSend(event);
            return promise;
        },
        onLogout: () => workerOnce(AuthEvent.LOGOUT),
        getLoginUrl: ({ redirectUrl }) => {
            const event = AuthEvent.GET_LOGIN_URL;
            const promise = workerOnce(event);
            workerSend(event, { redirectUrl });
            return promise;
        },
        getPasswordResetUrl: () => {
            const event = AuthEvent.GET_PASSWORD_RESET_URL;
            const promise = workerOnce(event);
            workerSend(event);
            return promise;
        },
        getOptions: () => {
            const event = AuthEvent.GET_OPTIONS;
            const promise = workerOnce(event);
            workerSend(event);
            return promise;
        }
    };

    const WorkerActions = {
        init: async (
            { isDebug = false, isTest = false, env = 'production',  } = {},
            { workerQuery } = {}
        ) => {
            const urlParams = new URLSearchParams({
                debug: isDebug ? 1 : 0,
                test: isTest ? 1 : 0,
                env,
                ...workerQuery
            });

            isDebug && log({ isDebug, isTest, env, ...workerQuery });

            return navigator.serviceWorker
                .register(`./worker.js?${urlParams.toString()}`)
                .then(serviceWorkerRegistrationHandler);
        },
        unregister: async () => {
            workerSend(CommonEvent.UNREGISTER);
        }
    };

    return {
        ...WorkerActions,
        auth: AuthActions
    };
})();
{
    const query = location.href.replace(/^([^#?]+)[#?](.+)/, '$2');
    const payload = Object.fromEntries(new URLSearchParams(query));

    if (window.parent && Object.keys(payload).length > 0) {
        const ch = createBroadcastChannel();
        ch.postMessage(payload);
    }
}
