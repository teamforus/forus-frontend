const ThSortable = function($scope) {
    const { $dir } = $scope;

    $dir.onClick = () => {
        const valueChanged = $dir.filters.order_by !== $dir.value;

        if ($dir.value) {
            $dir.filters.order_by = $dir.value;
            $dir.filters.order_dir = $dir.filters?.order_dir == 'asc' || valueChanged ? 'desc' : 'asc';;
        }
    };
};

module.exports = () => {
    return {
        scope: {
            value: '@',
            label: '@',
            filters: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "A",
        controller: [
            '$scope',
            ThSortable
        ],
        template: require('./th-sortable.pug'),
    };
};