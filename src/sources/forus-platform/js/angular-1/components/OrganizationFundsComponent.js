const sprintf = require('sprintf-js').sprintf;

let OrganizationFundsComponent = function(
    $state,
    $filter,
    $stateParams,
    FundService,
    ModalService,
    PermissionsService,
    PushNotificationsService
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const $translateDangerZone = (type, key) => $translate(`modals.danger_zone.${type}.${key}`);

    $ctrl.askConfirmation = (type, onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone(type, 'title'),
            description: $translateDangerZone(type, 'description'),
            cancelButton: $translateDangerZone(type, 'buttons.cancel'),
            confirmButton: $translateDangerZone(type, 'buttons.confirm'),
            onConfirm: onConfirm
        });
    };

    $ctrl.shownFundsType = $stateParams.funds_type || 'opened';

    $ctrl.topUpModal = (fund) => {
        if (!fund.topUpInProgress) {
            fund.topUpInProgress = true;

            ModalService.open('fundTopUp', {
                fund: fund
            }, {
                onClose: () => fund.topUpInProgress = false
            });
        }
    };

    $ctrl.deleteFund = function(fund) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'fund_card_sponsor.confirm_delete.title',
            icon: 'product-error',
            description: 'fund_card_sponsor.confirm_delete.description',
            confirm: () => FundService.destroy(
                fund.organization_id,
                fund.id
            ).then(() => $state.reload())
        });
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

    $ctrl.goToEmployeePage = () => $state.go('employees', {
        organization_id: $ctrl.organization.id
    });

    $ctrl.goToCSVValiationPage = (fund) => {
        if (fund.canAccessFund) {
            $state.go('csv-validation', { fund_id: fund.id });
        }
    };

    $ctrl.toggleFundCriteria = (fund) => {
        fund.show_criteria = !fund.show_criteria;
        fund.show_stats = false;
    };

    $ctrl.toggleFundStats = (fund) => {
        fund.show_stats = !fund.show_stats;
        fund.show_criteria = false;
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
                $state.reload();
                PushNotificationsService.success('Opgeslagen!');
            }, (err) => PushNotificationsService.danger(err.data.message || 'Error!'));
        });
    };

    $ctrl.restoreFund = (fund) => {
        $ctrl.askConfirmation('restore_fund', () => {
            FundService.unarchive(
                fund.organization_id,
                fund.id
            ).then((res) => {
                fund.state = 'archive';
                $state.reload();
                PushNotificationsService.success('Opgeslagen!');
            }, err => {
                PushNotificationsService.danger(err.data.message || 'Error!');
            });
        });
    };

    $ctrl.checkForEmptyList = (type) => $ctrl.getActiveFundsCount(type) == 0;

    $ctrl.getActiveFundsCount = (type) => ({
        opened: $ctrl.openedFunds.length,
        archived: $ctrl.archivedFunds.length,
    }[type]);

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);
        $ctrl.funds.forEach(fund => {
            fund.canAccessFund = fund.state != 'closed';
            fund.canInviteProviders = PermissionsService.hasPermission(
                fund.organization,
                'manage_funds'
            ) && (fund.state != 'closed') && $ctrl.funds.length > 1;

            fund.form = { criteria: fund.criteria };
            fund.providersDescription = [
                `${fund.provider_organizations_count}`,
                `(${fund.provider_employees_count} ${$translate('fund_card_sponsor.labels.employees')})`,
            ].join(' ');
        });

        $ctrl.openedFunds = $ctrl.funds.filter((fund) => !fund.is_archived);
        $ctrl.archivedFunds = $ctrl.funds.filter((fund) => fund.is_archived);
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
        '$state',
        '$filter',
        '$stateParams',
        'FundService',
        'ModalService',
        'PermissionsService',
        'PushNotificationsService',
        OrganizationFundsComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-funds.html'
};