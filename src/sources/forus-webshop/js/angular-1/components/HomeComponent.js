let HomeComponent = function(
    ModalService
) {
    let $ctrl = this;

    $ctrl.showPopupOffices = function() {
        ModalService.open('modalOffices', {});
    };
};

module.exports = {
    bindings: {},
    controller: [
        'ModalService',
        HomeComponent
    ],

    templateUrl: (appConfigs) => {
            return 'assets/tpl/pages/home.html'
    }
};