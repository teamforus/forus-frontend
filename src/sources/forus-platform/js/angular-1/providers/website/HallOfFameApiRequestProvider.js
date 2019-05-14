module.exports = function() {
    return new(function() {
        var host = "http://136.144.187.106";

        this.$get = [
            '$q',
            '$http',
            '$state',
            'appConfigs',
            function(
                $q,
                $http,
                $state
            ) {
                var resolveUrl = function(input) {
                    var parser = document.createElement('a');

                    parser.href = input;

                    var pathname = parser.pathname.split('/');

                    if (pathname[0] !== '')
                        pathname.unshift('');

                    return parser.protocol + '//' + parser.host + pathname.join('/');
                }

                var makeHeaders = function() {
                    let headers = {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }

                    return headers;
                };

                var get = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('GET', endpoint, data, headers, auth_redirect, cfg);
                };

                var post = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('POST', endpoint, data, headers, auth_redirect, cfg);
                };

                var patch = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('PATCH', endpoint, data, headers, auth_redirect, cfg);
                };

                var put = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('PUT', endpoint, data, headers, auth_redirect, cfg);
                };

                var _delete = function(endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    return ajax('DELETE', endpoint, data, headers, auth_redirect, cfg);
                };

                var ajax = function(method, endpoint, data, headers, auth_redirect = true, cfg = _cfg => _cfg) {
                    var params = {};

                    if (typeof data == 'object' && !(data instanceof FormData)) {
                        data = JSON.parse(JSON.stringify(data));
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

                    params = cfg(params);

                    return $q(function(done, reject) {
                        $http(params).then(function(response) {
                            done(response);
                        }, function(response) {

                            reject(response);
                        });
                    });
                };

                var endpointToUrl = function(endpoint) {
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