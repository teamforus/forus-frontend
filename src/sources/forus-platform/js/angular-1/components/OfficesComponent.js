let OfficesComponent = function(
    $state,
    $stateParams,
    OfficeService,
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
        'ModalService',
        OfficesComponent
    ],
    templateUrl: 'assets/tpl/pages/offices.html'
};