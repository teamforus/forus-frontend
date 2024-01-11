import { format } from 'date-fns';

const FundService = function (
    $q,
    $filter,
    ApiRequest,
    ModalService,
) {
    const uriPrefix = '/platform/organizations/';
    const $trans = $filter('translate');

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
                return record.key == criterion.record_type.key;
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
                criterion => !criterion.record_type.key.endsWith('_eligible')
            ).map(criterion => {
                return {
                    key: recordsByTypesKey[criterion.record_type.key].name || '',
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

        this.getCurencyKeys = () => {
            return ['net_worth', 'base_salary'];
        };

        this.getCriterionControlType = (record_type, operator = null) => {
            const checkboxKeys = ['children', 'kindpakket_eligible', 'kindpakket_2018_eligible'];
            const stepKeys = [
                'children_nth', 'waa_kind_0_tm_4_2021_eligible_nth', 'waa_kind_4_tm_18_2021_eligible_nth', 
                'adults_nth', 'eem_kind_0_tm_4_eligible_nth', 'eem_kind_4_tm_12_eligible_nth', 
                'eem_kind_12_tm_14_eligible_nth', 'eem_kind_14_tm_18_eligible_nth',
            ];

            const currencyKeys = this.getCurencyKeys();
            const numberKeys = ['tax_id'];
            const dateKeys = ['birth_date'];

            const control_type_default = 'ui_control_text';
            const control_type_base = {
                'bool': 'ui_control_checkbox',
                'date': 'ui_control_date',
                'string': 'ui_control_text',
                'email': 'ui_control_text',
                'bsn': 'ui_control_number',
                'iban': 'ui_control_text',
                'number': 'ui_control_number',
                'select': 'select_control',
            }[record_type.type];

            const control_type_key = {
                // checkboxes
                ...checkboxKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_checkbox' }), {}),
                // stepper
                ...stepKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_step' }), {}),
                // currency
                ...currencyKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_currency' }), {}),
                // numbers
                ...numberKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_number' }), {}),
                // dates
                ...dateKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_date' }), {}),
            }[record_type.key] || null;

            return ((record_type.type == 'string') && ((operator == '=') || (record_type.operators.find((operator) => operator.key == '=')))) ?
                'ui_control_checkbox' :
                control_type_key || control_type_base || control_type_default;
        }

        this.getCriterionControlDefaultValue = (record_type, operator = null, init_date = true) => {
            const control_type = this.getCriterionControlType(record_type, operator);

            return {
                ui_control_checkbox: null,
                ui_control_date: init_date ? format(new Date(), 'dd-MM-yyyy') : null,
                ui_control_step: record_type?.key == 'adults_nth' ? 1 : 0,
                ui_control_number: undefined,
                ui_control_currency: undefined,
                ui_control_text: '',
            }[control_type];
        }

        this.getCriterionLabelValue = (criteria_record, value = null) => {
            const trans_key = `fund_request.sign_up.record_checkbox.${criteria_record.key}`;
            const translated = $trans(trans_key, { value });
            const trans_fallback_key = 'fund_request.sign_up.record_checkbox.default';

            return translated === trans_key ? $trans(trans_fallback_key, { value: value }) : translated;
        }
    });
};

module.exports = [
    '$q',
    '$filter',
    'ApiRequest',
    'ModalService',
    FundService
];