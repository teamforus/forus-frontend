let ExplanationComponent = function(
    $sce,
    $filter,
    appConfigs,
    FundService
) {
    let $ctrl = this;
    const $i18n = $filter('i18n');

    $ctrl.defaultFAQ = [];
    $ctrl.faq = [];

    const defaultQuestionKeys = [
        "one", "two", "three", "four", "five", "six", "seven", "eight",
        "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"
    ];

    const transformDefaultQuestion = (index, fund_name, fund_start_date) => {
        const key = defaultQuestionKeys[index];

        return {
            content_default: $i18n(`home.faq.${key}`),
            title_default: $i18n(`home.faq.faq_${key}`, { fund: fund_name }),
            content_key: `home.faq.${appConfigs.client_key}.${key}`,
            title_key: `home.faq.${appConfigs.client_key}.faq_${key}`,
            fund_name: fund_name,
            fund_start_date: fund_start_date,
        }
    };

    const makeDefaultFAQ = (funds) => {
        for (let i = 0; i < 14; ++i) {
            $ctrl.defaultFAQ.push(transformDefaultQuestion(i, funds[0].name, $ctrl.funds[0].start_date_locale));
        }

        if (['winterswijk', 'oostgelre', 'berkelland'].indexOf(appConfigs.client_key) != -1) {
            $ctrl.defaultFAQ.push(transformDefaultQuestion(14, funds[0].name, $ctrl.funds[0].start_date_locale));
        }
    };

    $ctrl.$onInit = () => {
        FundService.list().then(res => {
            $ctrl.funds = res.data.data;
            makeDefaultFAQ($ctrl.funds);
        });
        
        $ctrl.description_html = $sce.trustAsHtml($ctrl.page.description_html);
        
        $ctrl.faq = $ctrl.page.faq.map((faq) => ({
            ...faq, description_html: $sce.trustAsHtml(faq.description_html || ''),
        })) || [];
    };
};

module.exports = {
    bindings: {
        funds: '<',
        page: '<',
    },
    controller: [
        '$sce',
        '$filter',
        'appConfigs',
        'FundService',
        ExplanationComponent
    ],
    templateUrl: 'assets/tpl/pages/explanation.html'
};