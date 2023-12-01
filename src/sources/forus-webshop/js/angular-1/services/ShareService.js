const ShareService = function(ApiRequest) {
    return new (function() {
        this.sendSms = (values) => ApiRequest.post('/platform/share/sms', values);
    });
};

module.exports = [
    'ApiRequest',
    ShareService
];