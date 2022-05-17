module.exports = [() => {
    return new(function () {
        this.hasPermission = (organization, permissions, all = true) => {
            if (!organization || !organization.permissions) {
                return false;
            }

            if (typeof (permissions) === 'string') {
                permissions = [permissions];
            }


            if (all) {
                return permissions.filter((permissionItem) => {
                    return organization.permissions.indexOf(permissionItem) !== -1;
                }).length == permissions.length;
            }

            return permissions.filter((permissionItem) => {
                return organization.permissions.indexOf(permissionItem) !== -1;
            }).length > 0;
        };

        this.getRoutePermissionsMap = (type='sponsor') => {
            return {
                sponsor: [{
                    permissions: ['manage_funds', 'view_finances', 'view_funds'],
                    name: 'organization-funds',
                }, {
                    permissions: ['manage_vouchers'],
                    name: 'vouchers',
                }, {
                    permissions: ['view_finances'],
                    name: 'transactions',
                }, {
                    permissions: ['validate_records'],
                    name: 'csv-validation',
                }],
                provider: [{
                    permissions: ['manage_employees'],
                    name: 'provider-overview',
                }, {
                    permissions: ['manage_offices'],
                    name: 'offices',
                }, {
                    permissions: ['manage_products'],
                    name: 'products',
                }, {
                    permissions: ['view_finances'],
                    name: 'transactions',
                }, {
                    permissions: ['validate_records'],
                    name: 'csv-validation',
                }, {
                    permissions: ['scan_vouchers'],
                    name: 'reservations',
                }],
                validator: [{
                    permissions: ['validate_records', 'manage_validators'],
                    name: 'fund-requests',
                }]
            }[type];
        };

        this.getAvailableRoutes = (type, organization) => {
            return this.getRoutePermissionsMap(type).filter((permission) => {
                return this.hasPermission(organization, permission.permissions, false);
            });
        };
    });
}];