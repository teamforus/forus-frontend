module.exports = ['$translateProvider', 'I18nLibProvider', function($translateProvider, I18nLibProvider) {
    $translateProvider.translations('nl', require('../i18n/i18n-nl'));
    $translateProvider.translations('en', require('../i18n/i18n-en'));

    $translateProvider.registerAvailableLanguageKeys(['nl', 'en']);

    $translateProvider.preferredLanguage('nl');
    $translateProvider.useSanitizeValueStrategy('escapeParameters');
    $translateProvider.useLocalStorage();

    I18nLibProvider.setValues({
        nl: require('../i18n/i18n-nl-values'),
        en: require('../i18n/i18n-en-values')
    });
}];
