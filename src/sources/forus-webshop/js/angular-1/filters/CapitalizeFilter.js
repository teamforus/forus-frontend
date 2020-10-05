let CapitalizeFilter = function () {
    return function(token) {
        return token.charAt(0).toUpperCase() + token.slice(1);
    }
};

module.exports = [CapitalizeFilter];