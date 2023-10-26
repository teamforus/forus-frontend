const FundRequestClarificationService = function(ApiRequest) {
    return new(function() {
        this.update = function(fund_id, request_id, id, data = {}) {
            return ApiRequest.patch(`/platform/fund-requests/${request_id}/clarifications/${id}`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    FundRequestClarificationService,
];