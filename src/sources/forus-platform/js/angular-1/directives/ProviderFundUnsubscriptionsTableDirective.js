let ProviderFundUnsubscriptionsTableDirective = function(
    $scope,
    $state,
    PushNotificationsService,
    FundUnsubscribeService,
) {
    const $dir = $scope.$dir;

    $dir.filterByType = (type) => { 
        $dir.shownType = type;

        fetchUnsubscriptions({
            ...$dir.filters.values, 
            state: $dir.shownType != 'all' ? $dir.shownType : null
        });
    };

    $dir.shownType = 'all';
    $dir.funds = [];

    $dir.emptyBlockText = "No unsubscription requests";

    const fetchUnsubscriptions = (query = {}) => {
        FundUnsubscribeService.listProvider($dir.organization.id, query).then(res => {
            $dir.items = res.data;
        });
    };

    $dir.onPageChange = (query) => {
        fetchUnsubscriptions(query);
    };

    $dir.cancelUnsubscriptionRequest = (unsubscription) => {
        FundUnsubscribeService.update($dir.organization.id, unsubscription.id, {
            state: 'canceled'
        }).then((res) => {
            PushNotificationsService.success('Fund unsubscribe request has been canceled');
            $state.reload();
        }, (res) => {
            console.log('errors: ', res);
        });
    };

    $dir.filters = {
        show: false,
        values: {},
        valuesDefault: {
            q: '',
        },
        reset: () => $dir.filters.values = { ...$dir.filters.valuesDefault }
    };

    $dir.resetFilters = () => {
        $dir.filters.reset();
    };

    $dir.hideFilters = () => {
        $dir.filters.show = false;
    };

    const fetchFunds = () => {
        $dir.items.data.forEach(item => {
            if (!$dir.funds.find(fund => fund.key == item.fund_provider.fund.id)) {
                $dir.funds.push({
                    key: item.fund_provider.fund.id,
                    name: item.fund_provider.fund.name,
                });
            }
        });

        $dir.funds.unshift({
            key: null,
            name: 'Selecteer fond'
        });

        $dir.filters.values.fund_id = $dir.funds[0].key;
    };

    $dir.$onInit = () => {
        fetchFunds();
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            items: '=',
            organization: '=',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'PushNotificationsService',
            'FundUnsubscribeService',
            ProviderFundUnsubscriptionsTableDirective,
        ],
        templateUrl: 'assets/tpl/directives/provider-fund-unsubscriptions-table.html'
    };
};