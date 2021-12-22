const snakeCase = require('lodash/snakeCase');

function ErrorComponent($state, $stateParams) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.errorCode = snakeCase($stateParams.errorCode);
        $ctrl.hideHomeLinkButton = $stateParams.hideHomeLinkButton;

        $ctrl.transParams = {
            url_webshop_home: $state.href('home', {}, { absolute: true }),
            url_webshop_start: $state.href('start', {}, { absolute: true }),
            url_webshop_start_logout: $state.href('start', { logout: 1, restore_with_digid: 1 }, { absolute: true }),
        };
    };
}

module.exports = {
    bindings: {
        errorCode: '=',
        hideHomeLinkButton: '=',
    },
    controller: [
        '$state',
        '$stateParams',
        ErrorComponent,
    ],
    templateUrl: 'assets/tpl/pages/error.html',
};
