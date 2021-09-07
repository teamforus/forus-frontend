let AwesomeQR = require('../../../../forus-platform/js/angular-1/libs/AwesomeQrCode');

let QrCodeDirective = function(
    scope, element, $q
) {
    let buildQrCode = () => {
        let qrCodeEl = element.find('img').attr('id', "").empty()[0];
        let value = JSON.stringify({
            type: scope.qrType,
            value: scope.qrValue
        });

        let promises = [];
        let backgroundImage = null;
        let logoImage = null;

        let loadImage = (url, callback) => {
            return $q((resolve, reject) => {
                let img = document.createElement('img');
                img.crossOrigin = "Anonymous";
                img.onload = () => callback(img) & resolve();
                img.onerror = reject;
                img.src = url;
            });
        };

        if (scope.qrBackground) {
            promises.push(loadImage(scope.qrBackground, (img) => {
                backgroundImage = img;
            }));
        }

        if (scope.qrLogo) {
            promises.push(loadImage(scope.qrLogo, (img) => {
                logoImage = img;
            }));
        }
        // todo: make dotScale an overwriteable variable default is 0.8; voucher page is 1
        $q.all(promises).then(function() {
            AwesomeQR.create({
                text: value,
                size: 600,
                margin: 0,
                dotScale: 1,
                bindElement: qrCodeEl,
                logoImage: logoImage || undefined,
                backgroundImage: backgroundImage || undefined,
            });
        });
    };

    scope.$watch('qrValue', function(value, old) {
        if (value != old) {
            buildQrCode();
        }
    });

    scope.$watch('qrType', function(value, old) {
        if (value != old) {
            buildQrCode();
        }
    });

    scope.$watch('qrBackground', function(value, old) {
        if (value != old) {
            buildQrCode();
        }
    });

    scope.$watch('qrLogo', function(value, old) {
        if (value != old) {
            buildQrCode();
        }
    });

    buildQrCode();
};

module.exports = ['$q', ($q) => {
    return {
        scope: {
            qrDescription: '@',
            qrAlt: '@',
            qrValue: '=',
            qrBackground: '@',
            qrLogo: '@',
            qrType: '@'
        },
        restrict: "EA",
        replace: true,
        link: (scope, element) => QrCodeDirective(scope, element, $q),
        templateUrl: 'assets/tpl/directives/qr-code.html'
    };
}];