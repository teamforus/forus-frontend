const phones = require('libphonenumber-js');
const countries = require('i18n-iso-countries');

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const PhoneControlDirective = function (
    $scope,
) {
    const $dir = $scope.$dir;

    const getCountryOptions = () => {
        return phones.getCountries().map((code) => ({
            code: code,
            name: countries.getName(code, "en"),
            dialCode: phones.getPhoneCode(code),
        })).map((option) => option.name ? {
            ...option, name: `${option.name} (+${option.dialCode})`
        } : null).filter((option) => option);
    };

    $dir.getFullPhoneNumber = () => {
        return `+${$dir.dialCode}${$dir.phoneNumber}`;
    };

    $dir.onChangeCountry = () => {
        $dir.ngModel = $dir.getFullPhoneNumber();
    };

    $dir.onChangeNumber = () => {
        $dir.ngModel = $dir.getFullPhoneNumber();
    };

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
            PhoneControlDirective,
        ],
        template: require('./templates/phone_control.pug'),
    };
};