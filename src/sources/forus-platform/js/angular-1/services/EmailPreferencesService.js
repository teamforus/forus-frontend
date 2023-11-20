let EmailPreferencesService = function (ApiRequest) {
    let uriPrefix = '/platform/notifications/settings';

    return new(function() {
        this.get = () => {
            return ApiRequest.get(`${uriPrefix}`);
        };

        this.update = (data) => {
            return ApiRequest.patch(`${uriPrefix}`, data);
        };
    })
}

module.exports = [
    'ApiRequest',
    EmailPreferencesService
];
