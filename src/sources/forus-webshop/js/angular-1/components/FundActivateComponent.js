let sprintf = require('sprintf-js').sprintf;

let FundActivateComponent = function(
    $q,
    $state,
    $stateParams,
    $timeout,
    FundService,
    AuthService,
    PushNotificationsService,
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

    $ctrl.startDigId = () => {
        DigIdService.startFundRequst($ctrl.fund.id).then(res => {
            document.location = res.data.redirect_url;
        }, (res) => {
            if (res.status === 403 && res.data.message) {
                return PushNotificationsService.danger(res.data.message);
            }

            $state.go('error', {
                errorCode: res.headers('Error-Code')
            })
        });
    };

    $ctrl.applyFund = function(fund) {
        return $q((resolve, reject) => {
            FundService.apply(fund.id).then(function(res) {
                let voucher = res.data.data;

                PushNotificationsService.success(sprintf(
                    'Succes! %s tegoed geactiveerd!',
                    voucher.fund.name
                ));

                resolve(voucher);
            }, res => {
                PushNotificationsService.danger(res.data.message);
                reject(res);
            });
        });
    };

    $ctrl.getFunds = (filter) => {
        return $q((resolve) => {
            FundService.list(null, {
                check_criteria: 1
            }).then(res => resolve(res.data.data.filter(filter)));
        });
    }

    $ctrl.getValidFunds = () => {
        return $ctrl.getFunds(fund => ((fund.criteria.filter(
            criterion => !criterion.is_valid
        ).length == 0)));
    };

    $ctrl.getApplicableFunds = () => {
        let alreadyAppliedFunds = $ctrl.vouchers.map(voucher => voucher.fund_id);

        return $ctrl.getValidFunds(fund => {
            return alreadyAppliedFunds.indexOf(fund.id) === -1;
        });
    };

    $ctrl.redeemCode = (form, code) => {
        form.lock();
        form.enabled = false;

        FundService.redeem(code).then(res => {
            if (res.data.vouchers.length > 0) {
                if (res.data.vouchers.length === 1) {
                    $state.go('voucher', res.data.vouchers[0]);
                } else {
                    $state.go('vouchers');
                }
            } else if (res.data.prevalidation) {
                $ctrl.getApplicableFunds().then((funds) => {
                    if (funds.length > 0) {
                        let vouchers = [];

                        Promise.all(funds.map((fund) => (new Promise((resolve, reject) => {
                            $ctrl.applyFund(fund).then((voucher) => {
                                vouchers.push(voucher);
                                resolve(voucher);
                            }, reject);
                        })))).then(() => {
                            if (vouchers.length == 0) {
                                $state.go('funds');
                            } else if (vouchers.length == 1) {
                                $state.go('voucher', vouchers[0]);
                            } else {
                                $state.go('vouchers');
                            }
                        });
                    } else {
                        $state.go('funds');
                    }
                });
            }
        }, (res) => {
            if ((res.status == 404 || res.status === 403) && res.data.meta) {
                form.errors.code = [res.data.meta.message];
            } else if (res.data.meta || res.status == 429) {
                ModalService.open('modalNotification', {
                    type: 'info',
                    title: res.data.meta.title,
                    description: res.data.meta.message.split("\n"),
                });
            } else {
                ModalService.open('modalNotification', {
                    type: 'info',
                    title: 'Error',
                    description: res.data.message.split("\n"),
                });
            }

            $timeout(() => form.enabled = true, 1000);
            form.unlock();
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
                if ($stateParams.digid_error === 'error_0040') {
                    PushNotificationsService.info(
                        'DigiD - Inlogpoging geannuleerd.',
                        'U hebt deze inlogpoging geannuleerd. Probeer eventueel opnieuw om verder te gaan.'
                    );

                    $state.go('fund-activate', { ...$stateParams, ...{ digid_error: undefined } }, {
                        reload: true
                    });
                } else {
                    $state.go('error', { 
                        errorCode: 'digid_' + $stateParams.digid_error,
                        hideHomeLinkButton: true 
                    });
                }

                return true;
            }

            // digid sign-in flow
            if ($stateParams.digid_success == 'signed_up' || $stateParams.digid_success == 'signed_in') {
                PushNotificationsService.success('Succes! Ingelogd met DigiD.');
                sessionStorage.setItem('__last_timestamp', new Date().getTime());

                // user vouchers
                let vouchers = $ctrl.vouchers;

                // funds with valid criteria 
                let availableFund = funds.filter(fund => ((fund.criteria.filter(
                    criterion => !criterion.is_valid
                ).length == 0)));

                // list ids of funds with valid criteria 
                let availableFundIds = availableFund.map(fund => fund.id);

                // list ids of funds where user has vouchers
                let takenFundIds = vouchers.map(voucher => voucher.fund_id);

                // valid funds without vouchers
                let fundsNoVouchers = availableFund.filter(fund => takenFundIds.indexOf(fund.id) === -1);

                // list funds where user has vouchers (regardless of valid or invalid criteria)
                let fundsWithVouchers = funds.filter(fund => takenFundIds.indexOf(fund.id) !== -1);

                // list funds where user doesn't have vouchers, 
                // not all criteria are valid and fund request is enabled/available
                let fundsValidCriteria = funds.filter((fund) => {
                    return $ctrl.fundRequestIsAvailable(funds) &&
                        takenFundIds.indexOf(fund.id) === -1 &&
                        availableFundIds.indexOf(fund.id) === -1;
                });

                // Requesting fund is disabled/not available, 
                // Implementation doesn't have funds where identity has vouchers (didn't received one during sign-up)
                if (!$ctrl.fundRequestIsAvailable($ctrl.fund) && fundsWithVouchers.length == 0 && fundsNoVouchers.length == 0) {
                    $ctrl.state = 'error_digid_no_funds';
                    return true;
                }

                if (fundsNoVouchers.length > 1 || (
                    (fundsNoVouchers.length === 1) && fundsNoVouchers[0].id != $ctrl.fund.id)) {
                    // Multiple funds are valid and ready to request or only one, but not the current target
                    $state.go('funds');
                } else if (fundsNoVouchers.length === 1) {
                    // Only one fund is valid and it's the target fund, reload state to get redirected to fund request
                    $state.go('fund-activate', {
                        fund_id: fundsNoVouchers[0].id,
                        digid_success: undefined,
                    }, {
                        reload: true
                    });
                } else if (!fundsValidCriteria.map(fund => fund.id).includes($ctrl.fund.id)) {
                    // The current fund is now available for request (possible because bsn is now available)
                    $state.go('fund-request', {
                        fund_id: $ctrl.fund.id
                    });
                } else if (fundsWithVouchers.length > 1) {
                    // Identity has no valid funds, but has multiple vouchers (possible received during digid sign-up)
                    $state.go('vouchers');
                } else if (fundsWithVouchers.length === 1) {
                    // Identity has no valid funds, but has one voucher (possible received during digid sign-up)
                    $state.go('voucher', {
                        address: vouchers.filter(
                            voucher => voucher.fund_id === fundsWithVouchers[0].id
                        )[0].address,
                    });
                } else {
                    // None of above
                    $state.go('funds');
                }

                return true;
            }
        }

        return false;
    };

    $ctrl.getFundVouchers = (fund, vouchers) => {
        return vouchers.filter(voucher => voucher.fund_id === fund.id && !voucher.expired);
    };

    $ctrl.getFirstFundVoucher = (fund, vouchers) => {
        let fundVouchers = $ctrl.getFundVouchers(fund, vouchers);

        if (fundVouchers.length > 0) {
            return fundVouchers[0];
        }

        return false;
    };

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

    $ctrl.fundRequestIsAvailable = (fund) => {
        return fund.allow_fund_requests && (!$ctrl.digidMandatory || ($ctrl.digidMandatory && $ctrl.bsnIsKnown));
    };

    $ctrl.$onInit = function() {
        const { backoffice_error, backoffice_fallback, backoffice_error_key } = $stateParams;
        const voucher = $ctrl.getFirstFundVoucher($ctrl.fund, $ctrl.vouchers);
        const pendingRequests = $ctrl.fundRequests ? $ctrl.fundRequests.data.filter(request => {
            return request.state === 'pending';
        }) : [];

        $ctrl.signedIn = AuthService.hasCredentials();
        $ctrl.bsnIsKnown = $ctrl.identity && $ctrl.identity.bsn;
        $ctrl.digidAvailable = $ctrl.appConfigs.features.digid;
        $ctrl.digidMandatory = $ctrl.appConfigs.features.digid_mandatory;
        $ctrl.autoValidation = $ctrl.fund.auto_validation;
        $ctrl.fundRequestAvailable = $ctrl.fundRequestIsAvailable($ctrl.fund);

        // The user is not authenticated and have to go back to sign-up page
        if (!$ctrl.signedIn || !$ctrl.identity) {
            return $state.go('start');
        }

        // Voucher already received, go to the voucher
        if (voucher && !$ctrl.hasDigiDResponse($stateParams)) {
            return $state.go('voucher', voucher);
        }

        // The fund is already taken by identity partner
        if ($ctrl.fund.taken_by_partner) {
            return $ctrl.state = 'taken_by_partner';
        }

        // Backoffice not responding and fallback is disabled
        if (backoffice_error == 1 && backoffice_fallback == 0) {
            return $ctrl.state = 'backoffice_error_' + (backoffice_error_key ? backoffice_error_key : 'not_eligible');
        }

        // Fund requesting is not available after successfull signin with DigiD
        if (backoffice_error == 2) {
            return $ctrl.state = 'error_digid_no_funds';
        }

        $ctrl.getFunds(fund => fund).then(funds => {
            // The request has digid auth success or error meta
            if ($ctrl.hasDigiDResponse($stateParams) && $ctrl.handleDigiDResponse($stateParams, funds)) {
                return;
            }

            // Initialize pre-validations pin-code form control
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
                return $ctrl.applyFund($ctrl.fund).then(voucher => {
                    $state.go('voucher', voucher);
                });
            }

            if ($ctrl.digidAvailable) {
                $ctrl.state = 'digid_login';
            } else if ($ctrl.fund.allow_prevalidations) {
                $ctrl.state = 'pincode_activate';
            } else if ($ctrl.fund.allow_fund_requests) {
                return $state.go('fund-request', {
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
        'FormBuilderService',
        'DigIdService',
        'ModalService',
        'appConfigs',
        FundActivateComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-activate.html',
};
