const ReimbursementsShowComponent = function (
    $filter,
    FileService,
    ModalService,
    ReimbursementService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    
    const $translateDangerZone = (key) => $translate(
        'modals.danger_zone.remove_reimbursement_note.' + key
    );

    $ctrl.notesFilters = {
        q: '',
        per_page: 10,
    };

    $ctrl.updateReimbursement = (res) => {
        $ctrl.reimbursement = res.data.data;
        $ctrl.onNotePageChange($ctrl.notesFilters);
    };

    $ctrl.handleOnReimbursementUpdated = (promise, successMessage = null) => {
        PageLoadingBarService.setProgress(0);

        promise.then((res) => {
            $ctrl.updateReimbursement(res);
            PushNotificationsService.success('Success!', successMessage);
        }, (res) => {
            PushNotificationsService.danger(res.data.title || 'Foutmelding!', res.data.message || 'Onbekende foutmelding!');
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.assign = () => {
        $ctrl.handleOnReimbursementUpdated(
            ReimbursementService.assign($ctrl.organization.id, $ctrl.reimbursement.id),
            'Declaratie verzoek toegewezen.',
        );
    };

    $ctrl.resign = () => {
        $ctrl.handleOnReimbursementUpdated(
            ReimbursementService.resign($ctrl.organization.id, $ctrl.reimbursement.id),
            'Declaratie verzoek niet meer toegewezen.',
        );
    };

    $ctrl.approve = () => {
        ModalService.open('reimbursementResolveComponent', {
            state: 'approved',
            organization: $ctrl.organization,
            reimbursement: $ctrl.reimbursement,
            onSubmitted: (res) => $ctrl.updateReimbursement(res),
        });
    };

    $ctrl.decline = () => {
        ModalService.open('reimbursementResolveComponent', {
            state: 'declined',
            organization: $ctrl.organization,
            reimbursement: $ctrl.reimbursement,
            onSubmitted: (res) => $ctrl.updateReimbursement(res),
        });
    };

    $ctrl.hasFilePreview = (file) => {
        return ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext);
    }

    $ctrl.previewFile = ($event, file) => {
        $event.originalEvent.preventDefault();
        $event.originalEvent.stopPropagation();

        if (file.ext == 'pdf') {
            FileService.download(file).then(res => {
                ModalService.open('pdfPreview', { rawPdfFile: res.data });
            }, console.error);
        } else if (['png', 'jpeg', 'jpg'].includes(file.ext)) {
            ModalService.open('imagePreview', { imageSrc: file.url });
        }
    };

    $ctrl.onNotePageChange = (query = {}) => {
        return ReimbursementService.notes($ctrl.organization.id, $ctrl.reimbursement.id, query);
    }

    $ctrl.deleteNote = (note) => {
        return ReimbursementService.noteDestroy($ctrl.organization.id, $ctrl.reimbursement.id, note.id);
    }

    $ctrl.addNote = (data) => {
        return ReimbursementService.storeNote($ctrl.organization.id, $ctrl.reimbursement.id, data);
    };

    $ctrl.$onInit = function () {
        $ctrl.onNotePageChange($ctrl.notesFilters);
    }
};

module.exports = {
    bindings: {
        reimbursement: '<',
        organization: '<',
        notes: '<',
    },
    controller: [
        '$filter',
        'FileService',
        'ModalService',
        'ReimbursementService',
        'PageLoadingBarService',
        'PushNotificationsService',
        ReimbursementsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/reimbursements-show.html',
};