let ProductCategoriesControlDirective = function(
    $q,
    $scope,
    ProductCategoryService
) {
    let $ctrl = {};

    $scope.$ctrl = $ctrl;

    $ctrl.categoriesValues = [];
    $ctrl.categoriesHierarchy = [];

    $ctrl.loadCategories = (index, parent_id = 'null', loadOnly = false) => {
        return $q((resolve, reject) => {
            if (!loadOnly) {
                $ctrl.categoriesHierarchy.splice(index);
                $ctrl.categoriesValues.splice(index);
            }

            if (index > 0 && parent_id == 'null') {
                return resolve([]);
            }

            return ProductCategoryService.list({
                parent_id: parent_id,
            }).then(res => {
                let categories = res.data.data;

                categories.unshift({
                    id: "null",
                    name: "Selecteer categorie..."
                });

                if (categories.length > 1) {
                    $ctrl.categoriesHierarchy[index] = categories;

                    if (!loadOnly) {
                        $ctrl.categoriesValues[index] = categories[0].id;
                    }
                }

                resolve(categories);
            }, reject);
        });
    };

    $ctrl.changeCategory = (index) => {
        return $q((resolve, reject) => {
            $ctrl.loadCategories(index + 1, $ctrl.categoriesValues[index]).then(categories => {
                $scope.ngModel = $ctrl.getSelectedCategory();
                resolve();
            }, reject);
        });
    };

    $ctrl.getSelectedCategory = () => {
        let categories = $ctrl.categoriesValues.filter(
            category => category != 'null'
        );

        return categories[categories.length - 1];
    };

    $ctrl.loadProductCategoriesParent = (ids, category_id) => {
        return $q((resolve, reject) => {
            if (category_id == null || category_id == 'null') {
                return resolve(ids);
            }

            ids.push(category_id);

            ProductCategoryService.show(category_id).then(res => {
                $ctrl.loadProductCategoriesParent(ids, res.data.data.parent_id).then(resolve, reject);
            });
        });
    };

    $ctrl.loadProductCategories = () => {
        $ctrl.loadProductCategoriesParent([], $scope.ngModel).then(values => {
            values.unshift("null");
            
            $ctrl.categoriesValues = values.reverse();
            $ctrl.loadCategories(0, 'null', true);

            values.forEach((value, index) => {
                $ctrl.loadCategories(index + 1, value, true);
            });
        });
    };

    $ctrl.onInit = () => {
        $ctrl.initialValue = $scope.ngModel;

        if ($scope.ngModel) {
            $ctrl.loadProductCategories();
        } else {
            $ctrl.changeCategory(-1);
        }
    };

    $ctrl.onInit();
};

module.exports = () => {
    return {
        scope: {
            ngModel: '=',
            disabled: "=",
            errors: "="
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            'ProductCategoryService',
            ProductCategoriesControlDirective
        ],
        templateUrl: 'assets/tpl/directives/product-categories-control.html'
    };
};