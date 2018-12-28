let HomeComponent = function(
    $scope,
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

    $scope.openAuthCodePopup = function () {
        ModalService.open('modalAuthCode', {});
    };

    $scope.openActivateCodePopup = function () {
        ModalService.open('modalActivateCode', {});
    };


};

module.exports = {
    bindings: {},
    scope: {
        text: '=',
        button: '=',
    },
    controller: [
        '$scope',
        '$stateParams',
        'ModalService',
        HomeComponent
    ],
    templateUrl: 'assets/tpl/pages/home.html'
};