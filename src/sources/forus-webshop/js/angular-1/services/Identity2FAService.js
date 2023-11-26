const Identity2FAService = function (
    $q,
    $filter,
    ApiRequest,
) {
    const phoneError = $filter('translate')('modal_2fa_setup.errors.code_sent');
    const phoneErrorObj = { data: { message: phoneError, errors: { phone: [phoneError] } } };

    return new (function () {
        this.status = (data = {}) => {
            return ApiRequest.get('/identity/2fa', data);
        };

        this.update = (data = {}) => {
            return ApiRequest.post(`/identity/2fa/update`, data);
        };

        this.store = (data = {}) => {
            return $q((resolve, reject) => {
                ApiRequest.post('/identity/2fa', data).then((res) => {
                    data.type === 'phone' && !res.data.code_sent ? reject(phoneErrorObj) : resolve(res);
                }, reject);
            });
        };

        this.send = (uuid, data = {}) => {
            return $q((resolve, reject) => {
                ApiRequest.post(`/identity/2fa/${uuid}/resend`, data).then((res) => {
                    res.data.code_sent ? resolve(res) : reject(phoneErrorObj);
                }, reject);
            });
        };

        this.activate = (uuid, data = {}) => {
            return ApiRequest.post(`/identity/2fa/${uuid}/activate`, data);
        };

        this.deactivate = (uuid, data = {}) => {
            return ApiRequest.post(`/identity/2fa/${uuid}/deactivate`, data);
        };

        this.authenticate = (uuid, data = {}) => {
            return ApiRequest.post(`/identity/2fa/${uuid}/authenticate`, data);
        };
    })
};


module.exports = [
    '$q',
    '$filter',
    'ApiRequest',
    Identity2FAService,
];