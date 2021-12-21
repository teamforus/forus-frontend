const FundsShowComponent = function($state, ModalService, FundService) {
    const $ctrl = this;

    $ctrl.toggleActions = (e, implementation) => {
        $ctrl.onClickOutsideMenu(e);
        implementation.showMenu = true;
    };

    $ctrl.onClickOutsideMenu = (e) => {
        e.stopPropagation();
        $ctrl.implementations.forEach((implementation) => implementation.showMenu = false);
    };

    $ctrl.deleteFund = function(fund) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'fund_card_sponsor.confirm_delete.title',
            icon: 'product-error',
            description: 'fund_card_sponsor.confirm_delete.description',
            confirm: () => {
                FundService.destroy(fund.organization_id, fund.id).then(() => {
                    $state.go('organization-funds', {
                        organization_id: fund.organization_id
                    });
                });
            }
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.implementations = [{...$ctrl.fund.implementation}, {...$ctrl.fund.implementation}];
    }
};

module.exports = {
    bindings: {
        fund: '<',
    },
    controller: [
        '$state',
        'ModalService',
        'FundService',
        FundsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-show.html'
};