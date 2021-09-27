let SponsorProviderOrganizationsComponent = function(
    $q,
    $stateParams,
    FileService,
    ModalService,
    OrganizationService
) {
    let $ctrl = this;
    let org = OrganizationService.active();

    $ctrl.loaded = false;
    $ctrl.extendedView = localStorage.getItem('sponsor_providers.extended_view') === 'true';

    $ctrl.filters = {
        show: false,
        values: {
            sort_by: 'created_at',
        },
        reset: function() {
            this.values.q = '';
            this.values.sort_by = 'created_at';
            this.values.fund_id = null;
            this.values.allow_budget = '';
            this.values.allow_products = '';
        }
    };

    $ctrl.sortByOptions = [{
        value: 'created_at',
        name: 'Created at'
    }, {
        value: 'name',
        name: 'Name'
    }];

    $ctrl.setExtendedView = function(extendedView) {
        localStorage.setItem('sponsor_providers.extended_view', extendedView)
        $ctrl.extendedView = extendedView;
    };

    $ctrl.onPageChange = (query) => {
        return $q((resolve, reject) => {
            OrganizationService.providerOrganizations($stateParams.organization_id, {
                ...query,
                ...$ctrl.filters.values,
            }).then((res => {
                $ctrl.providerOrganizations = {
                    meta: res.data.meta,
                    data: $ctrl.transformList(res.data.data),
                };

                resolve($ctrl.providerOrganizations);
            }), reject);
        });
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        ModalService.open('exportType', {
            success: (data) => {
                const fileName = 'providers_' + org + '_' + moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.exportType;

                OrganizationService.providerOrganizationsExport($stateParams.organization_id, {
                    ...$ctrl.filters.values,
                    ...{ export_format: data.exportType } 
                }).then((res => {
                    FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
                }));
            }
        });
    };


    $ctrl.hideFilters = () => $ctrl.filters.show = false;
    $ctrl.transformList = (providers) => providers.map(provider => $ctrl.transformItem(provider));

    $ctrl.transformItem = (providerOrganization) => ({
        ...providerOrganization,
        ...{
            uiViewParams: {
                organization_id: $ctrl.organization.id,
                provider_organization_id: providerOrganization.id
            },
            funds: (providerOrganization.funds || []).map((fund) => ({
                ...fund,
                uiViewParams: {
                    fund_id: fund.id,
                    organization_id: fund.organization_id,
                    fund_provider_id: fund.fund_provider_id
                },
            }))
        }
    });

    $ctrl.$onInit = function() {
        $ctrl.funds = [...[{ id: null, name: 'Alle' }], ...$ctrl.funds]
        $ctrl.filters.reset();
        $ctrl.providerOrganizations.data = $ctrl.transformList($ctrl.providerOrganizations.data);
    };
};

module.exports = {
    bindings: {
        providerOrganizations: '<',
        organization: '<',
        funds: '<',
    },
    controller: [
        '$q',
        '$stateParams',
        'FileService',
        'ModalService',
        'OrganizationService',
        SponsorProviderOrganizationsComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-provider-organizations.html'
};
