let OrganizationsComponent = function(
    $scope, 
    $state, 
    appConfigs,
    OrganizationService
) {
    let $ctrl = this;
    
    OrganizationService.clearActive();

    OrganizationService.list().then(res => {
        $ctrl.organizations = res.data.data;
    });

    $ctrl.chooseOrganization = (organization) => {
        OrganizationService.use(organization.id);

        if (appConfigs.panel_type == 'sponsor') {
            $state.go('funds');
        } else {
            $state.go('offices', {
                organization_id: organization.id
            });
        }
    };
};

module.exports = {
    controller: [
        '$scope', 
        '$state', 
        'appConfigs', 
        'OrganizationService',
        OrganizationsComponent
    ],
    templateUrl: 'assets/tpl/pages/organizations.html'
};