let CurrencyFormatFilter = function () {
    return function(value, currency = '€ ') {
        let string = (parseFloat(value)).toFixed(2).replace(
            /\d(?=(\d{3})+\.)/g, '$&.'
        ).replace(/.([^.]*)$/, ',$1');
    
        return currency + (value % 1 == 0 ? string.slice(0, -2) + '-' : string);
    };
};

module.exports = [CurrencyFormatFilter];