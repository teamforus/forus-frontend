module.exports = function() {
    return new (function() {
        var host = false;

        this.setHost = function(_host) {
            while (_host[_host.length - 1] == '/')
                _host = _host.slice(0, _host.length - 1);

            host = _host;
        };

        this.$get = [
            '$q',
            '$http',
            '$rootScope',
            'appConfigs',
            'CredentialsService',
            function(
                $q,
                $http,
                $rootScope,
                appConfigs,
                CredentialsService
            ) {
                const resolveUrl = function(input) {
                    const parser = document.createElement('a');

                    parser.href = input;

                    const pathname = parser.pathname.split('/');

                    if (pathname[0] !== '')
                        pathname.unshift('');

                    return parser.protocol + '//' + parser.host + pathname.join('/');
                }

                const makeHeaders = function() {
                    let headers = {
                        'Accept': 'application/json',
                        'Accept-Language': localStorage.getItem('lang') || 'nl',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + CredentialsService.get(),
                    };

                    if (appConfigs) {
                        headers['Client-Key'] = appConfigs.client_key;
                        headers['Client-Type'] = appConfigs.client_type;
                    }

                    return headers;
                };

                const get = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('GET', endpoint, data, headers, auth_redirect, cfg);
                };

                const post = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('POST', endpoint, data, headers, auth_redirect, cfg);
                };

                const patch = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('PATCH', endpoint, data, headers, auth_redirect, cfg);
                };

                const put = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('PUT', endpoint, data, headers, auth_redirect, cfg);
                };

                const _delete = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('DELETE', endpoint, data, headers, auth_redirect, cfg);
                };

                const ajax = function(method, endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    const params = {};

                    if (typeof data == 'object' && !(data instanceof FormData)) {
                        data = { ...data };
                    }

                    if (typeof auth_redirect == 'undefined') {
                        auth_redirect = true;
                    }

                    if (method == 'GET') {
                        params.params = data || {};

                        for (var prop in params.params) {
                            if (Array.isArray(params.params[prop])) {
                                params.params[prop + '[]'] = params.params[prop];
                                delete params.params[prop];
                            }
                        }
                    } else {
                        params.data = data || {};
                    }

                    params.headers = Object.assign(makeHeaders(), headers);
                    params.url = resolveUrl(host + endpoint);
                    params.method = method;

                    return $q((done, reject) => {
                        $http(cfg(params)).then((res) => done(res), function(response) {
                            if (response.status == 401) {
                                $rootScope.signOut(false, false, false);
                            }

                            reject(response);
                        });
                    });
                };

                const endpointToUrl = function(endpoint) {
                    return resolveUrl(host + (endpoint || ''));
                };

                return {
                    get: get,
                    post: post,
                    patch: patch,
                    put: put,
                    delete: _delete,
                    ajax: ajax,
                    endpointToUrl: endpointToUrl
                }
            }
        ];
    });
};