const BlockCard2FAWarning = function($scope) {
    const $dir = $scope.$dir;
    
    $dir.setShowMore2FADetails = (e, showMore2FADetails = false) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        $dir.showMore2FADetails = showMore2FADetails;
    };

    $dir.$onInit = () => {
        $dir.expandButtonPos = $dir.expandButtonPos || 'top';

        const global2Fa = $dir.fund.auth_2fa_policy == 'global';
        const prefix2FA = global2Fa ? 'funds_' : '';
        const settings2FA = global2Fa ? $dir.fund.organization_funds_2fa : $dir.fund;
        
        $dir.policy = settings2FA[`auth_2fa_${prefix2FA}policy`];

        if ($dir.policy == 'restrict_features') {
            $dir.restrictEmails = settings2FA[`auth_2fa_${prefix2FA}restrict_emails`];
            $dir.restrictSessions = settings2FA[`auth_2fa_${prefix2FA}restrict_auth_sessions`];
            $dir.restrictReimbursements = settings2FA[`auth_2fa_${prefix2FA}restrict_reimbursements`];
            $dir.hasRestrictions = $dir.restrictEmails || $dir.restrictSessions || $dir.restrictReimbursements;
        }
    };
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            expandButtonPos: '@',
        },
        replace: false,
        bindToController: true,
        controllerAs: '$dir',
        restrict: "AE",
        controller: [
            '$scope',
            BlockCard2FAWarning,
        ],
        templateUrl: 'assets/tpl/directives/block-card-2fa-warning.html'
    };
};
