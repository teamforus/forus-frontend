let OrganizationService = function(
    ApiRequest,
    $rootScope
) {
    return new(function() {
        this.list = function(query = {}) {
            return ApiRequest.get('/platform/organizations', query);
        };

        this.listProviders = function(
            organization_id
        ) {
            return ApiRequest.get(
                '/platform/organizations/' + organization_id + '/providers'
            );
        };

        this.store = function(values) {
            return ApiRequest.post('/platform/organizations', values);
        };

        this.update = function(id, values) {
            return ApiRequest.patch('/platform/organizations/' + id, values);
        };
        
        this.read = function(id) {
            return ApiRequest.get('/platform/organizations/' + id);
        }

        this.use = function(id) {
            localStorage.setItem('active_organization', id);
            $rootScope.$broadcast('organization-changed', id);
        }

        this.clearActive = function() {
            localStorage.removeItem('active_organization');
            $rootScope.$broadcast('organization-changed', null);
        }

        this.active = function() {
            return localStorage.getItem('active_organization') || null;
        }
    });
};

module.exports = [
    'ApiRequest',
    '$rootScope',
    OrganizationService
];