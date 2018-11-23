let OrganizationsComponent = function(
    $state,
    appConfigs,
    OrganizationService
) {
    let $ctrl = this;

    OrganizationService.clearActive();

    let invalidPermissions = {
        sponsor: [
            "manage_provider_funds", "manage_products", "manage_offices",
            "scan_vouchers"
        ],
        provider: [
            "manage_funds", "manage_providers", "manage_validators",
            "validate_records", "scan_vouchers"
        ]
    } [appConfigs.panel_type];

    OrganizationService.list().then(res => {
        $ctrl.organizations = res.data.data.filter(organization => {
            return organization.permissions.filter((permission => {
                return invalidPermissions.indexOf(permission) == -1;
            })).length > 0;
        });
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
        '$state',
        'appConfigs',
        'OrganizationService',
        OrganizationsComponent
    ],
    templateUrl: 'assets/tpl/pages/organizations.html'
};