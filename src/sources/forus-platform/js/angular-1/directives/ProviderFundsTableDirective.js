const ProviderFundsTableDirective = function (
    ProviderFundService,
    ProductService,
    ModalService,
    PushNotificationsService,
    $scope,
    $filter,
    $q
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key, params) => {
        return $translate('modals.danger_zone.remove_provider_application.' + key, params);
    };

    const trans_fund_provider_empty = (key) => {
        return $translate('provider_funds.empty_block.' + key);
    };

    $dir.allSelected = false;
    $dir.hasSelected = false;
    $dir.selected = {};
    $dir.selectedForCancel = [];
    $dir.selectedCount = 0;

    const updateHasSelected = () => {
        const items = [];
        const cancelableItems = [];

        Object.keys($dir.selected).forEach((key) => {
            if ($dir.selected[key]) {
                let providerFund = $dir.providerFunds.filter((item) => item.id == key)[0];

                if (providerFund) {
                    items.push(providerFund);
                    providerFund.cancelable && cancelableItems.push(providerFund);
                }
            }
        });

        $dir.hasSelected = !!items.length;
        $dir.allSelected = items.length === $dir.providerFunds?.length;
        $dir.selectedForCancel = cancelableItems;
        $dir.selectedCount = items.length;
    }

    $dir.updateAllSelected = () => {
        $dir.allSelected
            ? $dir.providerFunds.forEach((item) => $dir.selected[item.id] = true)
            : $dir.selected = {};
    };

    $dir.viewOffers = (providerFund) => {
        ProductService.list($dir.organization.id).then(res => {
            ModalService.open('fundOffers', {
                fund: providerFund.fund,
                providerFund: providerFund,
                organization: $dir.organization,
                offers: res.data,
            });
        }, console.error);
    };

    $dir.cancelApplicationRequest = (providerFund) => {
        const sponsor_organisation_name = providerFund.fund.organization.name;

        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description', { sponsor_organisation_name }),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => $dir.sendCancelApplicationRequest(providerFund),
        });
    };

    $dir.cancelSelectedApplicationRequests = () => {
        const sponsor_organisation_name = '';

        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description', { sponsor_organisation_name }),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => $dir.sendSelectedCancelApplicationRequests(),
        });
    };

    $dir.sendCancelApplicationRequest = (providerFund) => {
        ProviderFundService.cancelApplicationRequest($dir.organization.id, providerFund.id)
            .then(() => successCancel(), console.error);
    };

    $dir.sendSelectedCancelApplicationRequests = () => {
        const promises = [];
        $dir.selectedForCancel.forEach((providerFund) => {
            promises.push(ProviderFundService.cancelApplicationRequest($dir.organization.id, providerFund.id));
        });

        if (promises.length) {
            $q.all(promises).then(() => successCancel());
        }
    }

    const successCancel = () => {
        PushNotificationsService.success('Opgeslagen!');

        if (typeof $dir.onRemoved === 'function') {
            $dir.onRemoved();
        }
    }

    const mapProviderFunds = () => {
        $dir.providerFunds = $dir.items.map((providerFund) => {
            if (providerFund.dismissed) {
                providerFund.status_text = $translate('provider_funds.status.rejected');
                providerFund.status_class = 'tag-default';
            } else if (
                !providerFund.allow_budget &&
                !providerFund.allow_products &&
                !providerFund.allow_some_products &&
                !providerFund.dismissed
            ) {
                providerFund.status_text = $translate('provider_funds.status.hold');
                providerFund.status_class = 'tag-warning';
            }

            return providerFund;
        });
    }

    $dir.unsubscribe = (providerFund) => {
        ModalService.open('fundUnsubscribe', {
            organization: $dir.organization,
            providerFund: providerFund,
        });
    }

    $dir.$onInit = () => {
        $dir.emptyBlockText = trans_fund_provider_empty($dir.type);

        $scope.$watch('$dir.selected', updateHasSelected, true);
        $scope.$watch('$dir.items', mapProviderFunds, true);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            organization: '=',
            items: '=',
            onRemoved: '&',
            type: '@',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            'ProviderFundService',
            'ProductService',
            'ModalService',
            'PushNotificationsService',
            '$scope',
            '$filter',
            '$q',
            ProviderFundsTableDirective
        ],
        templateUrl: 'assets/tpl/directives/provider-funds-table.html'
    };
};