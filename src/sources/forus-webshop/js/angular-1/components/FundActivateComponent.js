const FundActivateComponent = function (
    $q,
    $state,
    $stateParams,
    $timeout,
    $interval,
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
    $ctrl.bsnFlagsInterval = null;

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

    $ctrl.redeemCode = (form, code) => {
        form.lock();
        form.enabled = false;

        FundService.redeem(code).then(res => {
            if (res.data.vouchers.length === 1) {
                return $state.go('voucher', res.data.vouchers[0]);
            }

            return res.data.vouchers.length > 0 ? $state.go('vouchers') : $state.go('funds');
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
                    header: 'Error',
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
        const hasCustomCriteria = ['IIT', 'bus_2020', 'meedoen'].includes($ctrl.fund.key);
        const autoValidation = $ctrl.fund.auto_validation;

        //- Show custom criteria screen
        if (autoValidation && $ctrl.digidAvailable && hasCustomCriteria) {
            if ($ctrl.timeToSkipBsnSoft > 0) {
                return $ctrl.setState('digid');
            }

            return $ctrl.startDigId();
        }

        $ctrl.checkFund();
    };

    $ctrl.checkFund = (fromDigid = false) => {
        if ($ctrl.fetchingData) {
            return;
        }

        $ctrl.fetchingData = true;

        IdentityService.identity().then((res) => {
            const identity = res.data;
            const timeToSkipBsn = $ctrl.getTimeToSkipDigid(identity);

            if (!fromDigid && (timeToSkipBsn === null || timeToSkipBsn <= 0)) {
                return $ctrl.startDigId();
            }

            FundService.check($ctrl.fund.id).then((res) => {
                const { backoffice, prevalidations, vouchers, prevalidation_vouchers } = res.data;
                const { backoffice_error, backoffice_fallback, backoffice_error_key, backoffice_redirect } = backoffice || {};

                // Backoffice not responding and fallback is disabled
                if (backoffice && backoffice_error && !backoffice_fallback) {
                    return $ctrl.setState('backoffice_error_' + (backoffice_error_key ? backoffice_error_key : 'not_eligible'));
                }

                // Fund requesting is not available after successful signing with DigiD
                if (!prevalidations && !vouchers && !prevalidation_vouchers.length && !this.fundRequestIsAvailable($ctrl.fund)) {
                    return $ctrl.setState('error_not_available');
                }

                // User is not eligible and has to be redirected
                if (backoffice_redirect) {
                    return document.location = backoffice_redirect;
                }

                if (prevalidation_vouchers.length > 0) {
                    if (prevalidation_vouchers.length === 1) {
                        return $state.go('voucher', prevalidation_vouchers[0]);
                    }

                    return $state.go('vouchers');
                }

                $state.go('fund-request', { id: $ctrl.fund.id, from: 'fund-activate' });
            }, (res) => {
                if (res.status === 403 && res.data.message) {
                    PushNotificationsService.danger(res.data.message);
                }

                if (res.data.meta || res.status == 429) {
                    ModalService.open('modalNotification', {
                        type: 'info',
                        header: res.data.meta.title,
                        description: res.data.meta.message.split("\n"),
                    });
                }

                $state.go('fund-activate', { ...$stateParams, digid_error: null, digid_success: null }, { reload: 'replace' });
            }).finally(() => {
                $ctrl.fetchingData = false;
            });;;
        });
    }

    $ctrl.hasDigiDResponse = ($stateParams) => {
        return $stateParams.digid_error || $stateParams.digid_success;
    };

    $ctrl.handleDigiDResponse = ($stateParams) => {
        // got digid error, abort
        if ($stateParams.digid_error) {
            $state.go('error', {
                errorCode: `digid_${$stateParams.digid_error}`,
                hideHomeLinkButton: true,
                customLink: $stateParams.digid_error === 'error_0040' ? {
                    sref: 'fund-activate',
                    srefParams: { fund_id: $stateParams.fund_id },
                    srefIcon: 'mdi-arrow-left',
                    text: "Ga terug naar de startpagina",
                    srefButton: true,
                } : null,
            });
        }

        // digid sign-in flow
        if ($stateParams.digid_success == 'signed_up' || $stateParams.digid_success == 'signed_in') {
            PushNotificationsService.success('Succes! Ingelogd met DigiD.');

            $state.go('fund-activate', { ...$stateParams, digid_success: null }, { location: 'replace' });
            $ctrl.selectDigiDOption();
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

        if ($ctrl.options.length === 1 && $ctrl.options[0] !== 'digid') {
            return $ctrl.setState($ctrl.options[0]);
        }

        if ($state.params.option && $ctrl.options.includes($state.params.option)) {
            return $ctrl.setState($state.params.option);
        }

        $ctrl.setState('select');
    };

    $ctrl.getTimeToSkipDigid = (identity, witOffset = true) => {
        const timeOffset = witOffset ? (appConfigs.bsn_confirmation_offset || 300) : 0;

        if ($ctrl.fund.bsn_confirmation_time === null || !identity.bsn) {
            return null;
        }

        return Math.max($ctrl.fund.bsn_confirmation_time - (identity.bsn_time + timeOffset), 0);
    }

    $ctrl.updateBsnSkipFlagsInterval = () => {
        const timeToSkipBsn = Math.max(($ctrl.skipBsnLimit - Date.now()) / 1000, 0);
        const timeToSkipBsnSoft = Math.max(($ctrl.skipBsnLimitSoft - Date.now()) / 1000, 0);

        $ctrl.timeToSkipBsn = timeToSkipBsn;
        $ctrl.timeToSkipBsnSoft = timeToSkipBsnSoft;

        if (!$ctrl.timeToSkipBsn || ($ctrl.timeToSkipBsn <= 0)) {
            if ($ctrl.state === 'digid') {
                $ctrl.setState('select');

                PushNotificationsService.info(
                    'DigiD session expired.',
                    'You need to confirm your Identity by DigiD again.',
                );
            }
        }
    }

    $ctrl.initBsnSkipFlagsInterval = () => {
        $ctrl.updateBsnSkipFlagsInterval();

        $interval.cancel($ctrl.bsnFlagsInterval);

        $ctrl.bsnFlagsInterval = $interval(() => {
            $ctrl.updateBsnSkipFlagsInterval();
        }, 1000)
    }

    $ctrl.$onInit = function () {
        const voucher = $ctrl.getFirstFundVoucher($ctrl.fund, $ctrl.vouchers);
        const pendingRequest = $ctrl.fundRequests?.data.find((request) => request.state === 'pending');
        const hasDigiDResponse = $ctrl.hasDigiDResponse($stateParams);

        // The user is not authenticated and have to go back to sign-up page
        if (!$ctrl.identity) {
            return $state.go('start');
        }

        $ctrl.skipBsnLimit = Date.now() + ($ctrl.getTimeToSkipDigid($ctrl.identity, false) * 1000);
        $ctrl.skipBsnLimitSoft = Date.now() + ($ctrl.getTimeToSkipDigid($ctrl.identity, true) * 1000);

        $ctrl.bsnIsKnown = $ctrl.identity && $ctrl.identity.bsn;
        $ctrl.digidAvailable = $ctrl.configs.digid;
        $ctrl.digidMandatory = $ctrl.configs.digid_mandatory;
        $ctrl.fundRequestAvailable = $ctrl.fundRequestIsAvailable($ctrl.fund);

        // initialize timeToSkipBsn and timeToSkipBsnSoft flags timeout and 
        // set initial state
        $ctrl.initBsnSkipFlagsInterval();
        $ctrl.initState();

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
            return $ctrl.applyFund($ctrl.fund).then(
                (voucher) => $state.go('voucher', voucher),
                () => $state.go('fund', $ctrl.fund)
            );
        }
    };

    $ctrl.$onDestroy = () => {
        $interval.cancel($ctrl.bsnFlagsInterval);
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
        '$interval',
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
