const MolliePrivacyComponent = function () {
    const $ctrl = this;

    $ctrl.$onInit = function () {};
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        MolliePrivacyComponent,
    ],
    templateUrl: 'assets/tpl/pages/mollie-privacy.html',
};