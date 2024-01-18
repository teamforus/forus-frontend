const ImplementationService = function(ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function() {
        this.list = (organization_id, query = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations`, query);
        };

        this.read = (organization_id, id) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${id}`);
        };

        this.updateCMS = (organization_id, id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${id}/cms`, data);
        };

        this.updateDigiD = (organization_id, id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${id}/digid`, data);
        };

        this.updateEmail = (organization_id, id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${id}/email`, data);
        };

        this.updateEmailBranding = (organization_id, id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${id}/email-branding`, data);
        };

        this.updatePreCheckBanner = (organization_id, id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${id}/pre-check-banner`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    ImplementationService
];