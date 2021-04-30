const TopNavbarSearchDirective = function(
    $scope,
    $state,
    $rootScope,
    SearchService
) {
    $scope.timeout;
    $scope.resultsList = [];
    $scope.selectedItem = 0;
    $scope.resultsExists = false;
    $scope.dropdown = false;
    $scope.results = null;
    $scope.query = $state.params.keyword || '';
    $scope.searchResultPage = ($state.current.name === 'search-result');

    $scope.clearSearch = () => {
        $scope.query = null;
        $scope.resultsList = [];
        $scope.selectedItem = 0;
        $scope.results = null;
        $scope.resultsExists = false;
        $scope.dropdown = false;
    };

    $scope.hideDropDown = () => {
        $scope.dropdown = false;
    }

    $scope.showDropDown = () => {
        $scope.dropdown = true;
    }

    $scope.cancelSearch = (e) => {
        if (e.keyCode === 27) {
            $scope.clearSearch();
        }
    };

    $scope.goToItem = (item) => {
        switch (item.type) {
            case 'products':
                $state.go('products-show', {id: item.id});
                break;
        
            case 'funds':
                $state.go('fund', {id: item.id});
                break;

            case 'providers':
                $state.go('provider', {provider_id: item.id});
                break;
        }        
    };

    $scope.navigateItems = (e) => {
        switch (e.keyCode) {
            case 27: 
                $scope.clearSearch()
                break;
            case 40: 
                $scope.selectedItem < $scope.resultsExists ?
                    $scope.selectedItem++ :
                    $scope.selectedItem = 1;
                break;
            case 38: 
                $scope.selectedItem > 1 ?
                    $scope.selectedItem-- :
                    $scope.selectedItem = $scope.resultsExists;
                break;
            case 13: 
                $scope.goToItem($scope.resultsList[$scope.selectedItem-1])
                break;
        
            default:
                break;
        }
    };

    $scope.transformSearchResult = (result) => {
        let count = 0;

        let transformName = (name, keyword) => {
            let index = name.toLowerCase().indexOf(keyword.toLowerCase());
            let nameTransformArr = [];

            if (index != -1) {
                nameTransformArr = [
                    name.slice(0, index),
                    name.slice(index, index + keyword.length),
                    name.slice(index + keyword.length)
                ]
            } else {
                nameTransformArr.push(name);
            }

            return nameTransformArr;
        }
        
        for (const key in result) {
            result[key].forEach((item) => {
                item.nameTransformed = transformName(item.name, $scope.query);
                item.navigation_key = ++count;
                item.type = key;
                $scope.resultsList.push(item);
            });
        }

        $scope.resultsExists = count;
        console.log(result);
        return result;
    }

    $scope.doSearch = () => {
        clearTimeout($scope.timeout);

        $scope.timeout = setTimeout(function() {
            $rootScope.$broadcast('search-query', $scope.query);
            
            if ($scope.query.length && $state.current.name !== 'search-result') {
                SearchService.list({keyword: $scope.query}).then((res) => {
                    $scope.results = $scope.transformSearchResult(res.data.data);
                    $scope.showDropDown();
                }); 
            } 
            
            if ($scope.query.length == 0) {
                $scope.clearSearch();
            }          
            
        }, 500);
        
    };
};

module.exports = () => {
    return {
        scope: {
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            '$rootScope',
            'SearchService',
            TopNavbarSearchDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar-search.html' 
    };
};