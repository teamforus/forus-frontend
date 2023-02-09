const ProviderFundsInvitationTableDirective = function (
    FundProviderInvitationsService,
    PushNotificationsService,
    $scope,
    $filter,
    $q
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');

    $dir.allSelected = false;
    $dir.hasSelected = false;
    $dir.selected = {};
    $dir.selectedForInvitation = [];
    $dir.selectedCount = 0;

    const trans_fund_provider_empty = (key) => {
        return $translate('provider_funds.empty_block.' + key);
    };

    const updateHasSelected = () => {
        const items = [];
        const invitationItems = [];

        Object.keys($dir.selected).forEach((key) => {
            if ($dir.selected[key]) {
                let invitation = $dir.invitations.filter((item) => item.id == key)[0];

                if (invitation) {
                    items.push(invitation);

                    if (
                        invitation.fund.state != 'closed' &&
                        invitation.state == 'pending' &&
                        !invitation.expired
                    ) {
                        invitationItems.push(invitation);
                    }
                }
            }
        });

        $dir.hasSelected = !!items.length;
        $dir.allSelected = items.length === $dir.invitations?.length;
        $dir.selectedForInvitation = invitationItems;
        $dir.selectedCount = items.length;
    }

    $dir.updateAllSelected = () => {
        $dir.allSelected
            ? $dir.invitations.forEach((item) => $dir.selected[item.id] = true)
            : $dir.selected = {};
    };

    $dir.acceptInvitation = (providerInvitation) => {
        FundProviderInvitationsService.acceptInvitationById(
            providerInvitation.provider_organization.id,
            providerInvitation.id
        ).then(() => successAcceptInvitation(), console.error);
    };

    $dir.acceptSelectedInvitations = () => {
        const promises = [];
        $dir.selectedForInvitation.forEach((invitation) => {
            promises.push(
                FundProviderInvitationsService.acceptInvitationById(
                    invitation.provider_organization.id,
                    invitation.id
                )
            );
        });

        if (promises.length) {
            $q.all(promises).then(() => {
                successAcceptInvitation()
                $dir.selected = {};
            });
        }
    }

    const successAcceptInvitation = () => {
        PushNotificationsService.success('Uitnodiging succesvol geaccepteerd!');

        if (typeof $dir.onRemoved === 'function') {
            $dir.onRemoved();
        }
    }

    const mapProviderFunds = () => {
        $dir.invitations = $dir.items.map((providerInvitation) => {
            if (providerInvitation.state) {
                providerInvitation.status_text = $translate(
                    'provider_funds.status.' + (providerInvitation.expired ? 'expired' : providerInvitation.state)
                );

                if (providerInvitation.state == 'pending' && !providerInvitation.expired) {
                    providerInvitation.status_class = 'tag-warning';
                } else {
                    providerInvitation.status_class = providerInvitation.expired
                        ? 'tag-default' : 'tag-success';
                }
            } else {
                providerInvitation.status_text = $translate('provider_funds.status.closed');
                providerInvitation.status_class = 'tag-default';
            }

            return providerInvitation;
        });

        updateHasSelected();
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
            'FundProviderInvitationsService',
            'PushNotificationsService',
            '$scope',
            '$filter',
            '$q',
            ProviderFundsInvitationTableDirective
        ],
        templateUrl: 'assets/tpl/directives/provider-funds-invitation-table.html'
    };
};