let EmailPreferencesService = (ApiRequest) => {
    let uriPrefix = '/platform/notifications';

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
