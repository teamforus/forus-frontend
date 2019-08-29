let EmailPreferencesComponent =  (
    $state,
    $scope,
    $stateParams,
    EmailPreferencesService
) => {
    let $ctrl = this;

    // $scope.onPageChange = async (query) => {
    //     EmailPreferencesService.getPreferences($stateParams.identity_address).then(res => {
    //         $ctrl.preferences = res.data.preferences;
    //     })
    // }
}

module.exports = {
    controller: [
        '$state',
        '$scope',
        '$stateParams',
        'EmailPreferencesService',
        EmailPreferencesComponent
    ],
    templateUrl: 'assets/tpl/pages/email-preferences.html'
};
