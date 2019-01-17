module.exports = [
    '$transitions',
    '$filter',
    '$rootScope',
    'appConfigs',
    function(
        $transitions,
        $filter,
        $rootScope,
        appConfigs
    ) {
        $transitions.onSuccess({}, function(transition) {
            let pageTitleKey = 'page_state_titles.' + transition.to().name;
            let implementationName = $filter('i18n')('implementation_name.' + appConfigs.client_key);
            let pageTitleText = $filter('i18n')(pageTitleKey, {implementation: implementationName});

            if (pageTitleKey == pageTitleText) {
                pageTitleText = $filter('translate')('page_title');
            }

            $rootScope.pageTitle = pageTitleText;

            document.body.scrollTop = document.documentElement.scrollTop = 0;
        })
    }
];