const FeedbackService = function(ApiRequest) {
    const uriPrefix = '/platform/feedback';

    return new (function() {
        this.store = (data) => {
            return ApiRequest.post(uriPrefix, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    FeedbackService,
];