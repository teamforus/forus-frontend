let PrevalidatedTableDirective = function(
    $q,
    $scope,
    $filter,
    $element,
    $timeout,
    PrevalidationService,
    ProgressFakerService
) {
    $scope.filter = {
        query: ''
    };

    $scope.$on('csv:uploaded', function() {
        PrevalidationService.list().then(function(res) {
            $scope.prevalidations = res.data.data;
            $scope.updateRows();
        });
    });

    $scope.updateRows = function() {
        $scope.rows = $scope.prevalidations.filter(function(row) {
            let query = $scope.filter.query + '';

            if (!query || (row.uid.indexOf(query) != -1)) {
                return true;
            }

            for (var i = row.records.length - 1; i >= 0; i--) {
                let recordValue = row.records[i].value;

                if ((recordValue + '').indexOf(query) != -1) {
                    return true;
                }
            }

            return false;
        });
    };

    // Export to CSV file
    $scope.exportList = function(e) {
        e && (e.preventDefault() & e.stopPropagation());

        var data = $scope.rows.map(function(row) {
            let mapRow = {
                "Code": row.uid
            };

            row.records.forEach(function(record) {
                mapRow[record.name] = record.value;
            });

            return mapRow;
        });

        var file_name = 'forus-platform.csv';
        var file_type = 'text/csv;charset=utf-8;';
        var file_data = Papa.unparse(data);

        var blob = new Blob([file_data], {
            type: file_type,
        });

        saveAs(blob, file_name);
    };

    $scope.$watch('filter.query', function(current, old) {
        $scope.updateRows();
    }, true);

    $scope.updateRows();

    $scope.typesByKey = {};
    $scope.recordTypes.forEach(element => {
        $scope.typesByKey[element.key] = element.name;
    });
};

module.exports = () => {
    return {
        scope: {
            prevalidations: '=',
            recordTypes: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$filter',
            '$element',
            '$timeout',
            'PrevalidationService',
            'ProgressFakerService',
            PrevalidatedTableDirective
        ],
        templateUrl: 'assets/tpl/directives/prevalidated-table.html' 
    };
};