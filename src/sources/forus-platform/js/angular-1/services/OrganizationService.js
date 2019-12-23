module.exports = [
    'ApiRequest',
    '$rootScope',
    function(
        ApiRequest,
        $rootScope
    ) {
        return new (function() {
            this.list = function(query = {}) {
                return ApiRequest.get('/platform/organizations', query);
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
                return ApiRequest.post(
                    '/platform/organizations',
                    this.apiFormToResource(values)
                );
            };

            this.update = function(id, values) {
                return ApiRequest.patch(
                    '/platform/organizations/' + id,
                    this.apiFormToResource(values)
                );
            };

            this.read = function(id, query = {}) {
                return ApiRequest.get('/platform/organizations/' + id, query);
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

            this.apiFormToResource = function(formData) {
                let values = JSON.parse(JSON.stringify(formData));

                if (['http://', 'https://'].indexOf(values.website) != -1) {
                    values.website = '';
                }

                return values;
            };

            this.apiResourceToForm = function(apiResource) {
                return {
                    business_type_id: apiResource.business_type_id,
                    name: apiResource.name,
                    iban: apiResource.iban,
                    email: apiResource.email,
                    email_public: !!apiResource.email_public,
                    phone: apiResource.phone,
                    phone_public: !!apiResource.phone_public,
                    kvk: apiResource.kvk,
                    btw: apiResource.btw,
                    website: apiResource.website || 'https://',
                    website_public: !!apiResource.website_public,
                };
            };
        });
    }
];