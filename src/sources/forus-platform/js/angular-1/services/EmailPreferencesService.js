let EmailPreferencesService = (ApiRequest) => {
    let uriPrefix = '/identity/notification-preferences';

    return new(function() {
        this.getPreferences = (identity_address, exchange_token) => {
            if (identity_address && exchange_token) {
                return ApiRequest.get(`${uriPrefix}/${identity_address}/${exchange_token}`)
            }
        };

        this.updatePreferences = (identity_address, exchange_token) => {
            if (identity_address && exchange_token) {
                return ApiRequest.post(`${uriPrefix}/${identity_address}/${exchange_token}`)
            }
        };

        this.unsubscribe = (identity_address, exchange_token) => {
            if (identity_address && exchange_token) {
                return ApiRequest.post(`${uriPrefix}/${identity_address}/${exchange_token}/unsubscribe`)
            }
        }
    })
}

module.exports = [
    'ApiRequest',
    EmailPreferencesService
];
