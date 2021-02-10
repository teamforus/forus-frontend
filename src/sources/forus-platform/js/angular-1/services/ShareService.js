module.exports = ['ApiRequest', function(ApiRequest) {
    return new (function() {
        this.sendEmail = (values) => {
            return ApiRequest.post('/platform/share/email', values);
        };

        this.sendSms = (values) => {
            return ApiRequest.post('/platform/share/sms', values);
        };
    });
}];