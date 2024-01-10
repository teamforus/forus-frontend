const ProviderFundsInvitationTableDirective = function (
    $q,
    $scope,
    $filter,
    PaginatorService,
    PageLoadingBarService,
    PushNotificationsService,
    FundProviderInvitationsService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');

    $dir.selected = [];
    $dir.selectedMeta = {};
    $dir.paginationPerPageKey = "provider_funds_invitations";

    $dir.filters = {
        q: '',
        per_page: PaginatorService.getPerPage($dir.paginationPerPageKey, 10),
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
        const selected = $dir.invitations.data?.filter((item) => $dir.selected.includes(item.id));

        $dir.selectedMeta.selected = selected;
        $dir.selectedMeta.selected_active = selected.filter((item) => item.can_be_accepted);
    };

    $dir.acceptInvitations = (invitations = []) => {
        $q.all(invitations.map((item) => {
            return FundProviderInvitationsService.acceptInvitationById($dir.organization.id, item.id);
        })).then(() => {
            PushNotificationsService.success('Uitnodiging succesvol geaccepteerd!');
        }).finally(() => {
            $dir.onPageChange($dir.filters.values);
            typeof $dir.onChange === 'function' ? $dir.onChange() : null;
        });
    };

    $dir.mapProviderFunds = (items) => {
        return items.map((item) => ({
            ...item,
            ...(item.state ? {
                status_text: $translate(`provider_funds.status.${item.expired ? 'expired' : item.state}`),
                status_class: (item.state == 'pending' && !item.expired) ? 'tag-warning' : (item.expired ? 'tag-default' : 'tag-success'),
            } : {
                status_text: $translate('provider_funds.status.closed'),
                status_class: 'tag-default',
            })
        }));
    };

    $dir.fetchInvitations = (filters = {}) => {
        return FundProviderInvitationsService.listInvitations($dir.organization.id, {
            ...filters,
            expired: $dir.type == 'invitations_archived' ? 1 : 0,
        });
    }

    $dir.onPageChange = (filters = {}) => {
        $dir.selected = [];
        PageLoadingBarService.setProgress(0);

        return $dir.fetchInvitations(filters).then((res) => {
            $dir.invitations = res.data;
            $dir.invitations.data = $dir.mapProviderFunds($dir.invitations.data);
        }).finally(() => PageLoadingBarService.setProgress(100));
    }

    $dir.$onInit = () => {
        $dir.loading = true

        $dir.onPageChange($dir.filters.values).finally(() => {
            $dir.loading = false;
            $scope.$watch('$dir.selected', () => $dir.updateActions(), true);
            $scope.$watch('$dir.invitations', () => $dir.updateActions(), true);
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
            'PaginatorService',
            'PageLoadingBarService',
            'PushNotificationsService',
            'FundProviderInvitationsService',
            ProviderFundsInvitationTableDirective,
        ],
        templateUrl: 'assets/tpl/directives/provider-funds-invitation-table.html',
    };
};