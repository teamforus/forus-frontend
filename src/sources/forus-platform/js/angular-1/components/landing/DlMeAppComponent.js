let DlMeAppComponent = function(appConfigs) {
    let $ctrl = this;
    let iosPlatforms = [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ];

    $ctrl.$onInit = () => {
        $ctrl.iosLink = appConfigs.ios_link;
        $ctrl.androidLink = appConfigs.android_link;

        $ctrl.isiOS = navigator.platform && iosPlatforms.indexOf(navigator.platform) !== -1;
        $ctrl.isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

        if ($ctrl.isiOS) {
            document.location.href = $ctrl.iosLink;
        } else if ($ctrl.isAndroid) {
            document.location.href = $ctrl.androidLink;
        }
    };
};

module.exports = {
    controller: [
        'appConfigs',
        '$timeout',
        DlMeAppComponent
    ],
    templateUrl: 'assets/tpl/pages/landing/dl-me-app.html'
};
