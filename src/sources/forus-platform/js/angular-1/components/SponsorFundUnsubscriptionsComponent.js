const SponsorFundUnsubscriptionsComponent = function(
    FundUnsubscribeService
) {
    const $ctrl = this;

    $ctrl.emptyBlockText = "No unsubscription requests";
    
    $ctrl.shownType = 'all';

    $ctrl.filterByType = (type) => {
        $ctrl.shownType = type;
        let query = {};

        if (type == 'archive') {
            query = { states: ['approved', 'canceled', 'expired']};
        } else if (type == 'pending') {
            query = { states: ['pending'] };
        } else {
            query = {};
        }

        fetchUnsubscriptions(query);
    };

    const fetchUnsubscriptions = (query = {}) => {
        FundUnsubscribeService.listSponsor($ctrl.organization.id, {
            ...query,
            per_page: 10
        }).then(res => {
            $ctrl.fundUnsubscribes = res.data;
        });
    };

    $ctrl.$onInit = function() {};
};

module.exports = {
    bindings: {
        organization: '<',
        fundUnsubscribes: '<',
    },
    controller: [
        'FundUnsubscribeService',
        SponsorFundUnsubscriptionsComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-fund-unsubscriptions.html'
};