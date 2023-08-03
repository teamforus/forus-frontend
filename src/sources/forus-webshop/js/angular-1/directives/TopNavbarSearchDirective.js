const escape = require('lodash/escape');

const TopNavbarSearchDirective = function (
    $sce,
    $scope,
    $state,
    $timeout,
    $rootScope,
    appConfigs,
    SearchService
) {
    const $dir = $scope.$dir = {};

    $dir.timeout;
    $dir.dropdown = false;
    $dir.results = null;
    $dir.resultsAll = null;
    $dir.query = $state.params.q || '';
    $dir.lastQuery = $state.params.q || '';
    $dir.isSearchResultPage = $state.current.name === 'search-result';
    $dir.groupKey = 'all';
    $dir.groupKeyList = ['all', 'products', 'funds', 'providers'];

    $dir.clearSearch = () => {
        $dir.query = null;
        $dir.results = null;
        $dir.resultsAll = null;
        $dir.dropdown = false;
        $dir.groupKey = 'all';
        $dir.hideDropDown();
    };

    $dir.appConfigs = appConfigs;

    $dir.hideDropDown = () => $dir.dropdown = false;
    $dir.showDropDown = () => $dir.dropdown = true;

    $dir.cancelSearch = (e) => {
        if (e.keyCode === 27) {
            $dir.clearSearch();
        }
    };

    $dir.sanitize = (value) => {
        const el = document.createElement('div');
        el.innerHTML = value;
        return escape(el.innerText);
    };

    $dir.transformName = (value, q) => {
        const name = $dir.sanitize(value);
        const index = name.toLowerCase().indexOf(q.toLowerCase());

        return index !== -1 ? [
            name.slice(0, index),
            `<strong>${name.slice(index, index + q.length)}</strong>`,
            name.slice(index + q.length)
        ].join("") : name;
    };

    $dir.toggleGroup = ($event, groupKey) => {
        $event.preventDefault();
        $event.stopPropagation();

        $dir.results[groupKey].shown = !$dir.results[groupKey].shown;
    };

    $dir.setGroupKey = (groupKey) => {
        $dir.groupKey = groupKey;
    };

    $dir.setResults = (results) => {
        const listKeys = Object.keys(results);
        const listItems = listKeys.reduce((arr, key) => [...arr, ...results[key].items], []);

        listItems.forEach((item) => Object.assign(item, {
            name: $sce.trustAsHtml($dir.transformName(item.name, $dir.query)),
            uiSref: item.item_type,
            uiSrefParams: { id: item.id },
        }));

        $dir.results = results;
        $dir.resultsAll = listItems;
        $dir.showDropDown();
    };

    $dir.doSearch = () => {
        $timeout.cancel($dir.timeout);

        $dir.timeout = $timeout(() => {
            $dir.lastQuery = $dir.query;

            if ($dir.isSearchResultPage) {
                return $rootScope.$broadcast('search-query', $dir.query);
            }

            if (!$dir.query || $dir.query.length == 0) {
                return $dir.clearSearch();
            }

            SearchService.search({ q: $dir.query, overview: 1, with_external: 1, take: 9 }).then((res) => {
                $dir.setResults(res.data.data);
            });
        }, 500);
    };
};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            '$sce',
            '$scope',
            '$state',
            '$timeout',
            '$rootScope',
            'appConfigs',
            'SearchService',
            TopNavbarSearchDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar-search.html'
    };
};