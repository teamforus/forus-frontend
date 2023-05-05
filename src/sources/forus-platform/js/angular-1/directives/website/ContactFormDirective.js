const uniqueId = require('lodash/uniqueId');

const ContactFormDirective = function (
    $scope,
    $timeout,
    FormBuilderService,
    ContactService
) {
    const $dir = $scope.$dir;
    $dir.formSuccess = false;
    $dir.recaptchaValid = false;
    let widgetId;
    let siteKey = '6LfA-JcUAAAAAC9SpgAr2ZmL4rFwjb83_U2MDcfQ';

    $dir.buildForm = () => {
        $dir.form = FormBuilderService.build({}, (form) => {
            if ($dir.recaptchaValid) {
                ContactService.send(form.values).then((res) => {
                    $dir.formSuccess = true;
                    $dir.recaptchaValid = false;

                    form.reset();
                    form.unlock();
                }, (res) => {
                    form.errors = res.data.errors;
                    form.unlock();
                });
            } else {
                form.errors = {
                    recaptcha: ['recaptcha is invalid']
                };
                form.unlock();
            }
        });
    }

    const generateRecaptchaId = () => {
        return 'recaptcha-form-' + uniqueId();
    }

    const initRecaptcha = () => {
        if (typeof grecaptcha === 'undefined' || typeof grecaptcha.render === 'undefined') {
            return $timeout(() => initRecaptcha(), 500);
        }

        widgetId = grecaptcha.render($dir.recaptchaId, {
            'sitekey': siteKey,
            'callback': () => $dir.recaptchaValid = true,
            'size': 'invisible'
        });

        grecaptcha.execute(widgetId);
    }

    $dir.$onInit = () => {
        $dir.recaptchaId = generateRecaptchaId();
        $dir.buildForm();
        $timeout(() => initRecaptcha());
    };
};

module.exports = () => {
    return {
        bindToController: {},
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            'FormBuilderService',
            'ContactService',
            ContactFormDirective
        ],
        templateUrl: 'assets/tpl/directives/website/contact-form.html',
    };
};