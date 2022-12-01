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
        ReimbursementService.notes($ctrl.organization.id, $ctrl.reimbursement.id, query).then((res) => {
            $ctrl.notes = res.data;
        })
    }

    $ctrl.deleteNote = (note) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => {
                ReimbursementService.noteDestroy($ctrl.organization.id, $ctrl.reimbursement.id, note.id).then(() => {
                    $ctrl.onNotePageChange($ctrl.notesFilters);
                    PushNotificationsService.success('Gelukt!', 'Notitie verwijderd.');
                }, (res) => {
                    PushNotificationsService.danger('Foutmelding!', res.data.message);
                });
            }
        });
    }

    $ctrl.addNote = () => {
        ModalService.open('addNoteComponent', {
            title: null,
            description: 'De notitie is alleen zichtbaar voor medewerkers met dezelfde rechten.',
            onSubmit: (form, modal) => {
                modal.submitting = true;
                PageLoadingBarService.setProgress(0);

                return ReimbursementService.storeNote(
                    $ctrl.organization.id,
                    $ctrl.reimbursement.id,
                    form.values,
                ).then(() => {
                    form.errors = null;
                    modal.close();
                    $ctrl.onNotePageChange($ctrl.notesFilters);
                }, (res) => {
                    form.errors = res.data.errors;
                    form.unlock();
                }).finally(() => {
                    PageLoadingBarService.setProgress(100);
                    modal.submitting = false;
                });
            }
        });
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