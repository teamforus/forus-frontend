const EventLogService = function(ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function() {
        this.list = (organization_id, query = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/logs`, query);
        };
    });
};

module.exports = [
    'ApiRequest',
    EventLogService
];
