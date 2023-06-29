const AwesomeQR = require('../libs/AwesomeQrCode');

const QrCodeDirective = function(scope, element, $q) {
    const images = {};

    const buildQrCode = () => {
        const qrCodeEl = element.find('.qr_code img').attr('id', "").empty()[0];
        const value = scope.qrRaw ? scope.qrRaw : JSON.stringify({
            type: scope.qrType,
            value: scope.qrValue
        });

        const promises = [];

        const loadImage = (url, callback) => {
            return $q((resolve, reject) => {
                let img = document.createElement('img');
                img.crossOrigin = "Anonymous";
                img.onload = () => callback(img) & resolve();
                img.onerror = reject;
                img.src = url;
            });
        };

        delete images.img;
        delete images.backgroundImage;

        if (scope.qrLogo) {
            promises.push(loadImage(scope.qrLogo, (img) => images.logoImage = img));
        }

        if (scope.qrBackground) {
            promises.push(loadImage(scope.qrBackground, (img) => images.backgroundImage = img));
        }

        $q.all(promises).then(function() {
            AwesomeQR.create({
                text: value,
                size: 600,
                margin: 0,
                dotScale: 0.8,
                bindElement: qrCodeEl,
                logoImage: images.logoImage || undefined,
                backgroundImage: images.backgroundImage || undefined,
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

    scope.$watch('qrRaw', function(value, old) {
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
            qrRaw: '=',
            qrValue: '=',
            qrBackground: '@',
            padding: '@',
            qrLogo: '@',
            qrType: '@'
        },
        restrict: "EA",
        replace: true,
        link: (scope, element) => QrCodeDirective(scope, element, $q),
        template: require('../../../pug/tpl/directives/qr-code.pug'), //'assets/tpl/directives/qr-code.html'
    };
}];