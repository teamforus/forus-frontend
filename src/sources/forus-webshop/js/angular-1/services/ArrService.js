const ArrService = function() {
    return new (function() {
        this.unique = (arr) => {
            return arr.reduce((arr, item) => arr.includes(item) ? arr : [...arr, item], []);
        };
    });
};

module.exports = ArrService;