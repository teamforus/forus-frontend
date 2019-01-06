let CsvValidationComonent = function(
    $state,
    PermissionsService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.panel_type = appConfigs.panel_type;

    $ctrl.$onInit = () => {
        if (Array.isArray($ctrl.funds)) {
            $ctrl.funds = $ctrl.funds.map(fund => {
                fund.fundCategories = _.pluck(fund.product_categories, 'name').join(', ');
                return fund;
            }).filter(fund => {
                return PermissionsService.hasPermission(fund.organization, 'validate_records')
            });

            if ($ctrl.funds.length == 1) {
                $state.go('csv-validation', {
                    fund_id: $ctrl.funds[0].id
                });
            }
        }

        if ($ctrl.fund) {
            $ctrl.fund.fundCategories = _.pluck($ctrl.fund.product_categories, 'name').join(', ');
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
        CsvValidationComonent,
    ],
    templateUrl: 'assets/tpl/pages/csv-validation.html'
};