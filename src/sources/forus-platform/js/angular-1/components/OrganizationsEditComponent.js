const OrganizationsEditComponent = function(
    $q,
    $state,
    $rootScope,
    MediaService,
    FormBuilderService,
    OrganizationService
) {
    const $ctrl = this;
    const { apiResourceToForm } = OrganizationService;

    $ctrl.selectPhoto = (file) => {
        $ctrl.mediaFile = file;
    };

    $ctrl.uploadMedia = () => {
        return $q((resolve, reject) => {
            if (!$ctrl.mediaFile) {
                return resolve(null);
            }

            return MediaService.store('organization_logo', $ctrl.mediaFile, []).then((res) => {
                $ctrl.media = res.data.data;
                $ctrl.mediaFile = false;
                resolve($ctrl.media.uid);
            }, reject);
        });
    };

    $ctrl.makeValues = (organization) => {
        return $ctrl.organization ? apiResourceToForm(organization) : { website: 'https://' };
    };

    $ctrl.$onInit = () => {
        if (!$ctrl.organization) {
            OrganizationService.clearActive();
        }

        $ctrl.form = FormBuilderService.build($ctrl.makeValues($ctrl.organization), (form) => {
            const values = angular.copy(form.values);

            if (typeof (values.iban) === 'string') {
                values.iban = values.iban.replace(/\s/g, '');
            }

            $ctrl.uploadMedia().then((uid) => {
                values.media_uid = uid;

                const promise = $ctrl.organization ? OrganizationService.update(
                    $ctrl.organization.id, values
                ) : OrganizationService.store(values);

                promise.then(() => {
                    $state.go('organizations');
                    $rootScope.$broadcast('auth:update');
                }, (res) => {
                    form.errors = res.data.errors;
                }).finally(() => form.unlock());
            });
        }, true);

        if ($ctrl.organization && $ctrl.organization.logo) {
            MediaService.read($ctrl.organization.logo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }
    };
};

module.exports = {
    bindings: {
        organization: '<',
        businessTypes: '<'
    },
    controller: [
        '$q',
        '$state',
        '$rootScope',
        'MediaService',
        'FormBuilderService',
        'OrganizationService',
        OrganizationsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/organizations-edit.html'
};