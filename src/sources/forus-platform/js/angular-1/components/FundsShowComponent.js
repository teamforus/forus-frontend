const FundsShowComponent = function (
    $state,
    $filter,
    FundService,
    ModalService,
    PermissionsService,
    PageLoadingBarService,
    PushNotificationsService,
    FundIdentitiesExportService,
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const $hasPerm = $filter('hasPerm');

    $ctrl.viewGeneralType = 'description';
    $ctrl.viewType = 'transactions';
    $ctrl.hasManagerPermission = false;

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

    $ctrl.deleteFund = function (fund) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'fund_card_sponsor.confirm_delete.title',
            icon: 'product-error',
            description: 'fund_card_sponsor.confirm_delete.description',
            confirm: () => FundService.destroy(fund.organization_id, fund.id).then(() => {
                $state.go('organization-funds', fund);
            }),
        });
    };

    $ctrl.exportIdentities = () => {
        FundIdentitiesExportService.export(
            $ctrl.fund.organization_id,
            $ctrl.fund.id,
            $ctrl.identitiesFilters
        );
    };

    $ctrl.identitiesOnPageChange = (query = {}) => {
        PageLoadingBarService.setProgress(0);

        FundService.listIdentities(
            $ctrl.fund.organization_id,
            $ctrl.fund.id,
            query
        ).then(
            (res) => $ctrl.identities = res.data,
            (res) => PushNotificationsService.danger('Error!', res.data.message)
        ).finally(() => {
            $ctrl.lastQuery = query.q;
            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.fundTransform = (fund) => ({
        ...fund,
        canAccessFund: fund.state != 'closed',
        canInviteProviders: $ctrl.hasManagerPermission && fund.state != 'closed',
        topUpTransactionFilters: { 
            show: false, 
            values: {},
        },
        form: { 
            criteria: fund.criteria,
        },
        providersDescription: [
            `${fund.provider_organizations_count}`,
            `(${fund.provider_employees_count} ${$translate('fund_card_sponsor.labels.employees')})`,
        ].join(' ')
    });

    $ctrl.fetchTopUpTransactions = (fund, query = {}) => {
        PageLoadingBarService.setProgress(0);

        FundService.listTopUpTransactions(fund.organization_id, fund.id, query).then(
            (res) => fund.top_up_transactions = res.data,
            (res) => PushNotificationsService.danger('Error!', res.data.message)
        ).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.onSaveCriteria = (fund) => {
        FundService.updateCriteria(fund.organization_id, fund.id, fund.criteria).then((res) => {
            fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
            PushNotificationsService.success('Opgeslagen!');
        }, (err) => PushNotificationsService.danger(err.data.message || 'Error!'));
    };
    
    $ctrl.inviteProvider = (fund) => {
        if (fund.canInviteProviders) {
            ModalService.open('fundInviteProviders', {
                fund: fund,
                confirm: (res) => {
                    PushNotificationsService.success(
                        "Aanbieders uitgenodigd!",
                        `${res.length} uitnodigingen verstuurt naar aanbieders!`,
                    );

                    $state.reload();
                }
            });
        }
    };

    $ctrl.$onInit = () => {
        $ctrl.implementations = [$ctrl.fund.implementation];
        $ctrl.hasManagerPermission = $hasPerm($ctrl.organization, 'manage_funds');
        $ctrl.fund = $ctrl.fundTransform($ctrl.fund);
        $ctrl.fetchTopUpTransactions($ctrl.fund);

        if (PermissionsService.hasPermission($ctrl.fund.organization, 'manage_funds')) {
            $ctrl.identitiesOnPageChange($ctrl.identitiesFilters);
        }
    }
};

module.exports = {
    bindings: {
        fund: '<',
        organization: '<',
        recordTypes: '<',
        validatorOrganizations: '<',
    },
    controller: [
        '$state',
        '$filter',
        'FundService',
        'ModalService',
        'PermissionsService',
        'PageLoadingBarService',
        'PushNotificationsService',
        'FundIdentitiesExportService',
        FundsShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/funds-show.html',
};