let CsvValidationComponent = function(
    $state,
    PermissionsService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.panel_type = appConfigs.panel_type;

    $ctrl.onFundSelect = (fund) => {
        $ctrl.fund = fund;
    }; 

    $ctrl.$onInit = () => {
        if (Array.isArray($ctrl.funds)) {
            $ctrl.funds = $ctrl.funds.filter(fund => {
                return PermissionsService.hasPermission(fund.organization, 'validate_records')
            });

            if ($ctrl.funds.length == 1) {
                $state.go('csv-validation', {
                    fund_id: $ctrl.funds[0].id
                });
            }
        }
    };
};

module.exports = {
    bindings: {
        recordTypes: '<',
        funds: '<',
        fund: '<',
    },
    controller: [
        '$state',
        'PermissionsService',
        'appConfigs',
        CsvValidationComponent,
    ],
    templateUrl: 'assets/tpl/pages/csv-validation.html'
};