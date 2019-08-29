let EmailPreferencesService = (ApiRequest) => {
    let uriPrefix = '/platform/';

    return new(function() {
        this.getPreferences = (identity_address) => {
            if (identity_address) {
                return ApiRequest.get(
                    uriPrefix + identity_address
                )
            }
        }
    })
}

module.exports = [
    'ApiRequest',
    EmailPreferencesService
];
