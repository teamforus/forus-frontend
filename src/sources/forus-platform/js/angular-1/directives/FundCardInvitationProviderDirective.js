let FundCardInvitationProviderDirective = function(
    $scope,
    $state,
    FundProviderInvitationsService,
    FormBuilderService,
    PushNotificationsService
) {
    $scope.fund = $scope.providerInvitation.fund;

    $scope.providerInvitationForm = FormBuilderService.build({}, function(form) {
        FundProviderInvitationsService.acceptInvitationById(
            $scope.providerInvitation.provider_organization.id, 
            $scope.providerInvitation.id
        ).then(() => {
            PushNotificationsService.success('Uitnodiging succesvol geaccepteerd!');

            $state.go($state.current, {
                fundsType: 'invitations'
            }, {reload: true});
        }, console.error);
    }, true);
    
    $scope.acceptInvitation = () => {
        $scope.providerInvitationForm.submit();
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
            'FormBuilderService',
            'PushNotificationsService',
            FundCardInvitationProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-invitation-provider.html' 
    };
};
