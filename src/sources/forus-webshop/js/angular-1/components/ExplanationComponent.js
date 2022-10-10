let ExplanationComponent = function(
    $sce,
    FundService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        FundService.list().then(res => $ctrl.funds = res.data.data);
        
        $ctrl.description_html = $sce.trustAsHtml($ctrl.page.description_html);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        page: '<',
    },
    controller: [
        '$sce',
        'FundService',
        ExplanationComponent
    ],
    templateUrl: 'assets/tpl/pages/explanation.html'
};