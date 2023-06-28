const I18nFilter = function($filter, I18nLib) {
    return (key, values = {}, fallback = null) => {
        const translation = $filter('translate')(key, I18nLib.values(values));
        
        if (translation == key) {
            return fallback || translation;
        }

        return translation
    };
}

module.exports = ['$filter', 'I18nLib', I18nFilter];