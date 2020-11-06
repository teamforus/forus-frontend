let ProviderOfficeComponent = function(
    $sce,
    $state,
    OfficeService
) {
    let $ctrl = this;

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };

    $ctrl.goToProvider = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        $state.go('provider', {
            provider_id: provider.id
        });
    };

    $ctrl.toggleOffices = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        provider.showOffices = !provider.showOffices;
    };

    $ctrl.showMoreProducts = () => {
        $ctrl.shownProductsCount += 9;
        $ctrl.sliceProducts();
    };

    $ctrl.showLessProducts = () => {
        $ctrl.shownProductsCount -= 9;
        $ctrl.sliceProducts();
    };

    $ctrl.sliceProducts = () => {
        $ctrl.shownProducts = $ctrl.provider.products.slice(0, $ctrl.shownProductsCount);
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

        if ($ctrl.provider.products) {
            $ctrl.shownProductsCount = 3;
            $ctrl.shownProducts = $ctrl.provider.products.slice(0, $ctrl.shownProductsCount);
        }

        $ctrl.provider.description_html = $sce.trustAsHtml($ctrl.provider.description_html);
    };
    
    $ctrl.$onDestroy = () => {};
};

module.exports = {
    bindings: {
        provider: '<',
        office: '<'
    },
    controller: [
        '$sce',
        '$state',
        'OfficeService',
        ProviderOfficeComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-office.html'
};