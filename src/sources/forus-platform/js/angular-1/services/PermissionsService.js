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

        this.getRoutes = () => {
            return {
                'sponsor': [{
                    'permissions': ['manage_funds', 'view_finances', 'view_funds'],
                    'route': 'organization-funds',
                }, {
                    'permissions': ['manage_vouchers'],
                    'route': 'vouchers',
                }, {
                    'permissions': ['view_finances'],
                    'route': 'transactions',
                }, {
                    'permissions': ['validate_records'],
                    'route': 'csv-validation',
                }],
                'provider': [{
                    'permissions': ['manage_offices'],
                    'route': 'offices',
                }, {
                    'permissions': ['manage_products'],
                    'route': 'products',
                }, {
                    'permissions': ['view_finances'],
                    'route': 'transactions',
                }, {
                    'permissions': ['validate_records'],
                    'route': 'csv-validation',
                }],
                'validator': [{
                    'permissions': ['validate_records'],
                    'route': 'fund-requests',
                }]
            };
        }
    });
}];