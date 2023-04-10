const AnnouncementService = function(ApiRequest) {
    return new (function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/announcements`, query);
        };
    });
};

module.exports = [
    'ApiRequest',
    AnnouncementService,
];