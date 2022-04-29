const FundProviderComponent = function(
    $q,
    $filter,
    FundService,
    $stateParams,
    ModalService,
    OrganizationService,
    PushNotificationsService
) {
    const $ctrl = this;
    const $translate = $filter('translate');

    $ctrl.accepted = false;
    $ctrl.submitting = false;
    $ctrl.dropdownMenuItem = false;

    $ctrl.filters = { values: { q: "", per_page: 15 } };
    $ctrl.filtersSponsorProducts = { values: { q: "", per_page: 15 } };

    const $translateDangerZone = (key) => $translate(
        'modals.danger_zone.sponsor_provider_organization_state.' + key
    );

    const transformProduct = (product) => {
        const activeDeals = product.deals_history ? product.deals_history.filter((deal) => deal.active) : [];

        product.allowed = $ctrl.fundProvider.products.indexOf(product.id) !== -1;
        product.active_deal = activeDeals.length > 0 ? activeDeals[0] : null;
        product.copyParams = { ...$stateParams, ...{ source: product.id } };
        product.viewParams = { ...$stateParams, ...{ product_id: product.id } };
        product.editParams = { ...$stateParams, ...{ product_id: product.id } };
        product.subsidyEditParams = { ...$stateParams, ...{ product_id: product.id } };

        return product;
    };

    $ctrl.toggleActions = (e, item) => {
        e.stopPropagation();
        $ctrl.dropdownMenuItem = item;
    };

    $ctrl.onClickOutsideMenu = (e) => {
        e.stopPropagation();
        $ctrl.dropdownMenuItem = false;
    };

    $ctrl.disableProductItem = function(fundProvider, product) {
        FundService.stopActionConfirmationModal(() => {
            product.allowed = false;
            $ctrl.updateAllowBudgetItem(fundProvider, product);
        });
    };

    $ctrl.updateAllowBudgetItem = function(fundProvider, product) {
        const enable_products = product.allowed ? [{ id: product.id }] : [];
        const disable_products = !product.allowed ? [product.id] : [];

        product.submitting = true;

        $ctrl.updateProvider(fundProvider, { enable_products, disable_products }).finally(() => {
            product.submitting = false;
        });
    };

    $ctrl.updateFundProviderAllow = (fundProvider, allowType) => {
        fundProvider.submittingAllow = true;

        $ctrl.updateProvider(fundProvider, { [allowType]: fundProvider[allowType] }).finally(() => {
            fundProvider.submittingAllow = false;
        });
    };

    $ctrl.updateFundProviderState = (fundProvider, accepted) => {
        const state = accepted ? 'accepted' : 'rejected';

        ModalService.open("dangerZone", {
            title: $translateDangerZone(state + '.title'),
            description: $translateDangerZone(state + '.description'),
            cancelButton: $translateDangerZone(state + '.buttons.cancel'),
            confirmButton: $translateDangerZone(state + '.buttons.confirm'),
            text_align: 'center',
            onConfirm: () => {
                fundProvider.submittingState = state;

                $ctrl.updateProvider(fundProvider, { state }).finally(() => {
                    fundProvider.submittingState = false;
                });
            }
        });
    };

    $ctrl.updateProvider = (fundProvider, query) => {
        return FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id,
            query
        ).then((res) => {
            PushNotificationsService.success('Opgeslagen!');

            $ctrl.fundProvider = res.data.data;
            $ctrl.accepted = $ctrl.fundProvider.state == 'accepted';
        }, console.error);
    };

    $ctrl.fetchProducts = (fundProvider, query = {}) => {
        return $q((resolve, reject) => {
            FundService.listProviderProducts(
                fundProvider.fund.organization_id,
                fundProvider.fund.id,
                fundProvider.id,
                Object.assign({}, query)
            ).then((res) => {
                resolve($ctrl.products = {
                    meta: res.data.meta,
                    data: res.data.data.map((product) => transformProduct(product)),
                });
            }, reject);
        });
    };

    $ctrl.fetchSponsorProducts = (fundProvider, query = {}) => {
        return $q((resolve, reject) => {
            OrganizationService.sponsorProducts(
                $ctrl.organization.id,
                fundProvider.organization_id,
                Object.assign({}, query)
            ).then((res) => {
                resolve($ctrl.sponsorProducts = {
                    meta: res.data.meta,
                    data: res.data.data.map((product) => transformProduct(product)),
                });
            }, reject);
        });
    };

    $ctrl.onPageChange = (query = {}) => {
        return $ctrl.fetchProducts($ctrl.fundProvider, query);
    };

    $ctrl.onPageChangeSponsorProducts = (query = {}) => {
        return $ctrl.fetchSponsorProducts($ctrl.fundProvider, query);
    };

    $ctrl.deleteProduct = (product) => {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'Weet u zeker dat u het aanbod wilt verwijderen?',
            description: sprintf("U staat op het punt om %s te verwijderen. Weet u zeker dat u dit aanbod wilt verwijderen?", product.name),
            confirm: () => OrganizationService.sponsorProductDelete(
                $ctrl.organization.id,
                $ctrl.fundProvider.organization_id,
                product.id
            ).then(() => $ctrl.onPageChangeSponsorProducts()),
        });
    }

    $ctrl.$onInit = function() {
        $ctrl.accepted = $ctrl.fundProvider.state == 'accepted';
        $ctrl.stateParams = $stateParams;

        $ctrl.onPageChange();

        if ($ctrl.organization.manage_provider_products) {
            $ctrl.onPageChangeSponsorProducts();
        }
    };
};

module.exports = {
    bindings: {
        fund: '<',
        organization: '<',
        fundProvider: '<',
    },
    controller: [
        '$q',
        '$filter',
        'FundService',
        '$stateParams',
        'ModalService',
        'OrganizationService',
        'PushNotificationsService',
        FundProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider.html'
};
