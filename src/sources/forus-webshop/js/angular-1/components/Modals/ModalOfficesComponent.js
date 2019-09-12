let ModalOfficesComponent = function(
    OfficeService,
    BusinessTypeService
) {
    let $ctrl = this;

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

    $ctrl.chageBusinessType = (option) => {
        $ctrl.businessType = option;

        if ($ctrl.businessType) {
            $ctrl.shownOffices = $ctrl.offices.filter(
                office => {
                    return office.organization.business_type_id == $ctrl.businessType.id;
                }
            );

            $ctrl.providersCount = getCountOfProviders($ctrl.shownOffices);
        }

        $ctrl.selectOffice(false);
    };

    $ctrl.$onInit = () => {
        BusinessTypeService.list({
            used: 1
        }).then(res => {
            $ctrl.businessTypes = res.data.data;
        });

        OfficeService.list().then(res => {
            console.log(res.data.data);
            $ctrl.offices = res.data.data;
            $ctrl.shownOffices = $ctrl.offices;
            $ctrl.providersCount = getCountOfProviders($ctrl.shownOffices);
        });
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'OfficeService',
        'BusinessTypeService',
        ModalOfficesComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-offices.html';
    }
};