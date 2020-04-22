module.exports = ['$translateProvider', 'I18nLibProvider', (
    $translateProvider, I18nLibProvider
) => {
    $translateProvider.translations('nl', require('../i18n/i18n-nl'));
    $translateProvider.translations('en', require('../i18n/i18n-en'));

    $translateProvider.registerAvailableLanguageKeys(['en', 'nl']);

    $translateProvider.preferredLanguage('nl');
    $translateProvider.useSanitizeValueStrategy('escapeParameters');
    $translateProvider.useLocalStorage();

    I18nLibProvider.setValues({
        nl: require('../i18n/i18n-nl-values'),
        en: require('../i18n/i18n-en-values')
    });
}];