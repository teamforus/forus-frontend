const Identity2FAService = function (
    $q,
    $filter,
    ApiRequest
) {
    const phoneCodeSendError = $filter('translate')('modal_2fa_setup.errors.phone.code_sent');
    const phoneCodeSentErrorObj = {
        data: {
            message: phoneCodeSendError,
            errors: {
                phone: [phoneCodeSendError]
            }
        }
    };

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
                    if (data.type === 'phone' && !res.data.code_sent) {
                        reject(phoneCodeSentErrorObj);
                    } else {
                        resolve(res);
                    }
                }, reject);
            });
        };

        this.send = (uuid, data = {}) => {
            return $q((resolve, reject) => {
                ApiRequest.post(`/identity/2fa/${uuid}/resend`, data).then((res) => {
                    if (res.data.code_sent) {
                        resolve(res);
                    } else {
                        reject(phoneCodeSentErrorObj);
                    }
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