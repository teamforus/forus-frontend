let FundsShowComponent = function(
    $state,
    $stateParams,
    FundService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        
    };
};

module.exports = {
    bindings: {
        fund: '<',
        fundLevel: '<'
    },
    controller: [
        '$state', 
        '$stateParams', 
        'FundService', 
        'FormBuilderService', 
        FundsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-show.html'
};