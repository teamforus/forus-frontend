let WebsiteNavbarDirective = function(
    $scope,
    ModalService,
) {

    $scope.openAuthPopup = function () {
        ModalService.open('modalAuth2', {});
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
            WebsiteNavbarDirective
        ],

        templateUrl: 'assets/tpl/directives/website/navbar.html'
    };
};