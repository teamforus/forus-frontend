let ShareService = function(
    ApiRequest
) {
    return new(function() {
        this.send = (values) => {
            return ApiRequest.post('/platform/sms/send', values);
        };
    });
};

module.exports = [
    'ApiRequest',
    ShareService
];