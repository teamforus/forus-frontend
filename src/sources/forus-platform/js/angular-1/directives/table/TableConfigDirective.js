const TableConfigDirective = function () { };

module.exports = () => {
    return {
        scope: {
            'tooltips': '<',
            'onSettingsToggle': '&',
            'activeTooltipKey': '=',
            'selectedCategory': '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            TableConfigDirective
        ],
        template: require('./table-config.pug'),
    };
};