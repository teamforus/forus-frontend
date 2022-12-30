let OrganizationEmployeesService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations/';

    return new(function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/employees', query
            );
        };

        this.store = function(organization_id, values) {
            return ApiRequest.post(
                uriPrefix + organization_id + '/employees', values
            );
        };

        this.update = function(organization_id, id, values) {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/employees/' + id, values
            );
        };

        this.read = function(organization_id, id) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/employees/' + id
            );
        }

        this.destroy = function(organization_id, id) {
            return ApiRequest.delete(
                uriPrefix + organization_id + '/employees/' + id
            );
        }

        this.export = function (organization_id, query = {}) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/employees/export', query, {}, true, (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            });
        };

        this.apiResourceToForm = function(apiResource) {
            return {
                'roles': Array.isArray(apiResource.roles) ? apiResource.roles.map(role => role.id) : []
            };
        };
    });
};

module.exports = [
    'ApiRequest',
    OrganizationEmployeesService
];