const ReimbursementCardDirective = function (
    $scope,
    ReimbursementService,
) {
    const { $dir } = $scope;

    $dir.cancelReimbursement = ($event, reimbursement) => {
        $event.preventDefault();
        $event.stopPropagation();

        ReimbursementService.confirmDestroy(reimbursement).then((success) => {
            if (success) {
                $dir.onDelete();
            }
        });
    };

    $dir.$onInit = () => {
        $dir.product = $dir.reimbursement;
        $dir.media = null;
    };
};

module.exports = () => {
    return {
        scope: {
            reimbursement: '=',
            onDelete: '&',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ReimbursementService',
            ReimbursementCardDirective,
        ],
        templateUrl: 'assets/tpl/directives/reimbursement-card.html',
    };
};