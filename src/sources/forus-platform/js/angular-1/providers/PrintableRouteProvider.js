module.exports = function() {
    return new(function() {
        var printables = {};

        this.printable = function(printable, config) {
            printables[printable] = config;
        };

        this.$get = [() => {
            return {
                printables: () => printables
            }
        }];
    });
};