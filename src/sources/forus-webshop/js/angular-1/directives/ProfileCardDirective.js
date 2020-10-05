let ProfileCardDirective = function(
    $scope,
    $timeout,
    $element,
    $rootScope,
    appConfigs
) {
    $scope.appConfigs = appConfigs;

    $scope.copyAddress = function() {
        // todo: rewrite 
        let input = $('<input type="text" value="' + $rootScope.auth_user.address + '">');
        $('body').append(input);
        input.select();
        document.execCommand("copy");
        input.remove();
    };


    $timeout(() => {
        let qrCodeEl = $element.find('#profile_qr');
        
        if (qrCodeEl.length == 0) {
            return;
        }

        qrCodeEl = qrCodeEl[0];
    
        new QRCode(qrCodeEl, {
            text: JSON.stringify({
                type: 'identity',
                value: $rootScope.auth_user.address
            }),
            correctLevel: QRCode.CorrectLevel.L
        });
    
        qrCodeEl.removeAttribute('title');
    }, 500);
};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            '$element',
            '$rootScope',
            'appConfigs',
            ProfileCardDirective
        ],
        templateUrl: 'assets/tpl/directives/profile-card.html' 
    };
};