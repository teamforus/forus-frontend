let DlMeAppComponent = function(
    $state,
    $rootScope,
    $timeout
) {
    let $ctrl = this;
    $ctrl.iosLink = "https://testflight.apple.com/join/gWw1lXyB";
    $ctrl.androidLink = "https://media.forus.io/static/me-0.0.5-staging-7-release.apk";

    let iDevices = [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ];

    this.isiOS = () => {
        if (!!navigator.platform) {
            while (iDevices.length) {
                if (navigator.platform === iDevices.pop()) { 
                    return true; 
                }
            }
        }
    
        return false;
    }
    
    this.isAndroid = () => {
        return navigator.userAgent.toLowerCase().indexOf("android") > -1;
    }

    $ctrl.$onInit = () => {
        if (this.isiOS()){
            $timeout(function() {
                document.location.href = $ctrl.iosLink; 
            }, 0);
        } else if (this.isAndroid()) {
            $timeout(function() {
                document.location.href = $ctrl.androidLink; 
            }, 0);
        }
    };
};

module.exports = {
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        DlMeAppComponent
    ],
    templateUrl: 'assets/tpl/pages/landing/dl-me-app.html'
};
