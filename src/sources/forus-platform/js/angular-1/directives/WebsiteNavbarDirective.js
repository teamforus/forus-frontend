let WebsiteNavbarDirective = function(
    $scope,
    ModalService,
    ConfigService
) {
    $scope.mobileMenu = false;
    
    $scope.openPinCodePopup = function () {
        ModalService.open('modalPinCode', {});
    };

    $scope.openAuthPopup = function () {
        console.log("hey")
        ModalService.open('modalAuth', {});
    };

    $scope.scrolled = false;
    var prevScrollpos = window.pageYOffset;

    $scope.setScrolled = function() {
        var currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos || currentScrollPos <= 0) {
            $scope.scrolled= false;
        } else {
            $scope.scrolled = true;
        }
        prevScrollpos = currentScrollPos;
        $scope.$apply();
    }
    window.addEventListener('scroll', $scope.setScrolled)

    $scope.cfg = {
        logoExtension: ConfigService.getFlag('logoExtension'),
    };
};

module.exports = () => {
    return {
        scope: {
            text: '=',
            button: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ModalService',
            'ConfigService',
            WebsiteNavbarDirective
        ],

        templateUrl: 'assets/tpl/directives/website/navbar.html'
    };
};