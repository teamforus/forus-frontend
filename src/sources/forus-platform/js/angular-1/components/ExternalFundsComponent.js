let ValidatorsShortlistComponent = function(
    $q,
    $filter,
    ModalService,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService
) {
    let $ctrl = this;
    let $translate = $filter('translate');
    let $translateDangerZone = (key) => $translate(
        'modals.danger_zone.remove_external_validators.' + key
    );

    $ctrl.filters = {
        values: {},
    };

    $ctrl.askConfirmation = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: onConfirm
        });
    };

    $ctrl.updateFlags = (funds) => {
        funds.data.forEach(fund => {
            fund.showDeclineAll = fund.criteria.filter(fund => fund.accepted).length > 0;
            fund.showAcceptAll = fund.criteria.filter(fund => !fund.accepted).length > 0;
        });
    };

    $ctrl.fetchFunds = (query = {}) => {
        return $q((resolve, reject) => {
            OrganizationService.listExternalFunds(
                $ctrl.organization.id, query
            ).then(res => {
                $ctrl.funds = res.data;
                $ctrl.updateFlags($ctrl.funds);
                resolve($ctrl.funds);
            }, reject);
        });
    };

    $ctrl.onPageChange = (query) => {
        return $ctrl.fetchFunds(query);
    };

    $ctrl.updateFundAcceptance = (fund) => {
        $ctrl.updateFlags($ctrl.funds);
        
        OrganizationService.externalFundUpdate($ctrl.organization.id, fund.id, {
            criteria: fund.criteria
        }).then(() => {
            $ctrl.fetchFunds($ctrl.filters.values);
            PushNotificationsService.success('Opgeslagen!');
        }, (err) => {
            PushNotificationsService.danger('Error!');
            console.error(err);
        });
    };


    $ctrl.acceptFundCriterion = (fund, criterion) => {
        criterion.accepted = true;
        $ctrl.updateFundAcceptance(fund);
    };

    $ctrl.declineFundCriterion = (fund, criterion) => {
        $ctrl.askConfirmation(() => {
            criterion.accepted = false;
            $ctrl.updateFundAcceptance(fund);
        });
    };

    $ctrl.acceptAll = (fund) => {
        fund.criteria.forEach(criterion => criterion.accepted = true);
        $ctrl.updateFundAcceptance(fund);
    };

    $ctrl.declineAll = (fund) => {
        $ctrl.askConfirmation(() => {
            fund.criteria.forEach(criterion => criterion.accepted = false);
            $ctrl.updateFundAcceptance(fund);
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.auto_validate_form = FormBuilderService.build({
            validator_auto_accept_funds: $ctrl.organization.validator_auto_accept_funds,
        }, function(form) {
            OrganizationService.updateRole($ctrl.organization.id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
                form.unlock();
            }, () => {
                PushNotificationsService.danger('Error!');
                form.unlock();
            });
        }, true);

        $ctrl.updateFlags($ctrl.funds);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
    },
    controller: [
        '$q',
        '$filter',
        'ModalService',
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        ValidatorsShortlistComponent
    ],
    templateUrl: 'assets/tpl/pages/external-funds.html'
};