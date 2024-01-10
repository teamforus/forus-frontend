const ProviderFundsTableDirective = function (
    $q,
    $scope,
    $filter,
    ModalService,
    ProductService,
    PaginatorService,
    ProviderFundService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');

    $dir.paginationPerPageKey = "provider_funds";

    $dir.selected = [];
    $dir.selectedMeta = {};

    $dir.filters = {
        q: '',
        per_page: PaginatorService.getPerPage($dir.paginationPerPageKey, 10),
    };

    const $translateDangerZone = (key, params) => {
        return $translate(`modals.danger_zone.remove_provider_application.${key}`, params);
    };

    $dir.toggleAll = (e, items = []) => {
        e?.stopPropagation();

        $dir.selected = $dir.selected.length === items.length ? [] : items.map((item) => item.id);
    };

    $dir.toggle = (e, item) => {
        e?.stopPropagation();

        if ($dir.selected.includes(item.id)) {
            $dir.selected.splice($dir.selected.indexOf(item.id), 1);
        } else {
            $dir.selected.push(item.id);
        }
    };

    $dir.updateActions = () => {
        const selected = $dir.providerFunds.data?.filter((item) => $dir.selected.includes(item.id));

        $dir.selectedMeta.selected = selected;
        $dir.selectedMeta.selected_cancel = selected.filter((item) => item.can_cancel);
        $dir.selectedMeta.selected_unsubscribe = selected.filter((item) => item.can_unsubscribe);
    };

    $dir.viewOffers = (providerFund) => {
        ProductService.list($dir.organization.id).then((res) => ModalService.open('fundOffers', {
            fund: providerFund.fund,
            providerFund: providerFund,
            organization: $dir.organization,
            offers: res.data,
        }), console.error);
    };

    $dir.cancelApplications = (providerFunds = []) => {
        const sponsor_organization_name = providerFunds.length == 1 ?
            providerFunds[0]?.fund?.organization?.name || '' :
            '';

        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description', { sponsor_organization_name }),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            text_align: 'center',
            onConfirm: () => {
                $q.all(providerFunds.map((provider) => {
                    return ProviderFundService.cancelApplication($dir.organization.id, provider.id);
                })).then(() => {
                    PushNotificationsService.success('Opgeslagen!');
                }).finally(() => {
                    $dir.onPageChange($dir.filters.values);
                    typeof $dir.onChange === 'function' ? $dir.onChange() : null;
                });
            },
        });
    };

    $dir.unsubscribe = (providerFund) => {
        ModalService.open('fundUnsubscribe', {
            organization: $dir.organization,
            providerFund: providerFund,
            onUnsubscribe: () => {
                $dir.onPageChange($dir.filters.values);
                typeof $dir.onChange === 'function' ? $dir.onChange() : null;
            },
        });
    }

    $dir.fetchFunds = (filters = {}) => {
        return ProviderFundService.listFunds($dir.organization.id, {
            active: $dir.type == 'active' ? 1 : 0,
            pending: $dir.type == 'pending_rejected' ? 1 : 0,
            archived: $dir.type == 'archived' ? 1 : 0,
            ...filters,
        });
    }

    $dir.onPageChange = (filters) => {
        $dir.selected = [];
        PageLoadingBarService.setProgress(0);

        return $dir.fetchFunds(filters)
            .then((res) => $dir.providerFunds = res.data)
            .finally(() => PageLoadingBarService.setProgress(100));
    }

    $dir.$onInit = () => {
        $dir.loading = true;

        $dir.onPageChange($dir.filters).finally(() => {
            $dir.loading = false;
            $scope.$watch('$dir.selected', () => $dir.updateActions(), true);
            $scope.$watch('$dir.providerFunds', () => $dir.updateActions(), true);
        });
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            type: '@',
            onChange: '&',
            organization: '=',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$filter',
            'ModalService',
            'ProductService',
            'PaginatorService',
            'ProviderFundService',
            'PageLoadingBarService',
            'PushNotificationsService',
            ProviderFundsTableDirective,
        ],
        templateUrl: 'assets/tpl/directives/provider-funds-table.html',
    };
};