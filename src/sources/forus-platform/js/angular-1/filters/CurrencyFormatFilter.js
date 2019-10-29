module.exports = function() {
    return function(value, currency = '€ ') {
        let string = (parseFloat(value)).toFixed(2).replace(
            /\d(?=(\d{3})+\.)/g, '$&.'
        ).replace(/.([^.]*)$/, ',$1');
        
        if (currency.length > 2) {
            currency = {
                'eth': 'eth ',
                'eur': '€ ',
            }[currency];
        }

        return currency + (value % 1 == 0 ? string.slice(0, -2) + '-' : string);
    }
};