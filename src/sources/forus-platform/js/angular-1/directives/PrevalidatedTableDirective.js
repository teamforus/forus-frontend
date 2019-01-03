let FileSaver = require('file-saver');

let PrevalidatedTableDirective = async function(
    $scope,
    PrevalidationService
) {
    $scope.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'used',
        name: 'Ja'
    }, {
        key: 'pending',
        name: 'Nee'
    }];

    $scope.statesExported = [{
        key: null,
        name: 'Alle'
    }, {
        key: 1,
        name: 'Ja'
    }, {
        key: 0,
        name: 'Nee'
    }];

    $scope.filter = {
        q: '',
        fund_id: $scope.fund ? $scope.fund.id : null,
        state: $scope.states[0].key,
        exported: $scope.statesExported[0].key,
    };


    $scope.$on('csv:uploaded', function() {
        $scope.filter.page = 1;
        $scope.onPageChange($scope.filter);
    })

    $scope.onPageChange = async (query) => {
        PrevalidationService.list(query).then((res => {
            $scope.prevalidations = res.data;
        }));
    };

    $scope.onReset = async (query) => {
        PrevalidationService.list(query).then((res => {
            $scope.prevalidations = res.data;
        }));
    };

    $scope.onLoadMore = async (query) => {
        PrevalidationService.list(query).then((res => {
            $scope.prevalidations.data = $scope.prevalidations.data.concat(res.data.data);
            $scope.prevalidations.meta = res.data.meta;
        }));
    };

    $scope.init = async () => {
        PrevalidationService.list($scope.filter).then((res => {
            $scope.prevalidations = res.data;
        }));
    };

    // Export to CSV file
    $scope.exportList = function(filters = {}) {
        PrevalidationService.export(
            JSON.parse(JSON.stringify(filters))
        ).then((res => {
            var file_name = 'forus-platform.csv';
            var file_type = 'text/csv;charset=utf-8;';
            var file_data = res.data;

            var blob = new Blob([file_data], {
                type: file_type,
            });

            FileSaver.saveAs(blob, file_name);
            $scope.init();
        }));
    };

    $scope.typesByKey = {};
    $scope.recordTypes.forEach(element => {
        $scope.typesByKey[element.key] = element.name;
    });

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            recordTypes: '=',
            fund: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'PrevalidationService',
            PrevalidatedTableDirective
        ],
        templateUrl: 'assets/tpl/directives/prevalidated-table.html' 
    };
};
