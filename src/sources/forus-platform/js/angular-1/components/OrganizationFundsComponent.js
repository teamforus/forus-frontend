const OrganizationFundsComponent = function (
    $state,
    $filter,
    $timeout,
    $stateParams,
    FundService,
    ModalService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const $translateDangerZone = (type, key) => $translate(`modals.danger_zone.${type}.${key}`);
    const $translateFundStates = (state) => $translate(`components.organization_funds.states.${state}`);

    $ctrl.shownFundsType = $stateParams.funds_type || 'active';

    $ctrl.states = [{
        key: 'active',
        name: $translateFundStates('active'),
    }, {
        key: 'paused',
        name: $translateFundStates('paused'),
    }, {
        key: 'closed',
        name: $translateFundStates('closed'),
    }];

    $ctrl.filters = {
        show: false,
        values: {},
        defaultValues: {
            q: '',
            state: $ctrl.states[0].key,
        },
        reset: function () {
            this.values = { ...this.values, ...this.defaultValues };
        }
    };

    $ctrl.toggleActions = (e, fund) => {
        $ctrl.onClickOutsideMenu(e);
        fund.showMenu = true;
    };

    $ctrl.onClickOutsideMenu = (e) => {
        e.stopPropagation();
        $ctrl.funds.data.forEach((fund) => fund.showMenu = false);
    };

    $ctrl.hideFilters = () => {
        $timeout(() => $ctrl.filters.show = false);
    };

    $ctrl.askConfirmation = (type, onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone(type, 'title'),
            description: $translateDangerZone(type, 'description'),
            cancelButton: $translateDangerZone(type, 'buttons.cancel'),
            confirmButton: $translateDangerZone(type, 'buttons.confirm'),
            onConfirm: onConfirm,
        });
    };

    $ctrl.topUpModal = (fund) => {
        if (!fund.topUpInProgress) {
            fund.topUpInProgress = true;

            ModalService.open('fundTopUp', { fund }, {
                onClose: () => fund.topUpInProgress = false
            });
        }
    };

    $ctrl.archiveFund = (fund) => {
        $ctrl.askConfirmation('archive_fund', () => {
            FundService.archive(fund.organization_id, fund.id).then(() => {
                $state.go($state.$current.name, { funds_type: 'archived' });
                PushNotificationsService.success('Opgeslagen!');
            }, (err) => PushNotificationsService.danger(err.data.message || 'Error!'));
        });
    };

    $ctrl.restoreFund = (e, fund) => {
        e?.stopPropagation();
        e?.preventDefault();

        $ctrl.askConfirmation('restore_fund', () => {
            FundService.unarchive(fund.organization_id, fund.id).then(() => {
                fund.state = 'archive';
                $state.go($state.$current.name, { funds_type: 'active' });
                PushNotificationsService.success('Opgeslagen!');
            }, (err) => PushNotificationsService.danger(err.data.message || 'Error!'));
        });
    };

    $ctrl.onPageChange = (query) => {
        PageLoadingBarService.setProgress(0);

        FundService.list($ctrl.organization.id, { 
            with_archived: 1, 
            with_external: 1, 
            stats: 'min',
            archived: $ctrl.shownFundsType == 'archived' ? 1 : 0,
            ...query
        }).then((res) => $ctrl.funds = res.data).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.$onInit = function () {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);
        $ctrl.filters.reset();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        archivedFunds: '<',
        recordTypes: '<',
        organization: '<',
        validatorOrganizations: '<',
    },
    controller: [
        '$state',
        '$filter',
        '$timeout',
        '$stateParams',
        'FundService',
        'ModalService',
        'PageLoadingBarService',
        'PushNotificationsService',
        OrganizationFundsComponent,
    ],
    templateUrl: 'assets/tpl/pages/organization-funds.html',
};