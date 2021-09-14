const ImplementationNotificationsService = function(ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function() {
        this.list = (organization_id, implementation_id, query = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${implementation_id}/system-notifications`, query);
        };
    });
};

module.exports = [
    'ApiRequest',
    ImplementationNotificationsService
];