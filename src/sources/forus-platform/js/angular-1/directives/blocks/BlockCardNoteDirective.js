const BlockCardNoteDirective = function (
    $scope,
    $filter,
    ModalService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const { $dir } = $scope;

    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_note.${key}`);

    $dir.notesFilters = {
        q: '',
        per_page: 10,
    };

    $dir.onNotePageChange = (query = {}) => {
        $dir.fetchNotes({ query }).then((res) => $dir.notes = res.data);
    }

    $dir.onDeleteNote = (note) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            text_align: 'center',
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => {
                $dir.deleteNote({ note: note }).then(() => {
                    $dir.onNotePageChange($dir.notesFilters);
                    PushNotificationsService.success('Gelukt!', 'Notitie verwijderd.');
                }, (res) => {
                    PushNotificationsService.danger('Foutmelding!', res.data.message);
                });
            }
        });
    }

    $dir.onAddNote = () => {
        ModalService.open('addNoteComponent', {
            title: null,
            description: 'De notitie is alleen zichtbaar voor medewerkers met dezelfde rechten.',
            onSubmit: (form, modal) => {
                modal.submitting = true;
                PageLoadingBarService.setProgress(0);

                $dir.storeNote({ data: form.values }).then(() => {
                    $dir.onNotePageChange($dir.notesFilters);
                    form.errors = null;
                    modal.close();
                }, (res) => {
                    form.errors = res.data.errors;
                    form.unlock();
                }).finally(() => {
                    PageLoadingBarService.setProgress(100);
                    modal.submitting = false;
                });
            }
        });

        $dir.onNotePageChange($dir.notesFilters);
    };

    $dir.$onInit = () => {
        $dir.onNotePageChange($dir.notesFilters);
    };
};

module.exports = () => {
    return {
        scope: {
            isAssigned: '=',
            storeNote: '&',
            deleteNote: '&',
            fetchNotes: '&',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'ModalService',
            'PageLoadingBarService',
            'PushNotificationsService',
            BlockCardNoteDirective,
        ],
        templateUrl: 'assets/tpl/directives/blocks/block-card-note.html',
    };
};