let PrevalidatedTableDirective = async function(
    $scope,
    $timeout,
    FileService,
    PrevalidationService
) {
    $scope.headers = [];

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
        if ($scope.filters.values.page === 1) {
            $scope.onPageChange($scope.filters.values);
        } else {
            $scope.filters.values.page = 1;
        }

    })

    $scope.onPageChange = async (query) => {
        PrevalidationService.list(query).then((res => {
            $scope.prevalidations = res.data;
            $scope.buildTable($scope.prevalidations.data);
        }));
    };

    $scope.onReset = async (query) => {
        PrevalidationService.list(query).then((res => {
            $scope.prevalidations = res.data;
            $scope.buildTable($scope.prevalidations.data);
        }));
    };

    $scope.onLoadMore = async (query) => {
        PrevalidationService.list(query).then((res => {
            $scope.prevalidations.data = $scope.prevalidations.data.concat(res.data.data);
            $scope.prevalidations.meta = res.data.meta;
            $scope.buildTable($scope.prevalidations.data);
        }));
    };

    $scope.init = async () => {
        $scope.resetFilters();

        PrevalidationService.list($scope.filters.values).then((res => {
            $scope.prevalidations = res.data;
            $scope.buildTable($scope.prevalidations.data);
        }));
    };

    $scope.buildTable = (prevalidations) => {
        $scope.headers = $scope.makeHeaders(prevalidations);
        $scope.rows = $scope.makeRows(prevalidations, $scope.headers);
    };

    $scope.makeHeaders = (prevalidations) => {
        let headers = prevalidations.reduce((headers, prevalidation) => {
            return prevalidation.records.filter(
                record => headers.indexOf(record.key) === -1
            ).map(record => record.key).concat(headers);
        }, []).sort();

        let primaryKey = headers.indexOf($scope.fund.csv_primary_key);

        if (primaryKey !== -1) {
            headers.splice(primaryKey, 1);
            headers.unshift($scope.fund.csv_primary_key);
        }

        return headers;
    };

    $scope.makeRows = (prevalidations, headers) => {
        return prevalidations.map(prevalidation => $scope.makeRow(prevalidation, headers));
    };

    $scope.makeRow = (prevalidation, headers) => {
        return Object.assign(prevalidation, {
            records: headers.map(header => prevalidation.records.filter(
                record => record.key == header
            )[0] || false)
        });
    };

    $scope.$watch('fund', (fund) => {
        $scope.init();
    }, true);

    // Export to XLS file
    $scope.export = (filters = {}) => {
        PrevalidationService.export(Object.assign(filters, {
            fund_id: $scope.fund.id
        })).then((res => {
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