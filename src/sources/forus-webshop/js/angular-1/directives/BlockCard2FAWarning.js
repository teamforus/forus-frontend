const BlockCard2FAWarning = function ($scope) {
    const $dir = $scope.$dir;

    $dir.$onInit = () => {
        $dir.settings = $dir.fund.auth_2fa_policy == 'global' ? $dir.fund.organization_funds_2fa : $dir.fund;

        $dir.hasRestrictions = $dir.settings.auth_2fa_policy == 'restrict_features' && (
            $dir.settings.auth_2fa_restrict_emails ||
            $dir.settings.auth_2fa_restrict_auth_sessions ||
            $dir.settings.auth_2fa_restrict_reimbursements
        );
    };
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            buttonPosition: '@',
        },
        replace: false,
        bindToController: true,
        controllerAs: '$dir',
        restrict: "AE",
        controller: [
            '$scope',
            BlockCard2FAWarning,
        ],
        templateUrl: 'assets/tpl/directives/block-card-2fa-warning.html',
    };
};
