const FundRequestsComponent = function(
    $state,
    $stateParams,
    FundRequestService,
    PageLoadingBarService
) {
    const $ctrl = this;

    $ctrl.files = [];

    $ctrl.filters = {
        fund_id: $stateParams.fund_id || null,
        archived: $stateParams.archived || 0,
        page: $stateParams.page || 1,
        per_page: 15,
        order_by: 'no_answer_clarification'
    };

    $ctrl.updateState = (query) => {
        $state.go('fund-requests', {
            page: query.page,
            fund_id: query.fund_id,
            archived: query.archived,
            order_by: query.order_by,
            order_by_dir: query.order_by_dir,
        });
    };

    $ctrl.onPageChange = (query = {}) => {
        const filters = { ...$ctrl.filters, ...query };

        PageLoadingBarService.setProgress(0);

        FundRequestService.indexRequester(filters)
            .then((res) => $ctrl.fundRequests = res.data)
            .finally(() => {
                PageLoadingBarService.setProgress(100);
                $ctrl.updateState(filters);
            });
    };

    $ctrl.$onInit = function() {
        if (!$ctrl.identity) {
            return $state.go('start');
        }

        $ctrl.funds.unshift({
            name: 'Alle tegoeden',
            id: null,
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
        identity: '<',
        fundRequests: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'FundRequestService',
        'PageLoadingBarService',
        FundRequestsComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-requests.html',
};