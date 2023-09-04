const FundRequestPersonDirective = function(
    $scope,
    PageLoadingBarService,
    PushNotificationsService,
    FundRequestValidatorService,
) {
    const { $dir } = $scope;

    const setBreadcrumbs = (fundRequest) => {
        fundRequest.person_breadcrumbs = [
            fundRequest.person,
            fundRequest.person_relative ? fundRequest.person_relative : null,
        ].filter((item) => item);
    }

    $dir.fetchPerson = (fundRequest, scope, scope_id) => {
        const fetchingRelative = scope && scope_id;
        const data = fetchingRelative ? { scope, scope_id } : {};

        if ($dir.fetchingPerson) {
            return;
        }

        if (!fetchingRelative && fundRequest.person) {
            fundRequest.person_relative = null;
            fundRequest.bsn_expanded = true;
            return setBreadcrumbs(fundRequest);
        }

        $dir.fetchingPerson = true;
        PageLoadingBarService.setProgress(0);

        FundRequestValidatorService.getPersonBsn($dir.organization.id, fundRequest.id, data).then((res) => {
            if (fetchingRelative) {
                fundRequest.person_relative = res.data.data;
            } else {
                fundRequest.person = res.data.data;
            }

            fundRequest.bsn_expanded = true;
            setBreadcrumbs(fundRequest);
        }, (res) => {
            PushNotificationsService.danger('Mislukt', res.data.message);
        }).finally(() => {
            $dir.fetchingPerson = false;
            PageLoadingBarService.setProgress(100);
        });
    };

    $dir.closePerson = (fundRequest) => {
        fundRequest.bsn_expanded = false;
    };
};

module.exports = () => {
    return {
        scope: {
            fundRequest: '=',
            organization: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'PageLoadingBarService',
            'PushNotificationsService',
            'FundRequestValidatorService',
            FundRequestPersonDirective,
        ],
        templateUrl: 'assets/tpl/directives/fund-request-person.html',
    };
};