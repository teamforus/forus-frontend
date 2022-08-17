let FundRequestClarificationComponent = function(
    $state,
    $stateParams,
    AuthService,
    FormBuilderService,
    FundRequestClarificationService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.state = 'clarification_form';
    $ctrl.invalidCriteria = [];
    $ctrl.authToken = false;
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;
    $ctrl.recordsSubmitting = false;
    $ctrl.files = [];
    $ctrl.errorReason = false;
    $ctrl.finishError = false;

    $ctrl.onFileInfo = (files) => {
        $ctrl.form.values.files = files.filter(
            (item) => item.uploaded && item.file_uid
        ).map(file => file.file_uid);

        $ctrl.isUploadingFiles = files.filter(
            (item) => item.uploading
        ).length > 0;
    };

    // Initialize authorization form
    $ctrl.initForm = () => {
        $ctrl.form = FormBuilderService.build({
            files: [],
            answer: ''
        }, (form) => {
            FundRequestClarificationService.update(
                $stateParams.fund_id,
                $stateParams.request_id,
                $stateParams.clarification_id,
                form.values
            ).then(() => $ctrl.state = 'done', (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.finish = () => {
        $state.go('home');
    };

    $ctrl.$onInit = function() {
        if (!AuthService.hasCredentials()) {
            let params = angular.copy($stateParams);

            $state.go('home').then(() => {
                ModalService.open('identityProxyExpired', {
                    has_redirect: true,
                    target_name: 'requestClarification',
                    target_params: {
                        fund_id: params.fund_id,
                        request_id: params.request_id,
                        clarification_id: params.clarification_id,
                    }
                });
            });
        }

        if ($ctrl.clarification.state != 'pending') {
            return $ctrl.state = 'not_pending';
        }

        $ctrl.initForm();
    };
};

module.exports = {
    bindings: {
        clarification: '<',
        fund: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'AuthService',
        'FormBuilderService',
        'FundRequestClarificationService',
        'ModalService',
        FundRequestClarificationComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-request-clarification.html'
};