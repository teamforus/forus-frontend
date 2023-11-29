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
    $ctrl.viewType = 'top_ups';
    $ctrl.hasManagerPermission = false;

    $ctrl.topUpTransactionFilters = {
        show: false,
        values: {},
    };

    $ctrl.implementationsFilters = {
        show: false,
        values: {},
    };

    $ctrl.identitiesFilters = {
        show: false,
        values: {},
    };

    $ctrl.hideTopUpTransactionFilters = () => {
        $ctrl.topUpTransactionFilters.show = false;
    };

    $ctrl.hideImplementationsFilter = () => {
        $ctrl.implementationsFilters.show = false;
    };

    $ctrl.hideIdentitiesFilters = () => {
        $ctrl.identitiesFilters.show = false;
    };

    $ctrl.toggleActions = (e, implementation) => {
        $ctrl.onClickOutsideMenu(e);
        implementation.showMenu = true;
    };

    $ctrl.onClickOutsideMenu = (e) => {
        e.stopPropagation();
        $ctrl.implementations.data.forEach((implementation) => implementation.showMenu = false);
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
            $ctrl.lastQueryIdentities = query.q;
            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.topUpTransactionsOnPageChange = (query = {}) => {
        PageLoadingBarService.setProgress(0);

        FundService.listTopUpTransactions($ctrl.fund.organization_id, $ctrl.fund.id, query).then(
            (res) => $ctrl.top_up_transactions = res.data,
            (res) => PushNotificationsService.danger('Error!', res.data.message)
        ).finally(() => {
            $ctrl.lastQueryTopUpTransactions = query.q;
            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.implementationsOnPageChange = (query = {}) => {
        $ctrl.lastQueryImplementations = query?.q;

        if (!query.q || $ctrl.fund.implementation.name?.toLowerCase().includes(query.q?.toLowerCase())) {
            $ctrl.implementations = {
                data: [$ctrl.fund.implementation],
                meta: { total: 1, current_page: 1, per_page: 10, from: 1, to: 1, last_page: 1 },
            };
        } else {
            $ctrl.implementations = {
                data: [],
                meta: { total: 0, current_page: 1, per_page: 10, from: 0, to: 0, last_page: 1 },
            };
        }
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
            $ctrl.identitiesFilters.values
        );
    };

    $ctrl.fundTransform = (fund) => ({
        ...fund,
        canAccessFund: fund.state != 'closed',
        canInviteProviders: $ctrl.hasManagerPermission && fund.state != 'closed',
        form: {
            criteria: fund.criteria,
        },
        providersDescription: [
            `${fund.provider_organizations_count}`,
            `(${fund.provider_employees_count} ${$translate('fund_card_sponsor.labels.employees')})`,
        ].join(' ')
    });

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

        $ctrl.hasManagerPermission = $hasPerm($ctrl.organization, 'manage_funds');
        $ctrl.fund = $ctrl.fundTransform($ctrl.fund);

        $ctrl.implementationsOnPageChange();
        $ctrl.topUpTransactionsOnPageChange();

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