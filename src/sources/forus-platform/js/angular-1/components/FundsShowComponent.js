const FundsShowComponent = function($state, ModalService, FundService) {
    const $ctrl = this;

    $ctrl.showDropdownMenuItem = false;

    $ctrl.toggleActions = (e) => {
        e.stopPropagation();
        $ctrl.showDropdownMenuItem = true;
    };

    $ctrl.onClickOutsideMenu = (e) => {
        e.stopPropagation();
        $ctrl.showDropdownMenuItem = false;
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