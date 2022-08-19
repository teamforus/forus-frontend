const FundsShowComponent = function(
    $state,
    ModalService,
    FundService,
    FundIdentitiesExportService,
    PageLoadingBarService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.identitiesFilters = {
        order_by: 'id',
        order_dir: 'asc',
        per_page: 10,
    };

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

    $ctrl.exportIdentities = () => {
        FundIdentitiesExportService.export($ctrl.organization.id, $ctrl.fund.id, $ctrl.identitiesFilters);
    };

    $ctrl.identitiesOnPageChange = (query = {}) => {
        PageLoadingBarService.setProgress(0);

        FundService.listIdentities($ctrl.organization.id, $ctrl.fund.id, query).then((res) => {
            $ctrl.identities = res.data;
        }, (res) => {
            PushNotificationsService.danger('Error!', res.data.message);
        }).finally(() => {
            $ctrl.lastQuery = query.q;
            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.implementations = [$ctrl.fund.implementation];
        $ctrl.identitiesOnPageChange($ctrl.identitiesFilters);
    }
};

module.exports = {
    bindings: {
        organization: '<',
        fund: '<',
    },
    controller: [
        '$state',
        'ModalService',
        'FundService',
        'FundIdentitiesExportService',
        'PageLoadingBarService',
        'PushNotificationsService',
        FundsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-show.html'
};