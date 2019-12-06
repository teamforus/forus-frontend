module.exports = ['PermissionsService', (PermissionsService) => {
    return function(organization, permissions, all = true) {
        return PermissionsService.hasPermission(organization, permissions, all);
    }
}];