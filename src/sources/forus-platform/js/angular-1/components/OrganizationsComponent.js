let OrganizationsComponent = function(
    $state,
    appConfigs,
    OrganizationService
) {
    let $ctrl = this;
    $ctrl.showOrganizations = false;

    OrganizationService.clearActive();

    let invalidPermissions = {
        sponsor: [
            "manage_provider_funds", "manage_products", "manage_offices",
            "scan_vouchers"
        ],
        provider: [
            "manage_funds", "manage_providers", "manage_validators",
            "validate_records", "scan_vouchers"
        ],
        validator: []
    } [appConfigs.panel_type];

    let requiredPermissions = {
        sponsor: [

        ],
        provider: [

        ],
        validator: [
            "scan_vouchers"
        ]
    };

    OrganizationService.list({
        dependency: "permissions,logo"
    }).then(res => {
        $ctrl.organizations = res.data.data.filter(organization => {
            return organization.permissions.filter((permission => {
                return invalidPermissions.indexOf(permission) == -1;
            })).length > 0;
        });

        $ctrl.organizations.filter(organization => {
            return requiredPermissions.validator.filter(permission => {
                return organization.permissions.indexOf(permission) != -1;
            }).length == requiredPermissions.validator.length;
        })

        if ($ctrl.organizations.length == 1) {
            $ctrl.chooseOrganization($ctrl.organizations[0]);
        }else{
            $ctrl.showOrganizations = true;
        }
    });

    $ctrl.chooseOrganization = (organization) => {
        OrganizationService.use(organization.id);

        $state.go({
            sponsor: 'organization-funds',
            provider: 'offices',
            validator: 'fund-requests',
        }[appConfigs.panel_type], {
            organization_id: organization.id
        });
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