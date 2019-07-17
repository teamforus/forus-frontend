let QrCodeDirective = function(
    scope, element
) { 
    let buildQrCode = () => {
        let qrCodeEl = element.find('.qr_code').empty()[0];
        let qrCode = new QRCode(qrCodeEl, {
            colorLight: 'transparent', 
            correctLevel: QRCode.CorrectLevel.L
        });

        qrCode.makeCode(
            JSON.stringify({
                type: scope.qrType,
                value: scope.qrValue
            })
        );
        
        qrCodeEl.removeAttribute('title');
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

    buildQrCode();
};

module.exports = () => {
    return {
        scope: {
            qrDescription: '@',
            qrValue: '=',
            qrType: '@'
        },
        restrict: "EA",
        replace: true,
        link: (scope, element) => QrCodeDirective(scope, element),
        templateUrl: 'assets/tpl/directives/qr-code.html'
    };
};