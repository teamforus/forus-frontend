const uniq = require('lodash/uniq'); 
const pluck = require('lodash/map'); 

const ModalOfficesComponent = function($timeout, OfficeService) {
    const $ctrl = this;
    let timeout = false;

    $ctrl.weekDays = OfficeService.scheduleWeekDays();
    $ctrl.selectedOffice = false;

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

        timeout = $timeout(() => $ctrl.loadOffices($ctrl.query), 1000);
    };

    $ctrl.loadOffices = (q = "") => {
        OfficeService.list({
            q: q,
            approved: 1
        }).then(res => {
            $ctrl.offices = res.data.data;
            $ctrl.shownOffices = $ctrl.offices;
            $ctrl.providersCount = uniq(pluck($ctrl.offices, 'organization_id')).length;
        });
    };

    $ctrl.$onInit = () => $ctrl.loadOffices();
    $ctrl.$onDestroy = () => {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        'OfficeService',
        ModalOfficesComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-offices.html';
    }
};