let PercentageFormatFilter = function() {
    return (value, sign = '%') => {
        const valueData = parseFloat(value);

        return isNaN(valueData) ? value : (
            (valueData % 1 == 0 ? valueData.toFixed(0) : valueData.toFixed(2)) + sign
        );
    };
};

module.exports = [PercentageFormatFilter];