const ArrService = function() {
    return new (function() {
        this.unique = (arr) => {
            return arr.reduce((arr, item) => arr.includes(item) ? arr : [...arr, item], []);
        };

        this.chunk = (arr, len) => {
            const data = [...arr];
            const chunks = [];

            do {
                chunks.push(data.splice(0, len));
            } while (data.length);

            return chunks;
        }
    });
};

module.exports = ArrService;