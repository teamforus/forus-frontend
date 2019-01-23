module.exports = [
    'ApiRequest',
    '$rootScope',
    function(
        ApiRequest,
        $rootScope
    ) {
        return new (function() {
            this.list = function() {
                return ApiRequest.get('/platform/organizations');
            };

            this.listProviders = function(
                organization_id,
                query = {}
            ) {
                return ApiRequest.get(
                    '/platform/organizations/' + organization_id +
                    '/providers',
                    query
                );
            };

            this.listProvidersExport = function(
                organization_id,
                query = {}
            ) {
                return ApiRequest.get(
                    '/platform/organizations/' + organization_id +
                    '/providers/export',
                    query, {}, true,
                    (_cfg) => {
                        _cfg.responseType = 'arraybuffer';
                        _cfg.cache = false;

                        return _cfg;
                    }
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
                let id = parseInt(localStorage.getItem('active_organization') || null);

                return isNaN(id) ? false : id;
            }

            this.apiResourceToForm = function(apiResource) {
                return {
                    product_categories: apiResource.product_categories.map(
                        function(product_category) {
                            return product_category.id;
                        }
                    ),
                    name: apiResource.name,
                    iban: apiResource.iban,
                    email: apiResource.email,
                    email_public: !!apiResource.email_public,
                    phone: apiResource.phone,
                    phone_public: !!apiResource.phone_public,
                    kvk: apiResource.kvk,
                    btw: apiResource.btw,
                    website: apiResource.website,
                    website_public: !!apiResource.website_public,
                };
            };
        });
    }
];