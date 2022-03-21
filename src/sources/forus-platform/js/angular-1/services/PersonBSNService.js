const PersonBSNService = function(ApiRequest) {
    return new(function() {
        this.read = (organization_id, bsn) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/person-bsn/${bsn}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    PersonBSNService
];