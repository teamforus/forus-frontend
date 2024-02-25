let NewsComponent = function($scope, $timeout) {
    $scope.email = 'info@forus.io';
    $scope.showCopiedMsg = false;

    $scope.copyToClipboard = function() {
        navigator.clipboard.writeText('info@forus.io');
        $scope.showCopiedMsg = true;

        $timeout(function() {
            $scope.showCopiedMsg = false;
        }, 1000);
    }
};

module.exports = {
    controller: [
        '$scope',
        '$timeout',
        NewsComponent
    ],
    templateUrl: 'assets/tpl/pages/website/news.html'
};