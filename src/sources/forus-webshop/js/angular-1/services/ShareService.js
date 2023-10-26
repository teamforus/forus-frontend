const ShareService = function(ApiRequest) {
    return new (function() {
        this.send = (values) => ApiRequest.post('/platform/sms/send', values);
    });
};

module.exports = [
    'ApiRequest',
    ShareService
];