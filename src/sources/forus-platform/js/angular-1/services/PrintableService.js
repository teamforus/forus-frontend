const PrintableService = function (PrintableRoute, $timeout) {
    let printables = {
        list: []
    };
    let printableKeys = Object.keys(PrintableRoute.printables());

    this.printableKeyExists = (key) => {
        return printableKeys.indexOf(key) !== -1;
    };

    this.open = (key, scope, events) => {
        if (!this.printableKeyExists(key)) {
            throw new Error(`Unknown printable key "${key}".`);
        }

        $timeout(() => {
            printables.list.push({
                key: key,
                scope: scope,
                events: typeof (events) == 'object' ? events : {},
            });
        }, 0);
    };

    this.close = (printable) => {
        if (printables.list.indexOf(printable) !== -1) {
            printables.list.splice(printables.list.indexOf(printable), 1);
        }
    };

    this.getPrintables = () => {
        return printables.list;
    };
};

module.exports = ['PrintableRoute', '$timeout', function (PrintableRoute, $timeout) {
    return new PrintableService(PrintableRoute, $timeout);
}];