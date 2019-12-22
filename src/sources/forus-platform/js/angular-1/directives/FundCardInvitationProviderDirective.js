let FundCardInvitationProviderDirective = function(
    $scope,
    $state,
    FundProviderInvitationsService,
    PushNotificationsService
) {
    $scope.fund = $scope.providerInvitation.fund;
    
    $scope.acceptInvitation = () => {
        FundProviderInvitationsService.acceptInvitationById(
            $scope.providerInvitation.provider_organization.id, 
            $scope.providerInvitation.id
        ).then(res => {
            PushNotificationsService.success('Invitation successfully accepted!');

            $state.go($state.current, {
                fundsType: 'invitations'
            }, {reload: true});
        }, console.error);
    };
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
            providerInvitation: '=',
            type: '@'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            'FundProviderInvitationsService',
            'PushNotificationsService',
            FundCardInvitationProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-invitation-provider.html' 
    };
};