const Auth2FAInfoBoxDirective = function() {};

module.exports = () => {
    return {
        replace: true,
        controllerAs: '$dir',
        restrict: "AE",
        controller: [
            Auth2FAInfoBoxDirective
        ],
        template: require('../../../pug/tpl/directives/auth-2fa-info-box.pug'),
    };
};