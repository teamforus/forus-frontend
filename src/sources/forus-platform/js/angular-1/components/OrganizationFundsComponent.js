const OrganizationFundsComponent = function(
    $q,
    $state,
    $filter,
    $stateParams,
    $timeout,
    FundService,
    ModalService,
    PushNotificationsService
) {
    const $ctrl = this;
    const $hasPerm = $filter('hasPerm');
    const $translate = $filter('translate');
    const $translateDangerZone = (type, key) => $translate(`modals.danger_zone.${type}.${key}`);

    $ctrl.topUpTransactionFilters = {
        show: false,
        values: {},
    };

    $ctrl.hasManagerPermission = false;

    $ctrl.resetFilters = () => {
        $ctrl.topUpTransactionFilters.values.q = '';
        $ctrl.topUpTransactionFilters.values.from = null;
        $ctrl.topUpTransactionFilters.values.to = null;
    };

    $ctrl.hideFilters = () => {
        $timeout(() => {
            $ctrl.topUpTransactionFilters.show = false;
        }, 0);
    };

    $ctrl.askConfirmation = (type, onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone(type, 'title'),
            description: $translateDangerZone(type, 'description'),
            cancelButton: $translateDangerZone(type, 'buttons.cancel'),
            confirmButton: $translateDangerZone(type, 'buttons.confirm'),
            onConfirm: onConfirm
        });
    };

    $ctrl.shownFundsType = $stateParams.funds_type || 'active';

    $ctrl.topUpModal = (fund) => {
        if (!fund.topUpInProgress) {
            fund.topUpInProgress = true;

            ModalService.open('fundTopUp', { fund }, {
                onClose: () => fund.topUpInProgress = false
            });
        }
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

    $ctrl.toggleFundCriteria = (fund) => {
        fund.show_criteria = !fund.show_criteria;
        fund.show_stats = fund.show_top_ups = false;
    };

    $ctrl.toggleFundStats = (fund) => {
        fund.show_stats = !fund.show_stats;
        fund.show_criteria = fund.show_top_ups = false;
    };

    $ctrl.fetchTopUpTransactions = (fund, query) => {
        return $q((resolve, reject) => {
            FundService.listTopUpTransactions(
                fund.organization_id, fund.id, query || {}
            ).then(res => {
                fund.top_up_transactions = res.data;
                resolve(fund.top_up_transactions);
            }, reject);
        });
    };

    $ctrl.toggleFundTopupHistory = (fund) => {
        fund.show_top_ups = !fund.show_top_ups;
        fund.show_criteria = fund.show_stats = false;

        if (fund.show_top_ups) {
            $ctrl.fetchTopUpTransactions(fund);
        }
    };

    $ctrl.onSaveCriteria = (fund) => {
        FundService.updateCriteria(fund.organization_id, fund.id, fund.criteria).then((res) => {
            fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
            PushNotificationsService.success('Opgeslagen!');
        }, (err) => PushNotificationsService.danger(err.data.message || 'Error!'));
    };

    $ctrl.archiveFund = (fund) => {
        $ctrl.askConfirmation('archive_fund', () => {
            FundService.archive(fund.organization_id, fund.id).then(() => {
                fund.state = 'archive';
                $state.go($state.$current.name, { funds_type: 'archived' });
                PushNotificationsService.success('Opgeslagen!');
            }, (err) => PushNotificationsService.danger(err.data.message || 'Error!'));
        });
    };

    $ctrl.restoreFund = (fund) => {
        $ctrl.askConfirmation('restore_fund', () => {
            FundService.unarchive(fund.organization_id, fund.id).then(() => {
                fund.state = 'archive';
                $state.go($state.$current.name, { funds_type: 'active' });
                PushNotificationsService.success('Opgeslagen!');
            }, (err) => PushNotificationsService.danger(err.data.message || 'Error!'));
        });
    };

    $ctrl.getActiveFundsCount = (type) => ({
        active: $ctrl.activeFunds.length,
        archived: $ctrl.archivedFunds.length,
    }[type]);

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);
        $ctrl.hasManagerPermission = $hasPerm($ctrl.organization, 'manage_funds');
        $ctrl.canInviteProviders = $ctrl.hasManagerPermission && $ctrl.funds.length > 1;

        $ctrl.funds.forEach((fund) => {
            fund.canAccessFund = fund.state != 'closed';
            fund.canInviteProviders = $ctrl.hasManagerPermission && fund.state != 'closed';

            fund.form = { criteria: fund.criteria };
            fund.providersDescription = [
                `${fund.provider_organizations_count}`,
                `(${fund.provider_employees_count} ${$translate('fund_card_sponsor.labels.employees')})`,
            ].join(' ');
        });

        $ctrl.activeFunds = $ctrl.funds.filter((fund) => !fund.archived);
        $ctrl.archivedFunds = $ctrl.funds.filter((fund) => fund.archived);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        archivedFunds: '<',
        fundLevel: '<',
        recordTypes: '<',
        organization: '<',
        validatorOrganizations: '<',
    },
    controller: [
        '$q',
        '$state',
        '$filter',
        '$stateParams',
        '$timeout',
        'FundService',
        'ModalService',
        'PushNotificationsService',
        OrganizationFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-funds.html'
};