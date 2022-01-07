const sprintf = require('sprintf-js').sprintf;

const FundRequestComponent = function(
    $q,
    $sce,
    $state,
    $timeout,
    $filter,
    RecordService,
    FundService,
    AuthService,
    FundRequestService,
    PushNotificationsService,
    appConfigs
) {
    const $ctrl = this;
    const $trans = $filter('translate');
    const welcomeSteps = 1;

    $ctrl.step = 1;
    $ctrl.state = null;
    $ctrl.totalSteps = [];
    $ctrl.recordsByKey = {};
    $ctrl.invalidCriteria = [];
    $ctrl.authToken = false;
    $ctrl.signedIn = false;
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;
    $ctrl.recordsSubmitting = false;
    $ctrl.files = [];
    $ctrl.errorReason = false;
    $ctrl.finishError = false;
    $ctrl.bsnIsKnown = true;
    $ctrl.appConfigs = appConfigs;
    $ctrl.hasApp = false;

    $ctrl.shownSteps = [];

    $ctrl.criterionValuePrefix = {
        net_worth: '€',
        base_salary: '€'
    };

    $ctrl.digidAvailable = $ctrl.appConfigs.features.digid;
    $ctrl.digidMandatory = $ctrl.appConfigs.features.digid_mandatory;
    $ctrl.hideFundRequestOverviewStep = false;

    const trans_record_checkbox = (criteria_record_key, value) => {
        const trans_key = 'fund_request.sign_up.record_checkbox.' + criteria_record_key;
        const translated = $trans(trans_key, { value });
        const trans_fallback_key = 'fund_request.sign_up.record_checkbox.default';

        return translated === trans_key ? $trans(trans_fallback_key, { value: value }) : translated;
    };

    const overviewSteps = $ctrl.hideFundRequestOverviewStep ? 0 : 1;

    // Submit criteria record
    $ctrl.submitStepCriteria = (criteria) => {
        return $ctrl.validateCriteria(criteria).then($ctrl.nextStep, () => { });
    };

    // Submit or Validate record criteria
    $ctrl.validateCriteria = (criteria) => {
        return $q((resolve, reject) => {
            $ctrl.recordsSubmitting = true;

            FundRequestService.storeValidate($ctrl.fund.id, {
                records: [{
                    record_type_key: criteria.record_type_key,
                    fund_criterion_id: criteria.id,
                    value: criteria.input_value,
                    files: criteria.files_uid,
                }]
            }).then(res => {
                criteria.errors = {};
                resolve(res.data);
            }, res => {
                $ctrl.recordsSubmitting = false;
                reject(criteria.errors = {
                    value: res.data.errors['records.0.value'],
                    record: res.data.errors['records.0'],
                    record_type_key: res.data.errors['records.0.record_type_key'],
                    fund_criterion_id: res.data.errors['records.0.fund_criterion_id'],
                });
            });
        });
    };

    $ctrl.onFileInfo = (invalidCriteria) => {
        invalidCriteria.files_uid = invalidCriteria.files.filter(
            (item) => item.uploaded && item.file_uid
        ).map(file => file.file_uid);

        invalidCriteria.isUploadingFiles = invalidCriteria.files.filter(
            (item) => item.uploading
        ).length > 0;
    };

    $ctrl.submitRequest = () => {
        if ($ctrl.submitInProgress) {
            return;
        }

        $ctrl.submitInProgress = true;

        FundRequestService.store($ctrl.fund.id, {
            records: $ctrl.fund.auto_validation ? $ctrl.invalidCriteria.map(criterion => ({
                value: criterion.value,
                record_type_key: criterion.record_type_key,
                fund_criterion_id: criterion.id,
            })) : $ctrl.invalidCriteria.map(criterion => ({
                value: criterion.input_value,
                record_type_key: criterion.record_type_key,
                fund_criterion_id: criterion.id,
                files: criterion.files_uid,
            }))
        }).then(() => {
            if ($ctrl.fund.auto_validation) {
                $ctrl.applyFund($ctrl.fund);
            } else {
                $ctrl.step++;
                $ctrl.updateState();
            }
        }, (res) => {
            $ctrl.step++;
            $ctrl.updateState();
            $ctrl.finishError = true;
            $ctrl.errorReason = res.data.message;
            $ctrl.submitInProgress = false;
        });
    };

    $ctrl.setRecordValue = (invalidCriteria) => {
        $timeout(() => {
            invalidCriteria.input_value = invalidCriteria.is_checked ? invalidCriteria.value : null;
        }, 250)
    };

    $ctrl.updateEligibility = () => {
        let validCriteria = $ctrl.fund.criteria.filter(criterion => criterion.is_valid);
        let invalidCriteria = $ctrl.fund.criteria.filter(criterion => !criterion.is_valid);

        validCriteria.forEach((criterion) => {
            criterion.isValid = true;
        });

        invalidCriteria.forEach((criterion) => {
            criterion.isValid = false;
        });

        $ctrl.invalidCriteria = JSON.parse(JSON.stringify(invalidCriteria)).map(criterion => ({
            ...criterion, ...{
                files: [],
                description_html: $sce.trustAsHtml(criterion.description_html),
            }
        }));

        $ctrl.invalidCriteria = $ctrl.invalidCriteria.map(criterion => {
            let control_type = criterion.operator == '=' ? 'ui_control_checkbox' : {
                // checkboxes
                'children': 'ui_control_checkbox',
                'kindpakket_eligible': 'ui_control_checkbox',
                'kindpakket_2018_eligible': 'ui_control_checkbox',
                // dates
                'birth_date': 'ui_control_date',
                // stepper
                'children_nth': 'ui_control_step',
                'waa_kind_0_tm_4_2021_eligible_nth': 'ui_control_step',
                'waa_kind_4_tm_18_2021_eligible_nth': 'ui_control_step',
                // numbers
                'tax_id': 'ui_control_number',
                'bsn': 'ui_control_number',
                // currency
                'net_worth': 'ui_control_currency',
                'base_salary': 'ui_control_currency',
            }[criterion.record_type_key] || 'ui_control_text';

            return Object.assign(criterion, {
                control_type: control_type,
                label: trans_record_checkbox(criterion.record_type_key, criterion.value),
                input_value: {
                    ui_control_checkbox: null,
                    ui_control_date: moment().format('DD-MM-YYYY'),
                    ui_control_step: 0,
                    ui_control_number: undefined,
                    ui_control_currency: undefined,
                }[control_type]
            });
        });

        $ctrl.buildSteps();
    };

    $ctrl.buildSteps = () => {
        $ctrl.totalSteps = [];

        for (let index = 0; index < ((welcomeSteps - 1) +
            ($ctrl.fund.auto_validation ? 1 : $ctrl.invalidCriteria.length)); index++) {
            $ctrl.totalSteps.push(index + 1);
        }
    };

    $ctrl.step2state = (step) => {
        if (step == 1) {
            return $ctrl.fund.auto_validation ? 'confirm_criteria' : 'criteria';
        }

        if ($ctrl.fund.auto_validation && step == 2) {
            return 'done';
        }

        if (step == ($ctrl.totalSteps.length + 1) + welcomeSteps) {
            return $ctrl.hideFundRequestOverviewStep ? 'done' : 'application_overview';
        }

        if (!$ctrl.hideFundRequestOverviewStep && step == ($ctrl.totalSteps.length + 2) + welcomeSteps) {
            return 'done';
        }

        return 'criteria_' + ((step - welcomeSteps) - 1);
    };

    $ctrl.buildTypes = () => {
        return $q((resolve, reject) => {
            RecordService.list().then(res => {
                $ctrl.records = res.data;
                $ctrl.records.forEach(function(record) {
                    if (!$ctrl.recordsByKey[record.key]) {
                        $ctrl.recordsByKey[record.key] = [];
                    }

                    $ctrl.recordsByKey[record.key].push(record);
                });

                $ctrl.buildSteps();
                $ctrl.updateEligibility();
                resolve($ctrl.invalidCriteria);
            }, reject);
        });
    };

    $ctrl.nextStep = () => {
        $ctrl.buildSteps();

        if ($ctrl.step == (welcomeSteps + $ctrl.totalSteps.length + overviewSteps)) {
            return $ctrl.submitRequest();
        }

        $ctrl.step++;
        $ctrl.updateState();
    };

    $ctrl.prevStep = () => {
        $ctrl.buildSteps();
        $ctrl.step--;
        $ctrl.updateState();
    };

    $ctrl.updateState = () => {
        $ctrl.state = $ctrl.step2state($ctrl.step);
    };

    $ctrl.prepareRecordTypes = () => {
        let recordTypes = {};

        $ctrl.recordTypes.forEach((recordType) => {
            recordTypes[recordType.key] = recordType;
        });

        $ctrl.recordTypes = recordTypes;
    };

    $ctrl.applyFund = function(fund) {
        return $q((resolve, reject) => {
            FundService.apply(fund.id).then(function(res) {
                PushNotificationsService.success(sprintf(
                    'Succes! %s tegoed geactiveerd!',
                    $ctrl.fund.name
                ));
                $state.go('voucher', res.data.data);
                resolve(res.data);
            }, res => {
                reject(res);
                PushNotificationsService.danger(res.data.message);
            })
        });
    };

    $ctrl.getActiveFundVouchers = (fund, vouchers) => {
        return vouchers.filter(voucher => !voucher.expired && (voucher.fund_id === fund.id));
    };

    $ctrl.getFirstFundVoucher = (fund, vouchers) => {
        return $ctrl.getActiveFundVouchers(fund, vouchers)[0] || false;
    }

    $ctrl.finish = () => $state.go('funds');
    $ctrl.goToMain = () => $state.go('home');

    $ctrl.goToActivationComponent = (error = 0) => {
        return $state.go('fund-activate', {
            fund_id: $ctrl.fund.id,
            backoffice_error: error
        });
    };

    $ctrl.submitConfirmCriteria = () => {
        $ctrl.submitRequest();
    };

    $ctrl.fundRequestIsAvailable = (fund) => {
        return fund.allow_fund_requests && (!$ctrl.digidMandatory || ($ctrl.digidMandatory && $ctrl.bsnIsKnown));
    };

    $ctrl.$onInit = function() {
        const voucher = $ctrl.getFirstFundVoucher($ctrl.fund, $ctrl.vouchers);
        const pendingRequests = $ctrl.fundRequests ? $ctrl.fundRequests.data.filter(request => {
            return request.state === 'pending';
        }) : [];

        // Voucher already received, go to the voucher
        if (voucher) {
            return $state.go('voucher', voucher);
        }

        $ctrl.signedIn = AuthService.hasCredentials();
        $ctrl.bsnIsKnown = $ctrl.identity && $ctrl.identity.bsn;
        $ctrl.digidAvailable = $ctrl.appConfigs.features.digid;
        $ctrl.digidMandatory = $ctrl.appConfigs.features.digid_mandatory;
        $ctrl.fundRequestAvailable = $ctrl.fundRequestIsAvailable($ctrl.fund);

        $ctrl.canRequest = $ctrl.appConfigs.fund_request_allways_bsn_confirmation ? (
            ((new Date().getTime() - sessionStorage.getItem('__last_timestamp')) / 1000) < 120
        ) : true;

        // The user is not authenticated and have to go back to sign-up page
        if ((!$ctrl.signedIn || !$ctrl.identity) || ($ctrl.fund.auto_validation && !$ctrl.bsnIsKnown) || !$ctrl.canRequest) {
            return $state.go('start');
        }

        if (!$ctrl.fundRequestAvailable) {
            return $ctrl.goToActivationComponent(2);
        }

        // The fund is already taken by identity partner
        if ($ctrl.fund.taken_by_partner || (pendingRequests[0] || false)) {
            return $ctrl.goToActivationComponent();
        }

        // All the criteria are meet, request the voucher
        if ($ctrl.fund.criteria.filter(criterion => !criterion.is_valid).length == 0) {
            return $ctrl.goToActivationComponent();
        }

        $ctrl.prepareRecordTypes();

        $ctrl.buildTypes().then(() => {
            FundRequestService.index($ctrl.fund.id).then(() => {
                if ($ctrl.invalidCriteria.length == 0) {
                    $ctrl.applyFund($ctrl.fund);
                }

                if ($ctrl.invalidCriteria.length == 1) {
                    $ctrl.hideFundRequestOverviewStep = true;
                }
            });

            if (($ctrl.bsnIsKnown = $ctrl.identity.bsn) || !$ctrl.digidAvailable) {
                $ctrl.step = 1;
                $ctrl.updateState();
            }
        });

        $ctrl.updateState();
    };
};

module.exports = {
    bindings: {
        fund: '<',
        records: '<',
        identity: '<',
        vouchers: '<',
        recordTypes: '<',
        fundRequests: '<',
    },
    controller: [
        '$q',
        '$sce',
        '$state',
        '$timeout',
        '$filter',
        'RecordService',
        'FundService',
        'AuthService',
        'FundRequestService',
        'PushNotificationsService',
        'appConfigs',
        FundRequestComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-request.html',
};
