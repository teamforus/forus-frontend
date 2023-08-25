const FundRequestShowComponent = function(
    $state,
    FormBuilderService,
    FundRequestService,
    PushNotificationsService,
    FundRequestClarificationService
) {
    const $ctrl = this;
    $ctrl.showDeclinedNote = true;
    $ctrl.isUploadingFiles = false;
    $ctrl.files = [];

    const mapRecords = () => {
        $ctrl.fundRequest.records = $ctrl.fundRequest.records.map((record) => {
            record.notAnsweredCount = record.clarifications
                .filter((item) => item.state !== "answered")
                .length;

            return record;
        });
    };

    const closeAllRecords = () => {
        $ctrl.fundRequest.records = $ctrl.fundRequest.records.map((item) => {
            item.opened = false;

            return item;
        });
    }

    $ctrl.openRecord = (record) => {
        if (record.opened) {
            return closeAllRecords();
        }

        closeAllRecords();
        record.opened = true;
    }

    $ctrl.onFileInfo = (files) => {
        $ctrl.form.values.files = files.filter(
            (item) => item.uploaded && item.file_data?.uid
        ).map(file => file.file_data?.uid);

        $ctrl.isUploadingFiles = files.filter(
            (item) => item.uploading
        ).length > 0;
    };

    $ctrl.openReplyForm = (record, clarification) => {
        record.clarifications = record.clarifications.map((item) => {
            item.showAnswerForm = false;

            return item;
        });

        clarification.showAnswerForm = true;
        $ctrl.files = [];

        $ctrl.form = FormBuilderService.build({
            files: [],
            answer: ''
        }, (form) => {
            FundRequestClarificationService.update(
                $ctrl.fundRequest.fund_id,
                $ctrl.fundRequest.id,
                clarification.id,
                form.values
            ).then((res) => {
                PushNotificationsService.success('Succes!');

                record.clarifications = record.clarifications.map((item) => {
                    if (item.id === res.data.data.id) {
                        item = res.data.data;
                    }

                    return item;
                });

                mapRecords();
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.$onInit = function() {
        // The user has to sign-in first
        if (!$ctrl.identity) {
            return $state.go('start');
        }

        mapRecords();
    };
};

module.exports = {
    bindings: {
        identity: '<',
        fundRequest: '<',
    },
    controller: [
        '$state',
        'FormBuilderService',
        'FundRequestService',
        'PushNotificationsService',
        'FundRequestClarificationService',
        FundRequestShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-request-show.html',
};