let PrettyJsonFilter = function() {
    return (_in) => JSON.stringify(_in, null, '    ');
};

module.exports = [PrettyJsonFilter];