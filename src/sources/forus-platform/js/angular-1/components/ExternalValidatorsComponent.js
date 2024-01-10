const ExternalValidatorsComponent = function(
    $q,
    $filter,
    ModalService,
    PaginatorService,
    OrganizationService,
    PushNotificationsService
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_external_validators.${key}`);

    $ctrl.filters = {
        q: '',
        order_by: 'name',
        order_dir: 'asc',
        defaultValues: {},
        values: {},
    };

    $ctrl.prepareValidators = (organizations, approvedOrganizations) => {
        let approvedValidators = approvedOrganizations.map(
            validatorOrganization => validatorOrganization.validator_organization_id
        );

        organizations.forEach((organization) => {
            organization.approved = approvedValidators.indexOf(
                organization.id
            ) !== -1;
        });

        return organizations;
    };

    $ctrl.onPageChange = (query) => {
        $q.all([
            $ctrl.fetchAvailableList(query),
            $ctrl.fetchApprovedList()
        ]).then($ctrl.updateModels);
    };

    $ctrl.fetchAvailableList = (query = {}) => {
        return $q((resolve, reject) => {
            OrganizationService.listValidatorsAvailable(query).then(res => resolve(
                $ctrl.validatorOrganizations = res.data
            ), reject);
        });
    };

    $ctrl.fetchApprovedList = () => {
        return $q((_res, _rej) => {
            OrganizationService.readListValidators(
                $ctrl.organization.id, {
                    per_page: 100
                }).then(res => _res(
                $ctrl.validatorOrganizationsApproved = res.data
            ), _rej);
        });
    };

    $ctrl.updateModels = () => {
        $ctrl.validatorOrganizations.data = $ctrl.prepareValidators(
            $ctrl.validatorOrganizations.data,
            $ctrl.validatorOrganizationsApproved.data
        );
    };

    $ctrl.addExternalValidator = (organization) => {
        OrganizationService.addExternalValidator(
            $ctrl.organization.id,
            organization.id
        ).then(() => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fetchApprovedList().then(() => $ctrl.updateModels());
        }, () => PushNotificationsService.danger('Error!'));
    };

    $ctrl.removeExternalValidator = (organization) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => {
                OrganizationService.removeExternalValidator(
                    $ctrl.organization.id,
                    organization.id
                ).then(res => {
                    PushNotificationsService.success('Opgeslagen!');
                    $ctrl.fetchApprovedList().then(() => $ctrl.updateModels());
                }, () => PushNotificationsService.danger('Error!'));
            }
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.filters = PaginatorService.syncPageFilters($ctrl.filters, $ctrl.paginationPerPageKey, $ctrl.paginationPerPageDefault);

        $ctrl.validatorOrganizations.data = $ctrl.prepareValidators(
            $ctrl.validatorOrganizations.data,
            $ctrl.validatorOrganizationsApproved.data,
        );
    };
};

module.exports = {
    bindings: {
        organization: '<',
        validatorOrganizations: '<',
        validatorOrganizationsApproved: '<',
        paginationPerPageKey: '<',
        paginationPerPageDefault: '<',
    },
    controller: [
        '$q',
        '$filter',
        'ModalService',
        'PaginatorService',
        'OrganizationService',
        'PushNotificationsService',
        ExternalValidatorsComponent,
    ],
    templateUrl: 'assets/tpl/pages/external-validators.html',
};