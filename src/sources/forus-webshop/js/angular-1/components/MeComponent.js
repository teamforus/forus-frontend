const MeComponent = function($state, $stateParams) {
    if ($stateParams.confirmed) {
        $state.go('start');
    }
};

module.exports = {
    bindings: {},
    scope: {
        text: '=',
        button: '=',
    },
    controller: [
        '$state',
        '$stateParams',
        MeComponent
    ],
    templateUrl: 'assets/tpl/pages/me.html'
};