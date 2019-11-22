let StrLimitFilter = function(str = "", length = 200, char = "...") {
    if (typeof str != 'string') {
        return str;
    }

    return str.length <= length ? str : (
        str.substr(0, length - char.length) + char
    );
};

module.exports = [() => StrLimitFilter];