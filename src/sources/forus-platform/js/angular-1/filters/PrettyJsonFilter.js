let PrettyJsonFilter = function(_in) {
    return JSON.stringify(_in, null, '    ');
};

module.exports = [PrettyJsonFilter];