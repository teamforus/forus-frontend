let OfficesComponent = function(
    $state,
    $stateParams,
    $filter,
    OfficeService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.weekDays = OfficeService.scheduleWeekDays();

    $ctrl.$onInit = function() {
        $ctrl.fundCategories = $ctrl.organization.product_categories.map((val) => {
            return val.name;
        });

        $ctrl.emptyBlockLink = $state.href('offices-create', $stateParams);
    };

    $ctrl.delete = (office) => {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: $filter('i18n')('offices.confirm_delete.title'),
            description: $filter('i18n')('offices.confirm_delete.description'),
            confirm: () => {
                OfficeService.destroy(office.organization_id, office.id)
                    .then((res) => {
                        $state.reload();
                    });
            }
        });
    };
};

module.exports = {
    bindings: {
        organization: '<',
        offices: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        '$filter',
        'OfficeService',
        'ModalService',
        OfficesComponent
    ],
    templateUrl: 'assets/tpl/pages/offices.html'
};