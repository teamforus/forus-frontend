module.exports = [
    '$parse',
    '$translate',
    'appConfigs',
    function translateFilterFactory(
        $parse,
        $translate,
        appConfigs
    ) {
        var translateFilter = function(
            translationId,
            interpolateParams,
            interpolation,
            forceLanguage
        ) {
            let key = '[client_key]';

            while (translationId.indexOf(key) != -1) {
                translationId = translationId.replace(key, appConfigs.client_key);
            }

            if (!angular.isObject(interpolateParams)) {
                var ctx = this || {
                    '__SCOPE_IS_NOT_AVAILABLE': 'More info at https://github.com/angular/angular.js/commit/8863b9d04c722b278fa93c5d66ad1e578ad6eb1f'
                };

                interpolateParams = $parse(interpolateParams)(ctx);
            }

            return $translate.instant(translationId, interpolateParams, interpolation, forceLanguage);
        };

        if ($translate.statefulFilter()) {
            translateFilter.$stateful = true;
        }

        return translateFilter;
    }
];