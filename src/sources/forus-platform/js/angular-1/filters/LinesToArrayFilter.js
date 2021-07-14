const LinesToArrayFilter = function() {
    return (str, char="\n", filter = false) => {

        const arr = str.split(char);

        if (!filter) {
            return arr;
        }

        return arr.filter(row => row.length > 0)
    };
};

module.exports = [LinesToArrayFilter];