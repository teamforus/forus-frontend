let EmailPreferencesComponent =  (
    $state,
    $scope,
    $stateParams,
    EmailPreferencesService
) => {
    let $ctrl = this;
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
