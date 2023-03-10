let sprintf = require('sprintf-js').sprintf;

let FundProviderInvitationsService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations';

    return new(function() {
        this.index = function(organization_id, fund_id, query = {}) {
            return ApiRequest.get(sprintf(
                '%s/%s/funds/%s/provider-invitations',
                uriPrefix,
                organization_id,
                fund_id
            ), query);
        };

        this.store = function(organization_id, fund_id, from_fund_id) {
            return ApiRequest.post(sprintf(
                '%s/%s/funds/%s/provider-invitations',
                uriPrefix,
                organization_id,
                fund_id
            ), {
                fund_id: from_fund_id
            });
        };

        this.read = function(organization_id, fund_id, invitation_id) {
            return ApiRequest.get(sprintf(
                '%s/%s/funds/%s/provider-invitations/%s',
                uriPrefix,
                organization_id,
                fund_id,
                invitation_id
            ));
        };

        this.readInvitation = function(token) {
            return ApiRequest.get(sprintf(
                '/platform/provider-invitations/%s',
                token
            ));
        };

        this.acceptInvitation = function(token) {
            return ApiRequest.patch(sprintf(
                '/platform/provider-invitations/%s',
                token
            ));
        };

        this.listInvitations = (organization_id, filters = {}) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/provider-invitations`, filters);
        };

        this.acceptInvitationById = (organization_id, invitation_id) => {
            return ApiRequest.patch(sprintf(
                '/platform/organizations/%s/provider-invitations/%s',
                organization_id,
                invitation_id
            ));
        };
    });
};

module.exports = [
    'ApiRequest',
    FundProviderInvitationsService
];