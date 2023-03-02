const ProviderFundUnsubscriptionsTableDirective = function (
    $q,
    $scope,
    $filter,
    ModalService,
    PageLoadingBarService,
    FundUnsubscribeService,
    PushNotificationsService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.cancel_provider_unsubscription.${key}`);

    $dir.selected = [];
    $dir.selectedMeta = {};

    $dir.filtersDefault = {
        q: '',
        state: null,
        per_page: 10,
    };

    $dir.filters = {
        show: false,
        values: { ...$dir.filtersDefault },
        valuesDefault: { ...$dir.filtersDefault },
        reset: () => $dir.filters.values = { ...$dir.filters.valuesDefault }
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
        const selected = $dir.items.data?.filter((item) => $dir.selected.includes(item.id));

        $dir.selectedMeta.selected = selected;
        $dir.selectedMeta.selected_cancel = selected.filter((item) => item.can_cancel);
    };

    $dir.setState = (state) => {
        if ($dir.filters.values.state != state) {
            $dir.loading = true;
            $dir.filters.values.state = state;
        }
    };

    $dir.fetchUnsubscriptions = (filters = {}) => {
        return FundUnsubscribeService.listProvider($dir.organization.id, filters);
    };

    $dir.onPageChange = (filters) => {
        $dir.selected = [];
        PageLoadingBarService.setProgress(0);

        return $dir.fetchUnsubscriptions(filters)
            .then((res) => $dir.items = res.data)
            .finally(() => {
                $dir.loading = false;
                PageLoadingBarService.setProgress(100);
            });
    };

    $dir.cancelUnsubscriptions = (unsubscriptions) => {
        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            text_align: 'center',
            onConfirm: () => {
                $q.all(unsubscriptions.map((item) => FundUnsubscribeService.update($dir.organization.id, item.id, {
                    canceled: 1,
                }))).then(
                    () => PushNotificationsService.success('Opgeslagen!'),
                    (res) => PushNotificationsService.danger('Error!', res?.data?.message),
                ).finally(() => {
                    $dir.onPageChange($dir.filters.values);
                    typeof $dir.onChange === 'function' ? $dir.onChange() : null;
                });
            },
        });
    };

    $dir.showTooltip = (e, target) => {
        e.stopPropagation();
        $dir.items.data.forEach((item) => item.showTooltip = item == target);
    };

    $dir.hideTooltip = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        item.showTooltip = false;
    };

    $dir.resetFilters = () => {
        $dir.filters.reset();
    };

    $dir.hideFilters = () => {
        $dir.filters.show = false;
    };

    $dir.$onInit = () => {
        $dir.loading = true;

        $dir.onPageChange($dir.filters.values).then(() => {
            $dir.loading = false;
            $scope.$watch('$dir.selected', () => $dir.updateActions(), true);
            $scope.$watch('$dir.items', () => $dir.updateActions(), true);
        });
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
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
            'PageLoadingBarService',
            'FundUnsubscribeService',
            'PushNotificationsService',
            ProviderFundUnsubscriptionsTableDirective,
        ],
        templateUrl: 'assets/tpl/directives/provider-fund-unsubscriptions-table.html',
    };
};