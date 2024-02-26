const TableConfigDirective = function () { };

module.exports = () => {
    return {
        scope: {
            'onClose': '&',
            'tooltips': '<',
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