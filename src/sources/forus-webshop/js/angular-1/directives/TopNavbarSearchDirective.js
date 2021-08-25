const escape = require('lodash/escape');

const TopNavbarSearchDirective = function(
    $sce,
    $scope,
    $state,
    $timeout,
    $rootScope,
    SearchService
) {
    const $dir = $scope.$dir = {};

    $dir.timeout;
    $dir.resultsList = [];
    $dir.selectedItem = 0;
    $dir.resultsExists = false;
    $dir.dropdown = false;
    $dir.results = null;
    $dir.query = $state.params.q || '';
    $dir.lastQuery = $state.params.q || '';
    $dir.isSearchResultPage = $state.current.name === 'search-result';

    $dir.clearSearch = () => {
        $dir.query = null;
        $dir.resultsList = [];
        $dir.selectedItem = 0;
        $dir.results = null;
        $dir.resultsExists = false;
        $dir.dropdown = false;
    };

    $dir.hideDropDown = () => $dir.dropdown = false;
    $dir.showDropDown = () => $dir.dropdown = true;

    $dir.cancelSearch = (e) => {
        if (e.keyCode === 27) {
            $dir.clearSearch();
        }
    };

    $dir.navigateItems = (e) => {
        switch (e.keyCode) {
            case 27: $dir.clearSearch(); break;
            case 40:
                $dir.selectedItem < $dir.resultsExists ?
                    $dir.selectedItem++ :
                    $dir.selectedItem = 1;
                break;
            case 38:
                $dir.selectedItem > 1 ?
                    $dir.selectedItem-- :
                    $dir.selectedItem = $dir.resultsExists;
                break;
            case 13: {
                if ($dir.resultsList[$dir.selectedItem - 1]) {
                    const item = $dir.resultsList[$dir.selectedItem - 1];

                    if (item) {
                        $state.go(item.uiSref, item.uiSrefParams);
                    }
                } else {
                    $state.go('search-result', { q: $dir.query });
                }

            }; break;

            default: return;
        }

        e.preventDefault();
        e.stopPropagation();
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
    }

    $dir.transformSearchResult = (result) => {
        let count = 0;

        for (const key in result) {
            result[key].items.forEach((item) => {
                item.name = $sce.trustAsHtml($dir.transformName(item.name, $dir.query));
                item.navigation_key = ++count;
                item.uiSref = item.item_type;
                item.uiSrefParams = { id: item.id };

                $dir.resultsList.push(item);
            });
        }

        $dir.resultsExists = count;

        return result;
    }

    $dir.setResults = (results) => {
        $dir.results = $dir.transformSearchResult(results);
        $dir.showDropDown();
    };

    $dir.doSearch = () => {
        $timeout.cancel($dir.timeout);

        $dir.timeout = $timeout(function() {
            $dir.lastQuery = $dir.query;

            if ($dir.isSearchResultPage) {
                return $rootScope.$broadcast('search-query', $dir.query);
            }

            if ($dir.query.length == 0) {
                return $dir.clearSearch();
            }

            SearchService.search({ q: $dir.query, overview: 1 }).then((res) => {
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
            'SearchService',
            TopNavbarSearchDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar-search.html'
    };
};