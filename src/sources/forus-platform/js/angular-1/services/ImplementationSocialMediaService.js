const ImplementationSocialMediaService = function (ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function () {
        this.list = (organization_id, id, query = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${id}/social-medias`, query);
        };

        this.store = (organization_id, id, data = {}) => {
            return ApiRequest.post(`${uriPrefix}${organization_id}/implementations/${id}/social-medias`, data);
        };

        this.read = (organization_id, id, social_media_id) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${id}/social-medias/${social_media_id}`);
        };

        this.update = (organization_id, id, social_media_id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${id}/social-medias/${social_media_id}`, data);
        };

        this.destroy = (organization_id, id, social_media_id) => {
            return ApiRequest.delete(`${uriPrefix}${organization_id}/implementations/${id}/social-medias/${social_media_id}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    ImplementationSocialMediaService
];