const PaginatorDirective = function (
    $scope,
    $state,
    $attrs,
    $timeout,
    $stateParams
) {
    let countButtons = $scope.countButtons || 5;
    let filterTimeout;
    let initialized;

    $scope.setPage = (page) => {
        const query = {};

        if (typeof ($scope.filters) == 'object' && $scope.filters) {
            Object.assign(query, $scope.filters, {
                page: page
            });
        }

        if ($attrs.onPageChange) {
            return $scope.onPageChange({query});
        }

        $state.go($state.$current.name, query);
    };

    $scope.getPages = () => {
        let fromPage = Math.max(1, $scope.meta.current_page - Math.round(countButtons / 2 - 1));
        let pages = []

        if (countButtons > $scope.meta.last_page - fromPage) {
            fromPage = Math.max(1, ($scope.meta.last_page - countButtons) + 1);
        }

        while (pages.length < countButtons && fromPage <= $scope.meta.last_page) {
            pages.push(fromPage++);
        }

        return pages;
    };

    $scope.getPageChangeTimeout = (current, old) => {
        const delayedFilters = Array.isArray($scope.delayedFilters) ? $scope.delayedFilters : ['q'];
        const hasUpdatedDelayedFilters = delayedFilters.filter((filter) => current[filter] !== old[filter]).length > 0;

        return hasUpdatedDelayedFilters ? 1000 : 0;
    }

    $scope.$watch('filters', (current, old) => {
        if (!initialized) {
            return initialized = true;
        }

        const timeout = $scope.getPageChangeTimeout(current ? current : {}, old ? old : {});
        const callback = () => $scope.setPage($scope.meta.current_page);

        $timeout.cancel(filterTimeout);
        filterTimeout = $timeout(() => callback(), timeout);
    }, true);

    $scope.$watch('meta', () => {
        $scope.pages = $scope.getPages();

        if ($scope.meta.current_page > $scope.meta.last_page) {
            $scope.setPage($scope.meta.last_page);
        }
    }, true);

    $scope.$on('$destroy', function () {
        $timeout.cancel(filterTimeout);
    });

    $scope.onInit = () => {
        const filtersFromState = typeof $scope.filtersFromState !== 'undefined' ? $scope.filtersFromState : false;

        $scope.filters = { ...$scope.filters, ...(filtersFromState ? $stateParams : {}) };
        $scope.pages = $scope.getPages();
    };

    $scope.onInit();
};

module.exports = () => {
    return {
        scope: {
            meta: '=',
            filters: '=',
            delayedFilters: '=',
            onPageChange: '&',
            filtersFromState: '=',
            countButtons: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            '$attrs',
            '$timeout',
            '$stateParams',
            PaginatorDirective,
        ],
        templateUrl: 'assets/tpl/directives/paginators/paginator.html',
    };
};