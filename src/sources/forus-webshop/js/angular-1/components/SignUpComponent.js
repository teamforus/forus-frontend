const SignUpStartComponent = function (
    $state,
    $filter,
    $timeout,
    $rootScope,
    appConfigs,
    AuthService,
    DigIdService,
    IdentityService,
    FormBuilderService,
    PageLoadingBarService,
) {
    const $ctrl = this;
    const $i18n = $filter('i18n');
    const authTokenSubscriber = AuthService.accessTokenSubscriber();

    $ctrl.state = null;
    $ctrl.authToken = null;

    $ctrl.authEmailRestoreSent = false;
    $ctrl.authEmailConfirmationSent = false;

    $ctrl.hasPrivacy = false;

    $ctrl.onSignedIn = () => {
        const { redirect_scope } = $state.params;

        // Redirect user to fund request clarification
        if (redirect_scope?.target_name == 'requestClarification') {
            return $state.go('fund-request-clarification', redirect_scope?.target_params);
        }

        // Load vouchers list to decide where to redirect the user
        AuthService.onAuthRedirect();
    };

    // Initialize authorization form
    $ctrl.initAuthForm = (redirect_scope = null) => {
        const target = redirect_scope ? redirect_scope : 'fundRequest';

        $ctrl.authForm = FormBuilderService.build({
            email: '',
            target: target,
        }, async (form) => {
            if (!form.values.privacy && $ctrl.hasPrivacy) {
                // prevent submit if policy exist and not checked
                form.unlock();
                return;
            }

            const handleErrors = (res) => {
                form.unlock();
                form.errors = res.data.errors ? res.data.errors : { email: [res.data.message] };
                $ctrl.authForm.autofill = false;
            };

            const used = !$ctrl.authForm.autofill && await new Promise((resolve) => {
                IdentityService.validateEmail(form.values).then(res => {
                    resolve(res.data.email.used);
                }, handleErrors);
            });

            PageLoadingBarService.setProgress(0);

            if (used) {
                return IdentityService.makeAuthEmailToken(form.values.email, target).then(() => {
                    $ctrl.authEmailConfirmationSent = true;
                    $ctrl.setState('email');
                }, handleErrors).finally(() => PageLoadingBarService.setProgress(100));
            }

            IdentityService.make(form.values).then(() => {
                $ctrl.authEmailRestoreSent = true;
                $ctrl.setState('email');
            }, handleErrors).finally(() => PageLoadingBarService.setProgress(100));
        }, true);

        $ctrl.authForm.autofill = false;
    };

    $ctrl.startDigId = () => {
        $ctrl.loading = true;
        PageLoadingBarService.setProgress(0);

        DigIdService.startAuthRestore().then(
            (res) => document.location = res.data.redirect_url,
            (res) => $state.go('error', { errorCode: res.headers('Error-Code') }),
        ).finally(() => $timeout(() => {
            $ctrl.loading = false;
            PageLoadingBarService.setProgress(100);
        }, 500));
    }

    // Show qr code or email input
    $ctrl.setState = (state) => {
        $ctrl.state = state;
        $ctrl.hasPrivacy = hasPrivacyCheck();

        if ($ctrl.state == 'qr') {
            $ctrl.requestAuthQrToken();
        } else {
            authTokenSubscriber.stopCheckAccessTokenStatus();
        }
    };

    // Request auth token for the qr-code
    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;
            authTokenSubscriber.checkAccessTokenStatus(res.data.access_token, $ctrl.onSignedIn);
        }, console.error);
    };

    const hasPrivacyCheck = () => {
        return $rootScope.appConfigs.flags.privacyPage && (
            !$ctrl.appConfigs.flags.startPage.combineColumns || $ctrl.state === 'email'
        );
    }

    $ctrl.$onInit = () => {
        const { logout, restore_with_digid, restore_with_email, email_address, redirect_scope } = $state.params;
        const signedIn = AuthService.hasCredentials();

        const target = redirect_scope?.target_name == 'requestClarification' ? [
            redirect_scope?.target_name,
            redirect_scope?.target_params.fund_id,
            redirect_scope?.target_params.request_id,
            redirect_scope?.target_params.clarification_id
        ].join('-') : null

        $ctrl.appConfigs = appConfigs;

        if (logout) {
            $rootScope.signOut(null, false, true, false);
            $state.go('start', { restore_with_digid, email_address }, { inherit: false, location: 'replace' });
            return;
        }

        if (signedIn) {
            return $ctrl.onSignedIn();
        }

        if (restore_with_digid) {
            return $ctrl.startDigId();
        }

        $ctrl.initAuthForm(target);
        $ctrl.setState('start');

        if (email_address) {
            $ctrl.authForm.values.email = email_address;
            $ctrl.authForm.autofill = true;
            $ctrl.authForm.submit();
        }

        if (restore_with_email) {
            $ctrl.setState('email');
        }
    };

    const translationKey = `signup.items.${$rootScope.client_key}.title`;
    $rootScope.pageTitle = $i18n(translationKey) != translationKey ? $i18n(translationKey) : 'Inloggen';

    $ctrl.$onDestroy = () => authTokenSubscriber.stopCheckAccessTokenStatus();
};

module.exports = {
    controller: [
        '$state',
        '$filter',
        '$timeout',
        '$rootScope',
        'appConfigs',
        'AuthService',
        'DigIdService',
        'IdentityService',
        'FormBuilderService',
        'PageLoadingBarService',
        SignUpStartComponent,
    ],
    templateUrl: 'assets/tpl/pages/sign-up.html',
};