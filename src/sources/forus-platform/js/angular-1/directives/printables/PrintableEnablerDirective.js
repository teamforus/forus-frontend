module.exports = [() => {
    let PrintableScrollBrakeDirective = function($scope, $element, PrintableService) {
        $scope.printables = PrintableService.getPrintables();
        
        $scope.$watch('printables', (printables) => {
            if (!printables) return;
            
            if (printables.length > 0) {
                $element.addClass('printable-only');
            } else {
                $element.removeClass('printable-only');
            }
        }, true);
    };

    return {
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            'PrintableService',
            PrintableScrollBrakeDirective
        ]
    };
}];