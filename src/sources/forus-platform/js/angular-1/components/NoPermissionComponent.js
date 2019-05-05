let NoPermissionComponent = function() {
    this.$onInit = () => {};
};

module.exports = {
    bindings: {
        message: '<'
    },
    controller: [
        '$scope',
        NoPermissionComponent
    ],
    templateUrl: 'assets/tpl/pages/no-permission.html'
};