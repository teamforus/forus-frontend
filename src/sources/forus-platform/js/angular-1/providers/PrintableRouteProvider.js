let PrintableRouteProvider = function() {
    var printables = {};

    this.printable = function(printable, config) {
        printables[printable] = config;
    };

    this.$get = [function() {
        return {
            printables: () => printables
        }
    }];
};

module.exports = new PrintableRouteProvider();