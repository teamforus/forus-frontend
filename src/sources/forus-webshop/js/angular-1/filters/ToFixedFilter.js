let ToFixedFilter = function() {
    return (_in, size) => parseFloat(_in).toFixed(size);
};

module.exports = [ToFixedFilter];