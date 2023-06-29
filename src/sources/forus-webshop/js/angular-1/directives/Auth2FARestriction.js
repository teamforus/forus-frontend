const get = require('lodash/get');

const Auth2FARestriction = function (
    $scope,
) {
    const $dir = $scope.$dir;

    $dir.$onInit = () => {
        $dir.itemsList = $dir.items.map((item) => {
            return {
                name: get(item, $dir.itemName),
                thumbnail: get(item, $dir.itemThumbnail),
            };
        });
    };
};

module.exports = () => {
    return {
        scope: {
            type: "@",
            items: "=",
            itemName: '@',
            itemThumbnail: '@',
            defaultThumbnail: "@",
        },
        replace: false,
        bindToController: true,
        controllerAs: '$dir',
        restrict: "AE",
        controller: [
            '$scope',
            Auth2FARestriction,
        ],
        templateUrl: 'assets/tpl/directives/auth-2fa-restriction.html',
    };
};