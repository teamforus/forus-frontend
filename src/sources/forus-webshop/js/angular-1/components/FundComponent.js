let FundsComponent = function() {
    let $ctrl = this;

    $ctrl.recordsByTypesKey = {};

    $ctrl.$onInit = function() {
        
        $ctrl.criteriaList = $ctrl.fund.criteria;

        $ctrl.formulaList = {
            fixed: $ctrl.fund.formulas.filter(formula => {
                return formula.type == 'fixed'
            }),
            multiply: $ctrl.fund.formulas.filter(formula => {
                return formula.type == 'multiply'
            }).map(multiply => {
                return {
                    amount: multiply.amount,
                    label: $ctrl.recordsByTypesKey[multiply.record_type_key].name
                }
            }),
        }; 
    };
};

module.exports = {
    bindings: {
        fund: '<',
        recordTypes: '<',
        products: '<',
        subsidies: '<',
    },
    controller: [
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund.html'
};