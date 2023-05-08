const uniqueId = require('lodash/uniqueId');

const ContactFormDirective = function (
    $q,
    $scope,
    $element,
    appConfigs,
    ContactService,
    FormBuilderService,
) {
    const $dir = $scope.$dir;

    $dir.widgetId;
    $dir.formSuccess = false;
    $dir.recaptchaValid = false;

    $dir.buildForm = () => {
        $dir.form = FormBuilderService.build({}, (form) => {
            if ($dir.recaptchaValid) {
                ContactService.send(form.values).then(() => {
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
        }, true);
    }

    $dir.initRecaptcha = (captcha) => {
        $q((resolve) => {
            captcha.execute(captcha.render($dir.recaptchaId, {
                sitekey: appConfigs?.captcha_site_key,
                callback: resolve,
                size: 'invisible'
            }));
        }).then(
            () => $dir.recaptchaValid = true,
            () => $dir.recaptchaValid = false,
        );
    }

    $dir.$onInit = () => {
        $dir.buildForm();
        $dir.recaptchaId = `recaptcha-form-${uniqueId()}`;

        $dir.unwatch = $scope.$watch(() => grecaptcha?.render && $element.find(`#${$dir.recaptchaId}`).length > 0, (ready) => {
            if (ready) {
                $dir.unwatch();
                $dir.initRecaptcha(grecaptcha);
            }
        });
    };
};

module.exports = () => {
    return {
        scope: {
            type: '@',
            close: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$element',
            'appConfigs',
            'ContactService',
            'FormBuilderService',
            'FormBuilderService',
            ContactFormDirective,
        ],
        templateUrl: 'assets/tpl/directives/website/contact-form.html',
    };
};