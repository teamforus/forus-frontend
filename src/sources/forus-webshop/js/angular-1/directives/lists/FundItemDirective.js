const FundItemDirective = function($scope, ModalService, FundService) {
    const $dir = $scope.$dir = {};

    $dir.applyFund = function(fund) {
        if (fund.taken_by_partner) {
            return $dir.showPartnerModal();
        }

        if ($dir.applyingFund) {
            return;
        } else {
            $dir.applyingFund = true;
        }

        FundService.apply(fund.id).then(function(res) {
            $dir.applyingFund = false;
            $state.go('voucher', res.data.data);
        }, console.error).finally(() => $dir.applyingFund = false);
    };

    $dir.showPartnerModal = () => {
        ModalService.open('modalNotification', {
            type: 'info',
            title: 'Dit tegoed is al geactiveerd',
            closeBtnText: 'Bevestig',
            description: [
                "U krijgt deze melding omdat het tegoed is geactiveerd door een ",
                "famielid of voogd. De tegoeden zijn beschikbaar in het account ",
                "van de persoon die deze als eerste heeft geactiveerd."
            ].join(''),
        });
    };

    $dir.addFundMeta = (fund, vouchers) => {
        fund.vouchers = vouchers.filter(voucher => voucher.fund_id == fund.id && !voucher.expired);
        fund.isApplicable = fund.criteria.filter(criterion => !criterion.is_valid).length == 0;
        fund.alreadyReceived = fund.vouchers.length !== 0;

        fund.showPendingButton = !fund.alreadyReceived && fund.has_pending_fund_requests;
        fund.showActivateButton = !fund.alreadyReceived && fund.isApplicable;

        return fund;
    };

    $dir.fund = $dir.addFundMeta($scope.fund, $scope.vouchers);
    $dir.media = $dir.fund.logo || $dir.fund.organization.logo || null;
    $dir.applyingFund = false;
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            vouchers: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ModalService',
            'FundService',
            FundItemDirective
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/funds/' + ($attr.template || 'fund-item-list') + '.html'
        }
    };
};
