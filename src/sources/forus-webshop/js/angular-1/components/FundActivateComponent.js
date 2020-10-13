let sprintf = require('sprintf-js').sprintf;

let FundActivateComponent = function(
    $q,
    $state,
    $stateParams,
    $timeout,
    FundService,
    AuthService,
    PushNotificationsService,
    PrevalidationService,
    FormBuilderService,
    DigIdService,
    ModalService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.state = '';
    $ctrl.totalSteps = 1;
    $ctrl.invalidCriteria = [];
    $ctrl.signedIn = false;
    $ctrl.bsnIsKnown = false;
    $ctrl.appConfigs = appConfigs;
    $ctrl.autoValidation = appConfigs.features.auto_validation;
    
    $ctrl.startDigId = () => {
        DigIdService.startFundRequst($ctrl.fund.id).then(res => {
            document.location = res.data.redirect_url;
        }, res => $state.go('error', {
            errorCode: res.headers('Error-Code')
        }));
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
                PushNotificationsService.danger(res.data.message);
                reject(res);
            })
        });
    };

    $ctrl.getFunds = (filter) => {
        return $q((resolve) => {
            FundService.list(null, {
                check_criteria: 1
            }).then(res => resolve(res.data.data.filter(filter)));
        });
    }

    $ctrl.getApplicableFunds = () => {
        let alreadyAppliedFunds = $ctrl.vouchers.map(voucher => voucher.fund_id);

        return $ctrl.getFunds(fund => ((fund.criteria.filter(
            criterion => !criterion.is_valid
        ).length == 0) && alreadyAppliedFunds.indexOf(fund.id) === -1));
    }

    $ctrl.redeemCode = (form, code) => {
        form.lock();
        form.enabled = false;

        PrevalidationService.redeem(code).then(() => {
            $ctrl.getApplicableFunds().then((funds) => {
                if (funds.length == 1) {
                    return FundService.apply(fund.id).then((res) => {
                        $state.go('voucher', res.data);
                    });
                } else {
                    $state.go('funds');
                }
            });
        }, (res) => {
            $timeout(() => form.enabled = true, 1000);
            form.unlock();

            if (res.status == 404) {
                form.errors.code = [
                    res.data.meta.message
                ];
            } else if (res.data.meta || res.status == 429) {
                ModalService.open('modalNotification', {
                    type: 'info',
                    title: res.data.meta.title,
                    description: res.data.meta.message.split("\n"),
                });
            }
        });
    };

    $ctrl.initPrevalidationsForm = () => {
        $ctrl.activateCodeForm = FormBuilderService.build({
            code: "",
        }, function(form) {
            if (!form.values.code) {
                form.errors.code = true;
                return;
            }

            let code = form.values.code;

            if (typeof code == 'string') {
                code = code.replace(/o|O/g, "0");
                code = code.substring(0, 4) + '-' + code.substring(4);
            }

            $ctrl.redeemCode(form, code);
        });

        $ctrl.activateCodeForm.enabled = true;
    }

    $ctrl.hasDigiDResponse = ($stateParams) => {
        return $stateParams.digid_error || $stateParams.digid_success;
    };

    $ctrl.handleDigiDResponse = ($stateParams, funds) => {
        if ($ctrl.hasDigiDResponse($stateParams)) {
            // got digid error, abort
            if ($stateParams.digid_error) {
                $state.go('error', {
                    errorCode: 'digid_' + $stateParams.digid_error
                });

                return true;
            }

            // digid sign-in flow
            if ($stateParams.digid_success == 'signed_up' || $stateParams.digid_success == 'signed_in') {
                PushNotificationsService.success('Succes! Ingelogd met DigiD.');

                let vouchers = $ctrl.vouchers;
                let takenFundIds = vouchers.map(voucher => voucher.fund_id);
                let fundsNoVouchers = funds.filter(fund => takenFundIds.indexOf(fund.id) === -1);
                let fundsWithVouchers = funds.filter(fund => takenFundIds.indexOf(fund.id) !== -1);

                if (fundsNoVouchers.length > 1 || (
                    (fundsNoVouchers.length === 1) && fundsNoVouchers[0].id != $ctrl.fund.id)) {
                    $state.go('funds');
                } else if (fundsNoVouchers.length === 1) {
                    $state.go('fund-activate', {
                        fund_id: fundsNoVouchers[0].id
                    });
                } else if (fundsWithVouchers.length > 1) {
                    $state.go('vouchers');
                } else if (fundsWithVouchers.length === 1) {
                    $state.go('voucher', {
                        address: vouchers.filter(
                            voucher => voucher.fund_id === fundsWithVouchers[0].id
                        )[0].address,
                    });
                } else {
                    $state.go('funds');
                }

                return true;
            }
        }

        return false;
    }

    $ctrl.getFundVouchers = (fund, vouchers) => {
        return vouchers.filter(voucher => voucher.fund_id === fund.id);
    };

    $ctrl.getFirstFundVoucher = (fund, vouchers) => {
        let fundVouchers = $ctrl.getFundVouchers(fund, vouchers);

        if (fundVouchers.length > 0) {
            return fundVouchers[0];
        }

        return false;
    }

    $ctrl.prepareCriterionMeta = (pendingRequest, criteria) => {
        return criteria.map(criteria => {
            let record = pendingRequest.records.filter(
                record => record.record_type_key == criteria.record_type_key
            )[0];

            if (record) {
                criteria.request_state = record.state;
            }

            return criteria;
        });
    };

    $ctrl.$onInit = function() {
        let voucher = $ctrl.getFirstFundVoucher($ctrl.fund, $ctrl.vouchers);
        let pendingRequests = $ctrl.fundRequests.data.filter(request => request.state === 'pending');

        $ctrl.signedIn = AuthService.hasCredentials();
        $ctrl.bsnIsKnown = $ctrl.identity && $ctrl.identity.bsn;
        $ctrl.digidAvailable = $ctrl.appConfigs.features.digid;
        $ctrl.digidMandatory = $ctrl.appConfigs.features.digid_mandatory;
        
        $ctrl.fundRequestAvailable = (!$ctrl.digidMandatory && $ctrl.fund.allow_fund_requests);
    
        if ($ctrl.autoValidation) {
            $ctrl.fundRequestAvailable = $ctrl.fundRequestAvailable && $ctrl.bsnIsKnown;
        }

        // The user is not authenticated and have to go back to sign-up page
        if (!$ctrl.signedIn || !$ctrl.identity) {
            return $state.go('start');
        }

        if (appConfigs.features.auto_validation && $ctrl.bsnIsKnown) {
            return $state.go('fund-request', {
                fund_id: $ctrl.fund.id
            });
        }

        // Voucher already received, go to the voucher
        if (voucher && !$ctrl.hasDigiDResponse($stateParams)) {
            return $state.go('voucher', voucher);
        }

        // The fund is already taken by identity partner
        if ($ctrl.fund.taken_by_partner) {
            return ModalService.open('modalNotification', {
                type: 'info',
                title: 'Dit tegoed is al geactiveerd',
                closeBtnText: 'Bevestig',
                description: [
                    "U krijgt deze melding omdat het tegoed is geactiveerd door een ",
                    "famielid of voogd. De tegoeden zijn beschikbaar in het account ",
                    "van de persoon die deze als eerste heeft geactiveerd."
                ].join(''),
            }, {
                onClose: () => $state.go('home')
            });
        }

        $ctrl.getApplicableFunds().then(funds => {
            // The request has digid auth success or error meta
            if ($ctrl.hasDigiDResponse($stateParams) && $ctrl.handleDigiDResponse($stateParams, funds)) {
                return;
            }
    
            // Initialize pre-validations pincode form control
            if ($ctrl.fund.allow_prevalidations) {
                $ctrl.initPrevalidationsForm();
            }
    
            // Fund request already in progress
            if (pendingRequests[0] || false) {
                $ctrl.fund.criteria = $ctrl.prepareCriterionMeta(pendingRequests[0], $ctrl.fund.criteria);
                return $ctrl.state = 'fund_already_applied';
            }
    
            // All the criteria are meet, request the voucher
            if ($ctrl.fund.criteria.filter(criterion => !criterion.is_valid).length == 0) {
                return $ctrl.applyFund($ctrl.fund);
            }
    
            if ($ctrl.digidAvailable) {
                $ctrl.state = 'digid_login';
            } else if ($ctrl.fund.allow_prevalidations) {
                $ctrl.state = 'pincode_activate';
            } else if ($ctrl.fund.allow_fund_requests) {
                return $state.go('fund-requests', {
                    fund_id: $ctrl.fund.id
                });
            } else {
                return $state.go('funds');
            }
        });
    };
};

module.exports = {
    bindings: {
        vouchers: '<',
        identity: '<',
        fund: '<',
        fundRequests: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        '$timeout',
        'FundService',
        'AuthService',
        'PushNotificationsService',
        'PrevalidationService',
        'FormBuilderService',
        'DigIdService',
        'ModalService',
        'appConfigs',
        FundActivateComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-activate.html',
};
