let FundCardInvitationProviderDirective = function(
    $scope,
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

            if (typeof $scope.onAccept === 'function') {
                $scope.onAccept();
            }
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
            type: '@',
            onAccept: '&'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'FundProviderInvitationsService',
            'FormBuilderService',
            'PushNotificationsService',
            FundCardInvitationProviderDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-card-invitation-provider.html' 
    };
};
