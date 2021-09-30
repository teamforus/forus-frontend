const SponsorProviderOrganizationsComponent = function(
    FileService,
    ModalService,
    OrganizationService
) {
    const $ctrl = this;

    $ctrl.loaded = false;
    $ctrl.extendedView = localStorage.getItem('sponsor_providers.extended_view') === 'true';

    $ctrl.orderByOptions = [{
        value: 'application_date',
        name: 'bestel op: aanvraagdatum'
    }, {
        value: 'name',
        name: 'bestel op: naam'
    }];

    $ctrl.filters = {
        show: false,
        values: {},
        defaultValues: {
            q: '',
            order_by: $ctrl.orderByOptions[0].value,
            fund_id: null,
            allow_budget: '',
            allow_products: '',
        },
        reset: function() {
            this.values = { ...this.defaultValues };
        }
    };

    $ctrl.setExtendedView = function(extendedView) {
        localStorage.setItem('sponsor_providers.extended_view', extendedView)
        $ctrl.extendedView = extendedView;
    };

    $ctrl.onPageChange = (query) => {
        const filter = { ...query, ...{ order_dir: query.order_by == 'name' ? 'asc' : 'desc' } };

        OrganizationService.providerOrganizations($ctrl.organization.id, filter).then((res => {
            $ctrl.providerOrganizations = {
                meta: res.data.meta,
                data: $ctrl.transformList(res.data.data),
            };
        }));
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        ModalService.open('exportType', {
            success: (data) => {
                const fileName = 'providers_' + $ctrl.organization.id + '_' + moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.exportType;

                OrganizationService.providerOrganizationsExport($ctrl.organization.id, {
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
        $ctrl.onPageChange($ctrl.filters.values);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
    },
    controller: [
        'FileService',
        'ModalService',
        'OrganizationService',
        SponsorProviderOrganizationsComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-provider-organizations.html'
};
