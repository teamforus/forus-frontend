let PrevalidatedTableDirective = async function(
    $scope,
    $timeout,
    FileService,
    PrevalidationService
) {
    $scope.filters = {
        show: false,
        values: {},
    };

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

    $scope.resetFilters = () => {
        $scope.filters.values.q = '';
        $scope.filters.values.fund_id = $scope.fund ? $scope.fund.id : null;
        $scope.filters.values.state = $scope.states[0].key;
        $scope.filters.values.exported = $scope.statesExported[0].key;
        $scope.filters.values.from = null;
        $scope.filters.values.to = null;
    };

    $scope.hideFilters = () => {
        $timeout(() => {
            $scope.filters.show = false;
        }, 0);
    };

    $scope.$on('csv:uploaded', function() {
        $scope.filters.values.page = 1;
        $scope.onPageChange($scope.filters);
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
        $scope.resetFilters();

        PrevalidationService.list($scope.filters.values).then((res => {
            $scope.prevalidations = res.data;
        }));
    };

    // Export to XLS file
    $scope.export = (filters = {}) => {
        PrevalidationService.export(filters).then((res => {
            FileService.downloadFile(
                ($scope.fund.key || 'fund') + '_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.xls',
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
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
            '$timeout',
            'FileService',
            'PrevalidationService',
            PrevalidatedTableDirective
        ],
        templateUrl: 'assets/tpl/directives/prevalidated-table.html'
    };
};