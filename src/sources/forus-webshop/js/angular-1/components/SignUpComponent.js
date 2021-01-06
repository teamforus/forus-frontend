let SignUpComponent = function(
    $state,
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
        }, function(form) {
            let resolveErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors ? res.data.errors : { email: [res.data.message] };
            };

            IdentityService.validateEmail(form.values).then(res => {
                if (res.data.email.used) {
                    IdentityService.makeAuthEmailToken(form.values.email, target).then(() => {
                        $ctrl.authEmailRestoreSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                } else {
                    IdentityService.make(form.values).then(() => {
                        $ctrl.authEmailSent = true;
                        $ctrl.nextStep();
                    }, resolveErrors);
                }

            }, resolveErrors);
        }, true);
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

    $ctrl.setRestoreWithDigiD = () => {
        $ctrl.setStep(3);
    };

    // Request auth token for the qr-code
    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;
            authTokenSubscriber.checkAccessTokenStatus(res.data.access_token, () => $ctrl.onSignedIn());
        }, console.error);
    };

    $ctrl.startDigId = () => {
        DigIdService.startAuthRestore().then((res) => {
            document.location = res.data.redirect_url;
        }, res => {
            $ctrl.close();

            $state.go('error', {
                errorCode: res.headers('Error-Code')
            });
        });
    }

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

    $ctrl.updateState = () => $ctrl.state = $ctrl.step2state($ctrl.step);

    $ctrl.onSignedIn = () => {
        VoucherService.list({
            per_page: 1000,
        }).then((res) => {
            let vouchers = res.data.data;
            let takenFundIds = vouchers.map(voucher => voucher.fund_id && !voucher.expired);
            let fundsNoVouchers = $ctrl.funds.filter(fund => takenFundIds.indexOf(fund.id) === -1);
            let fundsWithVouchers = $ctrl.funds.filter(fund => takenFundIds.indexOf(fund.id) !== -1);

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
        $ctrl.signedIn = AuthService.hasCredentials();

        if ($ctrl.signedIn) {
            $ctrl.onSignedIn();
        } else {
            $ctrl.initAuthForm();
            $ctrl.setStep(1);
        }
    };

    $ctrl.$onDestroy = () => authTokenSubscriber.stopCheckAccessTokenStatus();
};

module.exports = {
    bindings: {
        funds: '<',
        recordTypes: '<'
    },
    controller: [
        '$state',
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