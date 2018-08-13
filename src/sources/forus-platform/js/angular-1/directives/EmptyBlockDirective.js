let EmptyBlockDirective = function($scope) {

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
            EmptyBlockDirective
        ],
        templateUrl: 'assets/tpl/directives/empty-block.html' 
    };
};