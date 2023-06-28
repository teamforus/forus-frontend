let AwesomeQR = require('../libs/AwesomeQrCode');

let QrCodeDirective = function(
    scope, element, $q
) {
    let buildQrCode = () => {
        let qrCodeEl = element.find('.qr_code img').attr('id', "").empty()[0];
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

        $q.all(promises).then(function() {
            AwesomeQR.create({
                text: value,
                size: 600,
                margin: 0,
                dotScale: 0.8,
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