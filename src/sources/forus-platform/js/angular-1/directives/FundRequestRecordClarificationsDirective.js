const FundRequestRecordClarificationsDirective = function(
    $scope,
    FundRequestValidatorService,
) {
    const { $dir } = $scope;

    $dir.downloadFile = (file) => {
        FundRequestValidatorService.downloadFile(file);
    };

    $dir.hasFilePreview = (file) => {
        FundRequestValidatorService.hasFilePreview(file);
    };

    $dir.previewFile = ($event, file) => {
        FundRequestValidatorService.previewFile($event, file);
    };

    $dir.$onInit = () => {};
};

module.exports = () => {
    return {
        scope: {
            fundRequest: '=',
            fundRequestRecord: '=',
            organization: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'FundRequestValidatorService',
            FundRequestRecordClarificationsDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-request-record-clarifications.html'
    };
};