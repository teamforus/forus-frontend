let OrganizationFundsComponent = function(
    $state,
    $filter,
    $stateParams,
    FundService,
    ModalService,
    PermissionsService,
    PushNotificationsService
) {
    let $ctrl = this;
    let $translate = $filter('translate');

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
                        "Aanbiders uitgenodigd!",
                        sprintf("%s uitnodigingen verstuurt naar aanbieders!", res.length),
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
            $state.go('csv-validation', {
                fund_id: fund.id
            });
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
        FundService.updateCriteria(
            fund.organization_id,
            fund.id,
            fund.criteria
        ).then((res) => {
            fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
            PushNotificationsService.success('Opgeslagen!');
        }, err => {
            PushNotificationsService.danger(err.data.message || 'Error!');
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);
        $ctrl.funds.forEach(fund => {
            fund.canAccessFund = fund.state != 'closed';
            fund.canInviteProviders = PermissionsService.hasPermission(
                fund.organization,
                'manage_funds'
            ) && (fund.state != 'closed') && $ctrl.funds.length > 1;
            fund.form = {
                criteria: fund.criteria
            };
            fund.providersDescription = sprintf(
                "%s (%s %s)",
                fund.provider_organizations_count,
                fund.provider_employees_count,
                $translate('fund_card_sponsor.labels.employees'),
            );
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
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