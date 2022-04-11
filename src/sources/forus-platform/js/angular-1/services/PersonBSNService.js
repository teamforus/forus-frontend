const PersonBSNService = function(ApiRequest) {
    return new(function() {
        this.read = (organization_id, fund_id, bsn) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/funds/${fund_id}/person-bsn`, {
                'bsn': bsn
            });
        };
    });
};

module.exports = [
    'ApiRequest',
    PersonBSNService
];