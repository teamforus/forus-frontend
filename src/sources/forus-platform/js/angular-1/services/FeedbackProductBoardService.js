const FeedbackProductBoardService = function(ApiRequest) {
    const uriPrefix = '/platform/feedback-productboard';

    return new (function() {
        this.validate = function(data) {
            return ApiRequest.post(uriPrefix + '/validate', data);
        };

        this.store = function(data) {
            return ApiRequest.post(uriPrefix, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    FeedbackProductBoardService
];