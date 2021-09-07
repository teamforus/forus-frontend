const ProviderOfficeComponent = function($sce, OfficeService) {
    const $ctrl = this;

    $ctrl.toggleOffices = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        provider.showOffices = !provider.showOffices;
    };

    $ctrl.$onInit = () => {
        $ctrl.weekDays = OfficeService.scheduleWeekFullDays();
        $ctrl.schedules = $ctrl.office.schedule.reduce((schedules, schedule) => {
            schedules[schedule.week_day] = schedule;
            return schedules;
        }, {});

        if ($ctrl.office.photo) {
            $ctrl.imageUrl = $ctrl.office.photo.sizes.thumbnail;
        } else if ($ctrl.office.organization.logo) {
            $ctrl.imageUrl = $ctrl.office.organization.logo.sizes.thumbnail;
        } else {
            $ctrl.imageUrl = 'assets/img/placeholders/office-thumbnail.png';
        }

        $ctrl.provider.description_html = $sce.trustAsHtml($ctrl.provider.description_html);
    };

    $ctrl.$onDestroy = () => { };
};

module.exports = {
    bindings: {
        provider: '<',
        office: '<',
        products: '<',
        subsidies: '<',
    },
    controller: [
        '$sce',
        'OfficeService',
        ProviderOfficeComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-office.html'
};