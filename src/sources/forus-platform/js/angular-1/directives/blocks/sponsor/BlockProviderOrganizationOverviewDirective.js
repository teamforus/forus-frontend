const BlockProviderOrganizationOverviewDirective = function($scope) {
    const $dir = $scope.$dir;

    const makeProperties = (organization) => {
        const properties = [];
        const makeProp = (label, value, primary = false) => ({ label, value, primary });

        organization.email && properties.push(makeProp("E-mail", organization.email, true));
        organization.website && properties.push(makeProp("Website", organization.website, true));
        organization.phone && properties.push(makeProp("Telefoonnummer", organization.phone, true));
        organization.kvk && properties.push(makeProp("KVK", organization.kvk));
        organization.iban && properties.push(makeProp("IBAN", organization.iban))
        organization.btw && properties.push(makeProp("BTW", organization.btw));

        return [
            properties.splice(0, properties.length == 4 ? 4 : 3),
            properties.splice(0, properties.length == 4 ? 4 : 3)
        ];
    };

    $dir.$onInit = () => {
        $dir.properties = makeProperties($dir.organization);
    };
};

module.exports = () => {
    return {
        scope: {
            fundProvider: "=",
            organization: "=",
            updateFundProviderAllow: "=",
            updateFundProviderState: "=",
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            BlockProviderOrganizationOverviewDirective
        ],
        templateUrl: 'assets/tpl/directives/blocks/sponsor/block-provider-organization-overview.html'
    };
};