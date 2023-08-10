let AppLinksDirective = function($scope) {
    $scope.showDlButton = typeof $scope.showDl === 'undefined' ? true : $scope.showDl;
    $scope.showIosButton = typeof $scope.showIos === 'undefined' ? true : $scope.showIos;
    $scope.showAndroidButton = typeof $scope.showAndroid === 'undefined' ? true : $scope.showAndroid;
    $scope.theme = typeof $scope.theme === 'undefined' ? 'dark' : null;
    
    $scope.dlId = typeof $scope.dlId === 'undefined' ? 'dl_button' : $scope.dlId;
    $scope.iosId = typeof $scope.iosId === 'undefined' ? 'ios_button' : $scope.iosId;
    $scope.androidId = typeof $scope.androidId === 'undefined' ? 'android_button' : $scope.androidId;
};

module.exports = () => {
    return {
        scope: {
            type: '@',
            showDl: '=',
            showIos: '=',
            showAndroid: '=',
            dlId: '@',
            iosId: '@',
            androidId: '@',
            theme: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope', 
            AppLinksDirective
        ],
        templateUrl: 'assets/tpl/directives/elements/app-links.html'
    };
};