let ProviderOfficeComponent = function(
    $scope,
    $state,
    $element,
    OfficeService
) {
    let $ctrl = this;

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };
    
    $ctrl.$onInit = () => {
        $ctrl.weekDays = OfficeService.scheduleWeekFullDays();
        $ctrl.schedules = $ctrl.office.schedule.reduce((schedules, schedule) => {
            schedules[schedule.week_day] = schedule;
            return schedules;
        }, {});
    };
    
    $ctrl.$onDestroy = () => {};
};

module.exports = {
    bindings: {
        provider: '<',
        office: '<'
    },
    controller: [
        '$scope',
        '$state',
        '$element',
        'OfficeService',
        ProviderOfficeComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-office.html'
};