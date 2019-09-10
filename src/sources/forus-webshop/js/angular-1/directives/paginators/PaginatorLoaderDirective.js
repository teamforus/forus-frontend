let PaginatorDirective = function(
    $scope,
    $attrs,
    $timeout
) {
    let filterTimeout;
    let initialized;

    let onInit = () => {
        if (!Array.isArray($scope.filtersTimeoutAttr)) {
            $scope.filtersTimeoutAttr = [];
        }
    };

    $scope.loadMore = () => {
        let query = {};

        if ($scope.meta.current_page >= $scope.meta.last_page) {
            return;
        }

        if (typeof($scope.filters) == 'object' && $scope.filters) {
            Object.assign(query, $scope.filters, {
                page: $scope.meta.current_page + 1
            });
        }

        if ($attrs.onLoadMore) {
            $scope.onLoadMore({
                query: query
            });
        }
    };

    $scope.reset = () => {
        let query = {};

        if (typeof($scope.filters) == 'object' && $scope.filters) {
            Object.assign(query, $scope.filters, {
                page: null
            });
        }

        
        if ($attrs.onReset) {
            $scope.onReset({
                query: query
            });
        }
    };

    $scope.$watch('filters', (filters, filtersBefore) => {
        if (!initialized) {
            return initialized = true;
        }

        $timeout.cancel(filterTimeout);
        
        let fetchAhead = $scope.filtersTimeoutAttr.filter((attr) => {
            return $scope.filters[attr] != $scope.filtersTimeoutAttr[attr];
        }).length > 0;

        filterTimeout = $timeout(() => {
            $scope.reset();
        }, fetchAhead ? 0 : 1500);
    }, true);

    $scope.$watch('meta', (cur) => {
        if ($scope.meta.current_page > $scope.meta.last_page) {
            $scope.reset();
        }
    }, true);

    $scope.$on('$destroy', function() {
        $timeout.cancel(filterTimeout);
    });

    onInit();
};

module.exports = () => {
    return {
        scope: {
            meta: '=',
            filters: '=',
            filtersTimeoutAttr: '=',
            onReset: '&',
            onLoadMore: '&'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$attrs',
            '$timeout',
            '$stateParams',
            PaginatorDirective
        ],
        templateUrl: 'assets/tpl/directives/paginators/paginator-loader.html'
    };
};