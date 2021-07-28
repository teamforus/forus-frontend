let OfficesComponent = function(
    $state,
    $stateParams,
    OfficeService,
    OrganizationService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.weekDays = OfficeService.scheduleWeekDays();

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('offices-create', $stateParams);
        $ctrl.offices = $ctrl.offices.map(office => ({
            ...office, ...{
                scheduleByDay: office.schedule.reduce((scheduleData, schedule) => {
                    return { ...scheduleData, ...({ [schedule.week_day]: schedule }) };
                }, {})
            }
        }));
    };

    $ctrl.delete = (office) => {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'offices.confirm_delete.title',
            description: 'offices.confirm_delete.description',
            confirm: () => OfficeService.destroy(
                office.organization_id, office.id
            ).then(() => $state.reload()),
        });
    };

    $ctrl.deleteOrganization = () => {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'organization_delete.title',
            description: 'organization_delete.description',
            confirm: () => OrganizationService.destroy(
                $ctrl.organization.id
            ).then(() => $state.go('home')),
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
        'OfficeService',
        'OrganizationService',
        'ModalService',
        OfficesComponent
    ],
    templateUrl: 'assets/tpl/pages/offices.html'
};