const ContactService = function(ApiRequest) {
    return new (function() {
        this.send = function(params = {}) {
            return ApiRequest.post(`/contact-form`, params);
        };
    });
};

module.exports = [
    'ApiRequest',
    ContactService,
];