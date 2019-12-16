let I18nFilter = function($filter, I18nLib) {
    return (key, values = {}) => $filter('translate')(key, I18nLib.values(
        values
    ));
}

module.exports = ['$filter', 'I18nLib', I18nFilter];