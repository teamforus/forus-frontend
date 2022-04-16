const FundRequestValidatorPersonDirective = function() {};

module.exports = () => {
    return {
        scope: {
            person: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            FundRequestValidatorPersonDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-request-validator-person.html'
    };
};