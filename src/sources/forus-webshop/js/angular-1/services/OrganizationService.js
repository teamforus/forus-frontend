const OrganizationService = function (ApiRequest, HelperService) {
    return new (function () {
        this.list = function (query = {}) {
            return ApiRequest.get('/platform/organizations', query);
        };

        this.listRecursive = function (query = {}) {
            return HelperService.recursiveLeacher((page) => this.list({ ...query, page: page }), 4);
        };

        this.read = function (id) {
            return ApiRequest.get(`/platform/organizations/${id}`);
        }

        this.reservationFields = function(id, query = {}) {
            return ApiRequest.get(`/platform/organizations/${id}/reservation-fields`, query);
        };
    });
};

module.exports = [
    'ApiRequest',
    'HelperService',
    OrganizationService
];