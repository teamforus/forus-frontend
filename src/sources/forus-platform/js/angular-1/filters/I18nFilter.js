module.exports = ['$filter', 'I18nLib', (
    $filter, I18nLib
) => function(key, values = {}) {
    return $filter('translate')(key, I18nLib.values(values));
}];