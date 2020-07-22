let NotificationsService = function(ApiRequest) {
    let uriPrefix = '/platform';

    let NotificationsService = function() {
        this.list = function(data = {}) {
            return ApiRequest.get(uriPrefix + '/notifications', data);
        };
    };

    return new NotificationsService();
};

module.exports = [
    'ApiRequest',
    NotificationsService
];