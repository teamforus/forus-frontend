let FundRequestClarificationComponent = function(
    $q,
    $state,
    $stateParams,
    AuthService,
    FormBuilderService,
    FundRequestClarificationService,
    FileService
) {
    let $ctrl = this;

    $ctrl.state = 'clarification_form';
    $ctrl.totalSteps = 1;
    $ctrl.invalidCriteria = [];
    $ctrl.authToken = false;
    $ctrl.signedIn = false;
    $ctrl.authEmailSent = false;
    $ctrl.authEmailRestoreSent = false;
    $ctrl.recordsSubmitting = false;
    $ctrl.files = [];
    $ctrl.errorReason = false;
    $ctrl.finishError = false;

    // Submit or Validate record criteria
    $ctrl.uploadFormFiles = (form) => {
        return $q((resolve, reject) => {
            $ctrl.recordsSubmitting = true;

            FileService.storeAll(
                form.values.rawFiles || [],
                'fund_request_clarification_proof'
            ).then(res => {
                form.values.files = res.map(file => file.data.data);
                resolve(form);
            }, res => {
                reject(form.errors = res.data.errors);
            });
        });
    };

    // Initialize authorization form
    $ctrl.initForm = () => {
        $ctrl.form = FormBuilderService.build({
            rawFiles: [],
            files: [],
            answer: ''
        }, function(form) {
            $ctrl.uploadFormFiles(form).then(res => {
                FundRequestClarificationService.update(
                    $stateParams.fund_id,
                    $stateParams.request_id,
                    $stateParams.clarification_id, {
                        files: form.values.files.map(file => file.uid),
                        answer: form.values.answer,
                    }
                ).then(res => {
                    $ctrl.state = 'done';
                }, (res) => {
                    form.errors = res.data.errors;
                    form.unlock();
                });
            });
        }, true);
    };

    $ctrl.finish = () => {
        $state.go('home');
    };

    $ctrl.$onInit = function() {
        if (!AuthService.hasCredentials()) {
            alert('Please log in first.');
            $state.go('home');
        }

        if ($ctrl.clarification.state != 'pending') {
            return $ctrl.state = 'not_pending';
        }

        $ctrl.initForm();
    };
};

module.exports = {
    bindings: {
        records: '<',
        recordTypes: '<',
        clarification: '<',
        fund: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'AuthService',
        'FormBuilderService',
        'FundRequestClarificationService',
        'FileService',
        FundRequestClarificationComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-request-clarification.html'
};