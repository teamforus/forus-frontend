let sprintf = require('sprintf-js').sprintf;

let FundRequestValidatorService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations/%s/funds/%s/requests';
    let uriPrefixAll = '/platform/organizations/%s/requests';

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

        this.index = function(organziation_id, fund_id, data = {}) {
            return ApiRequest.get(
                sprintf(uriPrefix, organziation_id, fund_id),
                data
            );
        };

        this.read = function(organziation_id, fund_id, request_id) {
            return ApiRequest.get(
                sprintf(uriPrefix + '/%s', organziation_id, fund_id, request_id)
            );
        };

        this.assign = function(organziation_id, fund_id, request_id, employee_id) {
            return ApiRequest.patch(
                sprintf(uriPrefix + '/%s/assign', organziation_id, fund_id, request_id), {
                    employee_id: employee_id
                }
            );
        };

        this.resign = function(organziation_id, fund_id, request_id, employee_id) {
            return ApiRequest.patch(
                sprintf(uriPrefix + '/%s/resign', organziation_id, fund_id, request_id), {
                    employee_id: employee_id
                }
            );
        };

        this.approve = function(organziation_id, fund_id, request_id, employee_id) {
            return ApiRequest.patch(
                sprintf(uriPrefix + '/%s/approve', organziation_id, fund_id, request_id), {
                    employee_id: employee_id
                }
            );
        };

        this.decline = function(organziation_id, fund_id, request_id, employee_id) {
            return ApiRequest.patch(
                sprintf(uriPrefix + '/%s/decline', organziation_id, fund_id, request_id), {
                    employee_id: employee_id
                }
            );
        };

        this.approveRecord = function(organziation_id, fund_id, request_id, record_id) {
            return ApiRequest.patch(
                sprintf(uriPrefix + '/%s/records/%s', organziation_id, fund_id, request_id, record_id), {
                    state: 'approved'
                }
            );
        };

        this.declineRecord = function(organziation_id, fund_id, request_id, record_id, note = '') {
            return ApiRequest.patch(
                sprintf(uriPrefix + '/%s/records/%s', organziation_id, fund_id, request_id, record_id), {
                    state: 'declined',
                    note: note
                }
            );
        };

        this.requestRecordClarification = function(organziation_id, fund_id, request_id, record_id, question) {
            return ApiRequest.post(
                sprintf(uriPrefix + '/%s/clarifications', organziation_id, fund_id, request_id), {
                    fund_request_record_id: record_id,
                    question: question
                }
            );
        };

        this.recordClarifications = function(organziation_id, fund_id, request_id, record_id) {
            return ApiRequest.get(
                sprintf(uriPrefix + '/%s/clarifications', organziation_id, fund_id, request_id), {
                    fund_request_record_id: record_id,
                }
            );
        };
    };

    return new FundRequestValidatorService();
};

module.exports = [
    'ApiRequest',
    FundRequestValidatorService
];