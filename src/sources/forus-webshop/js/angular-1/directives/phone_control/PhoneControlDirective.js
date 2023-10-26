const phones = require('libphonenumber-js');
const countries = require('i18n-iso-countries');

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const PhoneControlDirective = function (
    $scope,
    $timeout,
) {
    const $dir = $scope.$dir;
    const regEx = /[^- ()0-9]+/g;
    const regExSpace = /  +/g;

    const getCountryOptions = () => {
        return phones.getCountries().map((code) => ({
            code: code,
            name: countries.getName(code, "en"),
            dialCode: phones.getPhoneCode(code),
        })).map((option) => option.name ? {
            ...option, name: `${option.name} (+${option.dialCode})`
        } : null).filter((option) => option);
    };

    $dir.clear = (value) => {
        return value?.replace(regEx, '').replace(regExSpace, '') || '';
    }

    $dir.getFullPhoneNumber = () => {
        return `+${$dir.dialCode}${$dir.clear($dir.phoneNumber)}`;
    };

    $dir.onChangeCountry = (e) => {
        $dir.ngModel = $dir.getFullPhoneNumber();
    };

    $dir.onChangeNumber = () => {
        $dir.ngModel = $dir.getFullPhoneNumber();
    };

    $dir.onKeyDown = (e) => {
        $timeout(() => e.target.value = $dir.clear($dir.phoneNumber), 0);
    }

    $dir.$onInit = () => {
        $dir.ngModel = ($dir.ngModel || '').toString();

        $dir.countryOptions = getCountryOptions();
        $dir.dialCode = $dir.countryOptions.find(country => country.code == 'NL').dialCode;
    }
};

module.exports = () => {
    return {
        scope: {
            ngModel: '=',
        },
        restrict: "EA",
        replace: true,
        require: {
            ngModelCtrl: 'ngModel',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            PhoneControlDirective,
        ],
        template: require('./templates/phone_control.pug'),
    };
};