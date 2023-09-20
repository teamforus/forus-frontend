module.exports = [() => {
    let MobileMenuScrollBreakerDirective = function($rootScope, $element) {
        $rootScope.$watch('mobileMenuOpened', (mobileMenuOpened) => {
            $element.css('overflow', mobileMenuOpened ? 'hidden' : 'auto');
        }, true);
    };

    return {
        restrict: "EA",
        replace: true,
        controller: [
            '$rootScope',
            '$element',
            MobileMenuScrollBreakerDirective
        ]
    };
}];