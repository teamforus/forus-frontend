const FundService = function (
    $q,
    ApiRequest,
    ModalService
) {
    const uriPrefix = '/platform/organizations/';

    return new (function () {
        this.list = function (organization_id, values = {}) {
            if (organization_id) {
                return ApiRequest.get(uriPrefix + organization_id + '/funds');
            }

            return ApiRequest.get('/platform/funds', { check_criteria: 1, ...values });
        };

        this.apply = function (id) {
            return ApiRequest.post(`/platform/funds/${id}/apply`);
        };

        this.check = function (id) {
            return ApiRequest.post(`/platform/funds/${id}/check`);
        };

        this.request = (id, data) => {
            return ApiRequest.post(`/platform/funds/${id}/request`, data);
        };

        this.applyToFirstAvailable = () => {
            return $q((resolve, reject) => {
                this.list().then((res) => {
                    if (res.data.data.length < 1) {
                        reject();
                    } else {
                        this.apply(res.data.data[0].id).then(resolve, reject);
                    }
                }, reject);
            });
        };

        this.readById = function (id, values = {}) {
            return ApiRequest.get(`/platform/funds/${id}`, { check_criteria: 1, ...values });
        };

        this.approveProvider = function (organization_id, fund_id, id) {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/funds/' + fund_id + '/providers/' + id, {
                state: 'approved'
            });
        };

        this.declineProvider = function (organization_id, fund_id, id) {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/funds/' + fund_id + '/providers/' + id, {
                state: 'declined'
            });
        };

        this.states = function () {
            return [{
                name: "Active",
                value: 'active',
            }, {
                name: "Paused",
                value: 'paused',
            }, {
                name: "Closed",
                value: 'closed',
            }];
        }

        let newest = (arr, prop) => {
            let _newest = null;
            let _newsetTime = 0;

            arr.forEach(item => {
                if (moment(item[prop]).format('X') > _newsetTime) {
                    _newest = item;
                }
            });

            return _newest;
        };

        this.checkEligibility = (
            records = [],
            criterion,
            validators,
            organization_id = null
        ) => {
            let validRecords = records.filter(record => {
                return record.key == criterion.record_type_key;
            }).filter(record => {
                return (record.validations.filter(validation => {
                    return (validation.organization_id == organization_id ||
                        validation.organization_id == null) && validators.indexOf(validation.identity_address) != -1;
                }).length > 0);
            });

            if (validRecords.length == 0) {
                return null;
            }

            validRecords.sort((a, b) => {
                let _a = moment(newest(a.validations, 'created_at').created_at).format('X');
                let _b = moment(newest(b.validations, 'created_at').created_at).format('X');

                return _a > _b ? -1 : (_a == _b ? 0 : 1);
            });


            let record = typeof validRecords[0] != 'undefined' ? validRecords[0] : null;
            let validValue = false;

            if (criterion.operator == '!=') {
                validValue = record.value != criterion.value;
            } else if (criterion.operator == '=') {
                validValue = record.value == criterion.value;
            } else if (criterion.operator == '>') {
                validValue = parseFloat(record.value) > parseFloat(criterion.value);
            } else if (criterion.operator == '<') {
                validValue = parseFloat(record.value) < parseFloat(criterion.value);
            } else if (criterion.operator == '>=') {
                validValue = parseFloat(record.value) >= parseFloat(criterion.value);
            } else if (criterion.operator == '<=') {
                validValue = parseFloat(record.value) <= parseFloat(criterion.value);
            }

            return validValue;
        }

        this.checkEligibilityLegacy = (
            records = [],
            criterion,
            validators,
            organization_id = null
        ) => {
            return records.map(function (record) {
                let validated = record.validations.filter(function (validation) {
                    if (organization_id && validation.organization) {
                        if (validation.organization.id != organization_id) {
                            return false;
                        }
                    }

                    return (validation.state == 'approved') && validators.indexOf(
                        validation.identity_address
                    ) != -1;
                }).length > 0;

                let validValue = false;

                if (criterion.operator == '!=') {
                    validValue = record.value != criterion.value;
                } else if (criterion.operator == '=') {
                    validValue = record.value == criterion.value;
                } else if (criterion.operator == '>') {
                    validValue = parseFloat(record.value) > parseFloat(criterion.value);
                } else if (criterion.operator == '<') {
                    validValue = parseFloat(record.value) < parseFloat(criterion.value);
                } else if (criterion.operator == '>=') {
                    validValue = parseFloat(record.value) >= parseFloat(criterion.value);
                } else if (criterion.operator == '<=') {
                    validValue = parseFloat(record.value) <= parseFloat(criterion.value);
                }

                if (!validValue) {
                    record.state = 'addRecord';
                } else if (validated && !validValue) {
                    record.state = 'invalid';
                } else if (!validated && validValue) {
                    record.state = 'validate';
                } else if (validated && validValue) {
                    record.state = 'valid';
                }

                return record;
            });
        }

        this.fundCriteriaList = (criteria, recordsByTypesKey) => {
            return criteria.filter(
                criterion => !criterion.record_type_key.endsWith('_eligible')
            ).map(criterion => {
                return {
                    key: recordsByTypesKey[criterion.record_type_key].name || '',
                    value: [
                        criterion.operator != '=' ? criterion.operator : "",
                        criterion.value
                    ].join(" ").trim(),
                };
            });
        };

        this.mapFund = (fund, vouchers, configs) => {
            fund.vouchers = vouchers.filter(voucher => voucher.fund_id == fund.id && !voucher.expired);
            fund.isApplicable = fund.criteria.length > 0 && fund.criteria.filter(criterion => !criterion.is_valid).length == 0;
            fund.alreadyReceived = fund.vouchers.length !== 0;
            fund.canApply = !fund.is_external && !fund.alreadyReceived && fund.isApplicable && !fund.has_pending_fund_requests;

            fund.showRequestButton =
                !fund.alreadyReceived &&
                !fund.has_pending_fund_requests &&
                !fund.isApplicable &&
                fund.allow_direct_requests &&
                configs.funds.fund_requests;

            fund.showPendingButton = !fund.alreadyReceived && fund.has_pending_fund_requests;
            fund.showActivateButton = !fund.alreadyReceived && fund.isApplicable;

            fund.linkPrimaryButton = [
                fund.showRequestButton,
                fund.showPendingButton,
                fund.showActivateButton,
                fund.alreadyReceived,
            ].filter((flag) => flag).length === 0;

            return fund;
        };

        this.redeem = function (code) {
            return ApiRequest.post('/platform/funds/redeem', { code });
        };

        this.showTakenByPartnerModal = () => {
            ModalService.open('modalNotification', {
                type: 'info',
                title: 'Dit tegoed is al geactiveerd',
                closeBtnText: 'Bevestig',
                description: [
                    "U krijgt deze melding omdat het tegoed is geactiveerd door een ",
                    "famielid of voogd. De tegoeden zijn beschikbaar in het account ",
                    "van de persoon die deze als eerste heeft geactiveerd."
                ].join(''),
            });
        };
    });
};

module.exports = [
    '$q',
    'ApiRequest',
    'ModalService',
    FundService
];