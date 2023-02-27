const ReimbursementDetailsDirective = function ($scope) {
    const { $dir } = $scope;

    $dir.prevPreviewMedia = () => {
        const { files } = $dir.reimbursement;

        $dir.previewIndex = $dir.previewIndex <= 0 ? files.length - 1 : $dir.previewIndex - 1;
    };

    $dir.nextPreviewMedia = () => {
        const { files } = $dir.reimbursement;

        $dir.previewIndex = $dir.previewIndex >= files.length - 1 ? 0 : $dir.previewIndex + 1;
    };

    $dir.$onInit = () => {
        $dir.previewIndex = 0;
    };
};

module.exports = () => {
    return {
        scope: {
            reimbursement: '=',
            edit: '=',
            compact: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ReimbursementDetailsDirective,
        ],
        templateUrl: 'assets/tpl/directives/reimbursement-details.html',
    };
};