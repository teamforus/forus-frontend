let HomeComponent = function(
    $stateParams,
    ModalService
) {
    let $ctrl = this;

    $ctrl.showPopupOffices = function() {
        ModalService.open('modalOffices', {});
    };

    if ($stateParams.confirmed) {
        ModalService.open('modalActivateCode', {});
    }
};

module.exports = {
    bindings: {},
    controller: [
        '$stateParams',
        'ModalService',
        HomeComponent
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};