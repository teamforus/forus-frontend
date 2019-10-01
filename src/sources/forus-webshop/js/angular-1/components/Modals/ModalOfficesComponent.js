let ModalOfficesComponent = function(
    $timeout,
    $element,
    OfficeService,
    BusinessTypeService
) {
    let $ctrl = this;
    let timeout = false;
    let itemsPerScroll = 5;
    let itemsShown = itemsPerScroll;

    $ctrl.selectedOffice = false;
    $ctrl.businessTypes = [];

    let getCountOfProviders = function(offices) {
        return _.uniq(_.pluck(offices, 'organization_id')).length
    };

    $ctrl.weekDays = OfficeService.scheduleWeekDays();

    $ctrl.selectOffice = (office) => {
        $ctrl.selectedOffice = office ? office.id : office;
    };

    $ctrl.cancel = () => {
        if (typeof($ctrl.modal.scope.cancel) === 'function') {
            $ctrl.modal.scope.cancel();
        }

        $ctrl.close();
    };

    $ctrl.chageSearchString = (value) => {
        if (timeout) {
            $timeout.cancel(timeout);
        }

        $ctrl.loadOffices(value);
    };

    $ctrl.loadOffices = (q = "") => {
        itemsShown = 0;

        OfficeService.list({
            q: q
        }).then(res => {
            $ctrl.offices = res.data.data;
            $ctrl.providersCount = getCountOfProviders($ctrl.offices);
            $ctrl.shownOffices = $ctrl.offices;
        });
    };

    $ctrl.$onInit = () => {
        BusinessTypeService.list({
            used: 1
        }).then(res => {
            $ctrl.businessTypes = res.data.data;
        });

        $ctrl.loadOffices();
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        '$element',
        'OfficeService',
        'BusinessTypeService',
        ModalOfficesComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-offices.html';
    }
};