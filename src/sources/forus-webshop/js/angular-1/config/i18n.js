module.exports = ['$translateProvider', 'I18nLibProvider', function($translateProvider, I18nLibProvider) {
    $translateProvider.translations('en', require('../i18n/i18n-en'));
    $translateProvider.translations('nl', require('../i18n/i18n-nl'));

    $translateProvider.registerAvailableLanguageKeys(['en', 'nl']);

    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escapeParameters');
    $translateProvider.useLocalStorage();

    I18nLibProvider.setValues({
        en: require('../i18n/i18n-en-values'),
        nl: require('../i18n/i18n-nl-values')
    });
}];