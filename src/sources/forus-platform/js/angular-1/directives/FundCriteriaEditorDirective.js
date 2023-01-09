let FundCriteriaEditorDirective = function(
    $q,
    $scope,
    $timeout,
    $element
) {
    let $dir = $scope.$dir = {};

    $dir.items = [];
    $dir.is_editing = false;
    $dir.deletedItemsCount = 0;

    $dir.updateOnEditFlag = () => {
        $dir.is_editing = $scope.criteria.filter(
            criterion => criterion.is_editing
        ).length > 0;
    };

    $dir.addCriteria = () => {
        $scope.criteria.push({
            is_new: true,
            is_editing: true,
            show_attachment: false,
            external_validators: [],
            record_type_key: 0,
            operator: "=",
            value: "",
        });

        $dir.updateOnEditFlag();
    };

    $dir.onDelete = (criterion) => {
        let index = $scope.criteria.indexOf(criterion);

        if (index != -1) {
            $dir.deletedItemsCount++;
            $scope.criteria.splice(index, 1);
        }

        $dir.updateOnEditFlag();
    };

    $dir.registerItem = function(childRef) {
        $dir.items.push(childRef);
    }
    
    $dir.unregisterItem = function(childRef) {
        if ($dir.items.includes(childRef)) {
            $dir.items.splice($dir.items.indexOf(childRef));
        }
    }

    $dir.saveCriteria = () => {
        return $q(resolve => {
            $q.all($dir.items.map(item => item.saveCriterion(item.criterion))).then((result) => {
                $dir.updateOnEditFlag();

                if (result.filter(result => !result).length === 0) {
                    resolve(true);
                    $scope.onSaveCriteria({ fund: $dir.fund });
                } else {
                    resolve(false);
                    $timeout(() => {
                        const errors = $element.find('.form-error');

                        if (errors.length) {
                            window.scrollTo(0, Math.max(0, errors.offset().top - 100));
                        }
                    }, 250);
                }
            });
        });
    };

    $dir.init = function() {
        $dir.fund = $scope.fund;
        $dir.criteria = $scope.criteria;
        $dir.isEditable = !!$scope.isEditable;
        $dir.saveButton = !!$scope.saveButton;

        $dir.organization = $scope.organization;
        $dir.validatorOrganizations = $scope.validatorOrganizations;

        $dir.recordTypes = $scope.recordTypes.filter(
            recordType => recordType.key != 'primary_email'
        );

        $dir.recordTypes.unshift({
            key: 0,
            name: "Select"
        });

        $timeout(() => {
            $scope.registerParent({ childRef: $dir });
        }, 250);
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            criteria: '=',
            saveButton: '=',
            isEditable: '=',
            recordTypes: '=',
            organization: '=',
            onSaveCriteria: '&',
            registerParent: '&',
            validatorOrganizations: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$timeout',
            '$element',
            FundCriteriaEditorDirective,
        ],
        templateUrl: 'assets/tpl/directives/fund-criteria-editor.html',
    };
};