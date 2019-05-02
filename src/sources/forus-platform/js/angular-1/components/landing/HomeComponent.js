let HomeComponent = function(
    $state, 
    $rootScope, 
    $timeout, 
    CredentialsService, 
    IdentityService,
    appConfigs,
    ModalService
) {
    let $ctrl = this;
    let qrCodeEl = document.getElementById('qrcode');

    let $redirectAuthorizedState = 'organizations';

    if (appConfigs.panel_type == 'validator') {
        $redirectAuthorizedState = 'csv-validation';
    }
z
    $ctrl.showModal = false;
    
         $scope.openAuthPopup = function () {
            ModalService.open('modalAuth', {});
        };
    
    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                CredentialsService.set(access_token);
                $rootScope.loadAuthUser();
                $state.go($redirectAuthorizedState);
            } else if (res.data.message == 'pending') {
                $timeout(function() {
                    $ctrl.checkAccessTokenStatus(type, access_token);
                }, 2500);
            } else {
                document.location.reload();
            }
        });
    };

    $ctrl.requestAuthToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;

            new QRCode(qrCodeEl, {
                text: JSON.stringify({
                    type: 'auth_token',
                    value: $ctrl.authToken
                }),
                correctLevel: QRCode.CorrectLevel.L,
            });

            qrCodeEl.removeAttribute('title');

            $ctrl.showModal = true;

            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };
    console.log('test');
    $ctrl.closeModal = function() {
        $ctrl.showModal = false;
        qrCodeEl.innerHTML = '';
    };
};

module.exports = {
    controller: [
        '$state', 
        '$rootScope', 
        '$timeout', 
        'CredentialsService', 
        'IdentityService',
        'appConfigs', 
        'ModalService',
        HomeComponent
    ],
    templateUrl: 'index.html'
};