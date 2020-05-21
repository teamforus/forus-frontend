let ImplementationService = function(
    ApiRequest,
) {
    let uriPrefix = '/platform/organizations/';

    return new(function() {
        this.list = (organization_id, query = {}) => {
            return ApiRequest.get(
                uriPrefix + organization_id + '/implementations', query
            );
        };

        this.read = (organization_id, id) => {
            return ApiRequest.get(
                uriPrefix + organization_id + '/implementations/' + id
            );
        };

        this.update = (organization_id, implementation_id, data) => {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/implementations/' + implementation_id, data
            );
        };
    });
};

module.exports = [
    'ApiRequest',
    ImplementationService
];