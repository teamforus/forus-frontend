const FundActivateComponent = function (
    $q,
    $state,
    $stateParams,
    $timeout,
    FundService,
    PushNotificationsService,
    FormBuilderService,
    IdentityService,
    DigIdService,
    ModalService,
    appConfigs
) {
    const $ctrl = this;

    $ctrl.state = '';
    $ctrl.bsnIsKnown = false;
    $ctrl.appConfigs = appConfigs;

    // Start digid sign-in
    $ctrl.startDigId = () => {
        DigIdService.startFundRequest($ctrl.fund.id).then(
            (res) => document.location = res.data.redirect_url,
            (res) => {
                if (res.status === 403 && res.data.message) {
                    return PushNotificationsService.danger(res.data.message);
                }

                $state.go('error', { errorCode: res.headers('Error-Code') });
            }
        );
    };

    // Apply for the fund
    $ctrl.applyFund = function (fund) {
        return $q((resolve, reject) => {
            FundService.apply(fund.id).then((res) => {
                const voucher = res.data.data;

                PushNotificationsService.success(`Succes! ${voucher.fund.name} tegoed geactiveerd!`);
                resolve(voucher);
            }, (res) => {
                PushNotificationsService.danger(res.data.message);
                reject(res);
            });
        });
    };

    $ctrl.setState = (state) => {
        $ctrl.state = state;
    };

    $ctrl.getFunds = () => {
        return FundService.list(null, {
            check_criteria: 1,
        }).then((res) => res.data.data);
    }

    $ctrl.getApplicableFunds = () => {
        const alreadyAppliedFunds = $ctrl.vouchers.map((voucher) => voucher.fund_id);

        return $ctrl.getFunds().then((funds) => {
            return funds
                .filter((fund) => !alreadyAppliedFunds.includes(fund.id))
                .filter((fund) => fund.criteria.filter((criterion) => !criterion.is_valid).length == 0);
        });
    };

    $ctrl.redeemCode = (form, code) => {
        form.lock();
        form.enabled = false;

        FundService.redeem(code).then(res => {
            if (res.data.vouchers.length > 0) {
                if (res.data.vouchers.length === 1) {
                    return $state.go('voucher', res.data.vouchers[0]);
                }

                return $state.go('vouchers');
            }

            if (res.data.prevalidation) {
                $ctrl.getApplicableFunds().then((funds) => {
                    if (funds.length == 0) {
                        $state.go('funds');
                    }

                    Promise.all(funds.map((fund) => $ctrl.applyFund(fund))).then((vouchers) => {
                        if (vouchers.length == 0) {
                            return $state.go('funds');
                        }

                        if (vouchers.length == 1) {
                            return $state.go('voucher', vouchers[0]);
                        }

                        return $state.go('vouchers');
                    });
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
        }, function (form) {
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

    $ctrl.confirmCriteria = () => {
        $ctrl.checkFund();
    };

    $ctrl.selectDigiDOption = () => {
        const hasCustomCriteria = ['bus_2020', 'meedoen'].includes($ctrl.fund.key);
        const autoValidation = $ctrl.fund.auto_validation;

        //- Show custom criteria screen
        if (autoValidation && $ctrl.digidAvailable && hasCustomCriteria) {
            return $ctrl.setState('digid');
        }

        $ctrl.checkFund();
    };

    $ctrl.checkFund = (fromDigid = false) => {
        IdentityService.identity().then((res) => {
            const identity = res.data;
            const timeToSkipBsn = $ctrl.getTimeToSkipDigid(identity);

            if (!fromDigid && (timeToSkipBsn === null || timeToSkipBsn <= 0)) {
                return $ctrl.startDigId();
            }

            FundService.check($ctrl.fund.id).then((res) => {
                const { backoffice } = res.data;
                const { backoffice_error, backoffice_fallback, backoffice_error_key } = backoffice || {};

                // Backoffice not responding and fallback is disabled
                if (backoffice && backoffice_error == 1 && backoffice_fallback == 0) {
                    return $ctrl.setState('backoffice_error_' + (backoffice_error_key ? backoffice_error_key : 'not_eligible'));
                }

                // Fund requesting is not available after successful signing with DigiD
                if (backoffice && backoffice_error == 2) {
                    return $ctrl.setState('error_digid_no_funds');
                }

                $state.go('fund-request', { id: $ctrl.fund.id, from: 'fund-activate' });
            }, (res) => {
                if (res.status === 403 && res.data.message) {
                    PushNotificationsService.danger(res.data.message);
                }

                if (res.data.meta || res.status == 429) {
                    ModalService.open('modalNotification', {
                        type: 'info',
                        title: res.data.meta.title,
                        description: res.data.meta.message.split("\n"),
                    });
                }

                $state.go('fund-activate', { ...$stateParams, digid_error: undefined, digid_success: undefined }, { reload: true });
            });
        });
    }

    $ctrl.hasDigiDResponse = ($stateParams) => {
        return $stateParams.digid_error || $stateParams.digid_success;
    };

    $ctrl.handleDigiDResponse = ($stateParams) => {
        // got digid error, abort
        if ($stateParams.digid_error) {
            if ($stateParams.digid_error === 'error_0040') {
                PushNotificationsService.info(
                    'DigiD - Inlogpoging geannuleerd.',
                    'U hebt deze inlogpoging geannuleerd. Probeer eventueel opnieuw om verder te gaan.'
                );

                $state.go('fund-activate', { ...$stateParams, digid_error: undefined }, { reload: true });
            } else {
                $state.go('error', { errorCode: `digid_${$stateParams.digid_error}`, hideHomeLinkButton: true });
            }
        }

        // digid sign-in flow
        if ($stateParams.digid_success == 'signed_up' || $stateParams.digid_success == 'signed_in') {
            PushNotificationsService.success('Succes! Ingelogd met DigiD.');

            $ctrl.checkFund(true);
        }
    };

    $ctrl.getFirstFundVoucher = (fund, vouchers) => {
        return vouchers.find(voucher => voucher.fund_id === fund.id && !voucher.expired);
    };

    $ctrl.prepareCriterionMeta = (pendingRequest, criteria) => {
        return criteria.map((criterion) => ({
            ...criterion,
            request_state: pendingRequest.records.find((record) => record.fund_criterion_id == criterion.id)?.state
        }));
    };

    $ctrl.fundRequestIsAvailable = (fund) => {
        return fund.allow_fund_requests && (!$ctrl.digidMandatory || ($ctrl.digidMandatory && $ctrl.bsnIsKnown));
    };

    $ctrl.getAvailableOptions = () => {
        const options = [];

        if ($ctrl.fund.allow_prevalidations) {
            options.push('code');
        }

        if ($ctrl.digidAvailable) {
            options.push('digid');
        }

        if (!$ctrl.digidAvailable && !$ctrl.digidMandatory && $ctrl.fund.allow_fund_requests) {
            options.push('request');
        }

        return options;
    };

    $ctrl.initState = () => {
        $ctrl.options = $ctrl.getAvailableOptions();

        if ($ctrl.options.length == 0) {
            return $state.go('funds');
        }

        if ($ctrl.options[0] === 'request') {
            return $state.go('fund-request', $ctrl.fund);
        }

        if ($ctrl.options.length === 1) {
            return $ctrl.setState($ctrl.options[0]);
        }

        if ($state.params.option && $ctrl.options.includes($state.params.option)) {
            return $ctrl.setState($state.params.option);
        }

        $ctrl.setState('select');
    };

    $ctrl.getTimeToSkipDigid = (identity) => {
        const timeOffset = appConfigs.bsn_confirmation_offset || 300;

        if ($ctrl.fund.bsn_confirmation_time === null) {
            return null;
        }

        return Math.max($ctrl.fund.bsn_confirmation_time - (identity.bsn_time + timeOffset), 0);
    }

    $ctrl.initBsnSkip = () => {
        const timeToSkipBsn = $ctrl.getTimeToSkipDigid($ctrl.identity);
        const canSkipDigid = timeToSkipBsn && timeToSkipBsn > 0;

        $ctrl.canSkipDigid = canSkipDigid;

        if ($ctrl.canSkipDigid && $ctrl.identity.bsn_time) {
            $timeout(() => $ctrl.canSkipDigid = false, timeToSkipBsn * 1000);
        }
    };

    $ctrl.$onInit = function () {
        const voucher = $ctrl.getFirstFundVoucher($ctrl.fund, $ctrl.vouchers);
        const pendingRequest = $ctrl.fundRequests?.data.find((request) => request.state === 'pending');
        const hasDigiDResponse = $ctrl.hasDigiDResponse($stateParams);

        $ctrl.bsnIsKnown = $ctrl.identity && $ctrl.identity.bsn;
        $ctrl.digidAvailable = $ctrl.configs.digid;
        $ctrl.digidMandatory = $ctrl.configs.digid_mandatory;
        $ctrl.fundRequestAvailable = $ctrl.fundRequestIsAvailable($ctrl.fund);

        // The user is not authenticated and have to go back to sign-up page
        if (!$ctrl.identity) {
            return $state.go('start');
        }

        // The request has digid auth success or error meta
        if (hasDigiDResponse) {
            return $ctrl.handleDigiDResponse($stateParams);
        }

        // Voucher already received, go to the voucher
        if (voucher) {
            return $state.go('voucher', voucher);
        }

        // The fund is already taken by identity partner
        if ($ctrl.fund.taken_by_partner) {
            return $ctrl.setState('taken_by_partner');
        }

        // Initialize pre-validations pin-code form control
        if ($ctrl.fund.allow_prevalidations) {
            $ctrl.initPrevalidationsForm();
        }

        // Fund request already in progress
        if (pendingRequest) {
            $ctrl.fund.criteria = $ctrl.prepareCriterionMeta(pendingRequest, $ctrl.fund.criteria);
            return $ctrl.setState('fund_already_applied');
        }

        // All the criteria are meet, request the voucher
        if ($ctrl.fund.criteria.filter((criterion) => !criterion.is_valid).length == 0) {
            return $ctrl.applyFund($ctrl.fund).then((voucher) => $state.go('voucher', voucher));
        }

        $ctrl.initState();
        $ctrl.initBsnSkip();
    };
};

module.exports = {
    bindings: {
        fund: '<',
        configs: '<',
        vouchers: '<',
        identity: '<',
        fundRequests: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        '$timeout',
        'FundService',
        'PushNotificationsService',
        'FormBuilderService',
        'IdentityService',
        'DigIdService',
        'ModalService',
        'appConfigs',
        FundActivateComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-activate.html',
};
