const Identity2FAService = function (ApiRequest) {
    return new (function () {
        this.status = (data = {}) => {
            return ApiRequest.get('/identity/2fa', data);
        };

        this.update = (data = {}) => {
            return ApiRequest.post(`/identity/2fa/update`, data);
        };

        this.store = (data = {}) => {
            return ApiRequest.post('/identity/2fa', data);
        };

        this.send = (uuid, data = {}) => {
            return ApiRequest.post(`/identity/2fa/${uuid}/resend`, data);
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
    'ApiRequest',
    Identity2FAService,
];