let sprintf = require('sprintf-js').sprintf;

let FundRequestValidatorService = function(ApiRequest) {
    let uriPrefixAll = '/platform/organizations/%s/fund-requests';

    let FundRequestValidatorService = function() {
        this.indexAll = function(organziation_id, data = {}) {
            return ApiRequest.get(sprintf(uriPrefixAll, organziation_id), data);
        };

        this.exportAll = function(organziation_id, filters = {}) {
            return ApiRequest.get(sprintf(
                uriPrefixAll + '/export', organziation_id
            ), filters, {}, true, (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            });
        };

        this.index = function(organziation_id, data = {}) {
            return ApiRequest.get(
                sprintf(uriPrefixAll, organziation_id),
                data
            );
        };

        this.read = function(organziation_id, request_id) {
            return ApiRequest.get(
                sprintf(uriPrefixAll + '/%s', organziation_id, request_id)
            );
        };

        this.assign = function(organziation_id, request_id) {
            return ApiRequest.patch(
                sprintf(uriPrefixAll + '/%s/assign', organziation_id, request_id)
            );
        };

        this.resign = function(organziation_id, request_id) {
            return ApiRequest.patch(
                sprintf(uriPrefixAll + '/%s/resign', organziation_id, request_id)
            );
        };

        this.approve = function(organziation_id, request_id, values = {}) {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/approve',
                organziation_id,
                request_id
            ), values);
        };

        this.decline = function(organziation_id, request_id, note = '') {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/decline',
                organziation_id,
                request_id
            ), { note });
        };

        this.disregard = function(organization_id, request_id, values = {}) {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/disregard',
                organization_id,
                request_id
            ), values);
        };

        this.disregardUndo = function(organization_id, request_id, note = '') {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/disregard-undo',
                organization_id,
                request_id
            ));
        };

        this.appendRecord = function(organziation_id, request_id, values = {}) {
            return ApiRequest.post(sprintf(
                uriPrefixAll + '/%s/records',
                organziation_id,
                request_id
            ), values);
        };

        this.approveRecord = function(organziation_id, request_id, record_id) {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/records/%s/approve',
                organziation_id,
                request_id,
                record_id
            ));
        };

        this.declineRecord = function(organziation_id, request_id, record_id, note = '') {
            return ApiRequest.patch(sprintf(
                uriPrefixAll + '/%s/records/%s/decline',
                organziation_id,
                request_id,
                record_id
            ), {
                note: note
            });
        };

        this.requestRecordClarification = function(organziation_id, request_id, record_id, question) {
            return ApiRequest.post(sprintf(
                uriPrefixAll + '/%s/clarifications',
                organziation_id,
                request_id
            ), {
                fund_request_record_id: record_id,
                question: question
            });
        };

        this.recordClarifications = function(organziation_id, request_id, record_id) {
            return ApiRequest.get(sprintf(
                uriPrefixAll + '/%s/clarifications',
                organziation_id,
                request_id
            ), {
                fund_request_record_id: record_id,
            });
        };
    };

    return new FundRequestValidatorService();
};

module.exports = [
    'ApiRequest',
    FundRequestValidatorService
];