const IdentityEmailsService = function (ApiRequest) {
    return new (function () {
        this.list = () => {
            return ApiRequest.get('/identity/emails');
        };

        this.store = (email, date = {}) => {
            return ApiRequest.post('/identity/emails', { email, ...date });
        };

        this.show = (id) => {
            return ApiRequest.get(`/identity/emails/${id}`);
        };

        this.delete = (id) => {
            return ApiRequest.delete(`/identity/emails/${id}`);
        };

        this.resendVerification = (id) => {
            return ApiRequest.post(`/identity/emails/${id}/resend`);
        };

        this.makePrimary = (id) => {
            return ApiRequest.patch(`/identity/emails/${id}/primary`);
        };
    });
};

module.exports = [
    'ApiRequest',
    IdentityEmailsService
];