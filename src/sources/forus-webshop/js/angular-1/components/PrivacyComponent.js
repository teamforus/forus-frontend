let PrivacyComponent = function($sce) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.description_html = $sce.trustAsHtml($ctrl.page.content_html);
    };
}

module.exports = {
    bindings: {
        page: '<',
    },
    controller: [
        '$sce',
        PrivacyComponent
    ],
    templateUrl: 'assets/tpl/pages/privacy.html'
};