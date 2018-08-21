let CsvValidationComonent = function(
    $scope
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {};
};

module.exports = {
    bindings: {
        prevalidations: '<',
        recordTypes: '<',
    },
    controller: [
        '$scope',
        CsvValidationComonent
    ],
    templateUrl: 'assets/tpl/pages/csv-validation.html'
};