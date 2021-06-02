module.exports = ['$transitions', '$filter', '$rootScope', 'appConfigs', 'PageLoadingBarService', (
    $transitions, $filter, $rootScope, appConfigs, PageLoadingBarService
) => {
    const $i18n = $filter('i18n');
    const $translate = $filter('translate');
    const defaultPageTitle = $translate('page_title');

    $transitions.onStart({}, function() {
        PageLoadingBarService.setProgress(0);
    });

    $transitions.onError({}, function() {
        PageLoadingBarService.setProgress(100);
    });

    $transitions.onSuccess({}, function(transition) {
        PageLoadingBarService.setProgress(100);

        const options = transition._options;
        const optionsCustom = options.custom || {};
        const toStateName = transition.to().name;
        const pageTitleKey = 'page_state_titles.' + toStateName;
        const implementation = $i18n('implementation_name.' + appConfigs.client_key);
        const pageTitleText = $i18n(pageTitleKey, { implementation });

        $rootScope.pageTitle = pageTitleKey == pageTitleText ? defaultPageTitle : pageTitleText;

        if (optionsCustom.moveTop !== false) {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        }
    })
}];