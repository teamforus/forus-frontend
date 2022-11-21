const FaqService = function (ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function () {
        this.faqValidate = (organization_id, faq) => {
            return ApiRequest.post(`${uriPrefix}${organization_id}/faq/validate`, { faq });
        };
    });
};

module.exports = [
    'ApiRequest',
    FaqService
];