let SignUpComponent = function(
    $state,
    $rootScope,
    VoucherService,
    AuthService,
    IdentityService,
    FormBuilderService,
    DigIdService,
    appConfigs
) {
    let $ctrl = this;
    let authTokenSubscriber = AuthService.accessTokenSubscriber();

    $ctrl.step = 0;
    $ctrl.state = '';
    $ctrl.authToken = false;
    $ctrl.signedIn = false;
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;
    $ctrl.hasApp = false;
    $ctrl.digidAvailable = appConfigs.features.digid;

    // Initialize authorization form
    $ctrl.initAuthForm = () => {
        let target = 'fundRequest';

        $ctrl.authForm = FormBuilderService.build({
            email: '',
            target: target,
        }, async (form) => {
            if (!$ctrl.authForm.autofill && appConfigs.flags.privacyPage && !form.values.privacy) {
                return form.unlock();
            }

            let handleErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors ? res.data.errors : { email: [res.data.message] };
                $ctrl.authForm.autofill = false;
            };

            const used = !$ctrl.authForm.autofill && await new Promise((resolve) => {
                IdentityService.validateEmail(form.values).then(res => {
                    resolve(res.data.email.used);
                }, handleErrors);
            });

            if (used) {
                IdentityService.makeAuthEmailToken(form.values.email, target).then(() => {
                    $ctrl.authEmailRestoreSent = true;
                    $ctrl.nextStep();
                }, handleErrors);
            } else {
                IdentityService.make(form.values).then(() => {
                    $ctrl.authEmailSent = true;
                    $ctrl.nextStep();
                }, handleErrors);
            }
        }, true);

        $ctrl.authForm.autofill = false;
    };

    // Show qr code or email input
    $ctrl.setHasAppProp = (hasApp) => {
        $ctrl.hasApp = hasApp;

        if ($ctrl.hasApp) {
            $ctrl.requestAuthQrToken();
        } else {
            authTokenSubscriber.stopCheckAccessTokenStatus();
        }
    };

    $ctrl.startDigId = () => {
        DigIdService.startAuthRestore().then(
            (res) => document.location = res.data.redirect_url,
            (res) => $state.go('error', {
                errorCode: res.headers('Error-Code')
            }),
        );
    }

    // Request auth token for the qr-code
    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;
            authTokenSubscriber.checkAccessTokenStatus(res.data.access_token, () => $ctrl.onSignedIn());
        }, console.error);
    };

    // Transform step number to human readable state
    $ctrl.step2state = (step) => {
        if (step == 0) {
            return 'loading';
        }

        if (step == 1) {
            return 'auth';
        }

        if (step == 2 && ($ctrl.authEmailSent || $ctrl.authEmailRestoreSent)) {
            return 'auth_email_sent';
        }

        if (step == 3) {
            return 'digid';
        }

        return 'done';
    };

    $ctrl.setStep = (step) => {
        $ctrl.step = step;
        $ctrl.updateState();
    };

    $ctrl.nextStep = () => $ctrl.setStep($ctrl.step + 1);
    $ctrl.prevStep = () => $ctrl.setStep($ctrl.step - 1);

    $ctrl.setRestoreWithDigiD = () => $ctrl.setStep(3);
    $ctrl.updateState = () => $ctrl.state = $ctrl.step2state($ctrl.step);

    $ctrl.onSignedIn = () => {
        VoucherService.list({
            per_page: 100,
        }).then((res) => {
            const vouchers = res.data.data;
            const takenFundIds = vouchers.map(voucher => voucher.fund_id && !voucher.expired);

            const funds = $ctrl.funds.filter(fund => fund.allow_direct_requests);
            const fundsNoVouchers = funds.filter(fund => takenFundIds.indexOf(fund.id) === -1);
            const fundsWithVouchers = funds.filter(fund => takenFundIds.indexOf(fund.id) !== -1);

            if (appConfigs.flags.activateFirstFund && fundsNoVouchers.length > 1) {
                $state.go('fund-activate', {
                    fund_id: fundsNoVouchers[0].id
                });
            } else if (fundsNoVouchers.length > 1) {
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
        });
    };

    $ctrl.$onInit = function() {
        const { logout, restore_with_digid, email_address } = $ctrl.$transition$.params();

        $ctrl.signedIn = AuthService.hasCredentials();

        if ($ctrl.signedIn && logout) {
            return $rootScope.signOut(null, false, true, () => $state.go('start', {restore_with_digid: 1}, { inherit: false }));
        }

        if ($ctrl.signedIn) {
            $ctrl.onSignedIn();
        } else {
            $ctrl.initAuthForm();
            $ctrl.setStep(1);

            if (restore_with_digid){
                $ctrl.setRestoreWithDigiD();
            }

            if (email_address) {
                $ctrl.authForm.values.email = email_address;
                $ctrl.authForm.autofill = true;
                $ctrl.authForm.submit();
            }
        }
    };

    $ctrl.$onDestroy = () => authTokenSubscriber.stopCheckAccessTokenStatus();
};

module.exports = {
    bindings: {
        funds: '<',
        recordTypes: '<',
        $transition$: '<',
    },
    controller: [
        '$state',
        '$rootScope',
        'VoucherService',
        'AuthService',
        'IdentityService',
        'FormBuilderService',
        'DigIdService',
        'appConfigs',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up.html'
};