let FundProviderComponent = function(
    $q,
    $state,
    $timeout,
    FundService,
    $stateParams,
    ModalService,
    OrganizationService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.dropdownMenuItem = false;

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15
        },
    };

    $ctrl.filtersSponsorProducts = {
        values: {
            q: "",
            per_page: 15
        },
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
        if (fundProvider.active) {
            FundService.updateProvider(
                fundProvider.fund.organization_id,
                fundProvider.fund.id,
                fundProvider.id, {
                    enable_products: product.allowed ? [{
                        id: product.id
                    }] : [],
                    disable_products: !product.allowed ? [product.id] : [],
                }
            ).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.fundProvider = res.data.data;
            }, console.error);
        }
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
                    data: $ctrl.transformProductsList(res.data.data),
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
                    data: $ctrl.transformProductsList(res.data.data),
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

    $ctrl.transformProduct = (product) => {
        let activeDeals = product.deals_history ? product.deals_history.filter(deal => deal.active) : [];

        product.allowed = $ctrl.fundProvider.products.indexOf(product.id) !== -1;
        product.active_deal = activeDeals.length > 0 ? activeDeals[0] : null;
        product.copyParams = { ...$stateParams, ...{ source: product.id } };
        product.viewParams = { ...$stateParams, ...{ product_id: product.id } };
        product.editParams = { ...$stateParams, ...{ product_id: product.id } };
        product.subsidyEditParams = { ...$stateParams, ...{ product_id: product.id } };

        return product;
    };

    $ctrl.transformProductsList = (products) => {
        return products.map(product => $ctrl.transformProduct(product));
    };

    $ctrl.openProductDetails = (product) => {
        $state.go('fund-provider-product', {
            organization_id: $ctrl.organization.id,
            fund_provider_id: $ctrl.fundProvider.id,
            fund_id: $ctrl.fund.id,
            product_id: product.id,
        });
    };

    $ctrl.updateFundProviderAllow = function(fundProvider, allowType) {
        if (fundProvider.active) {
            FundService.updateProvider(
                fundProvider.fund.organization_id,
                fundProvider.fund.id,
                fundProvider.id,
                { [allowType]: fundProvider[allowType] }
            ).then((res) => $timeout(() => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.fundProvider = res.data.data;

                checkFundProviderState();
                setClassForFundProvider();
            }, 500), console.error);
        }
    };

    $ctrl.fundProviderDecline = (fundProvider) => {
        FundService.declineProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id
        ).then((res) => $timeout(() => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fundProvider = res.data.data;

            checkFundProviderState();
            setClassForFundProvider();
            if ($ctrl.organization.manage_provider_products) {
                $ctrl.onPageChangeSponsorProducts();
            }
            $ctrl.onPageChange();
        }, 500), console.error);
    };

    $ctrl.fundProviderApprove = (fundProvider) => {
        FundService.approveProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id
        ).then((res) => $timeout(() => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fundProvider = res.data.data;

            checkFundProviderState();
            setClassForFundProvider();
            if ($ctrl.organization.manage_provider_products) {
                $ctrl.onPageChangeSponsorProducts();
            }
            $ctrl.onPageChange();
        }, 500), console.error);
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
            ).then(() => {
                $ctrl.onPageChangeSponsorProducts();
            }),
        });
    }

    $ctrl.prepareProperties = () => {
        let organization = $ctrl.fundProvider.organization;
        let properties = [];

        let makeProp = (label, value, primary = false) => ({
            label: label,
            value: value,
            primary: primary,
        });

        organization.email && properties.push(makeProp("E-mail", organization.email, true));
        organization.website && properties.push(makeProp("Website", organization.website, true));
        organization.phone && properties.push(makeProp("Telefoonnummer", organization.phone, true));
        organization.kvk && properties.push(makeProp("KVK", organization.kvk));
        organization.iban && properties.push(makeProp("IBAN", organization.iban))
        organization.btw && properties.push(makeProp("BTW", organization.btw));

        let count = properties.length;

        $ctrl.properties = [
            properties.splice(0, count == 4 ? 4 : 3),
            properties.splice(0, count == 4 ? 4 : 3)
        ];
    };

    $ctrl.$onInit = function() {
        $ctrl.stateParams = $stateParams;

        $ctrl.onPageChange();
        $ctrl.prepareProperties();

        if ($ctrl.organization.manage_provider_products) {
            $ctrl.onPageChangeSponsorProducts();
        }

        checkFundProviderState();
        setClassForFundProvider();
    };

    function setClassForFundProvider() {
        $ctrl.fundProvider.productToggleClass = $ctrl.fundProvider.active ?
            ($ctrl.fundProvider.allow_products ? 'form-toggle-disabled form-toggle-active' : '')
            : 'form-toggle-disabled form-toggle-off';
    }

    function checkFundProviderState() {
        $ctrl.fundProvider.active = $ctrl.fundProvider.state === 'approved';
    }
};

module.exports = {
    bindings: {
        organization: '<',
        fundProvider: '<',
        fund: '<'
    },
    controller: [
        '$q',
        '$state',
        '$timeout',
        'FundService',
        '$stateParams',
        'ModalService',
        'OrganizationService',
        'PushNotificationsService',
        FundProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider.html'
};
