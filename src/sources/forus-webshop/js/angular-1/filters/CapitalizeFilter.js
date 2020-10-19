let CapitalizeFilter = function () {
    return function(token) {
        return typeof token === 'string' ? token.charAt(0).toUpperCase() + token.slice(1) : token;
    }
};

module.exports = [CapitalizeFilter];