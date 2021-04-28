let FundsComponent = function(
    $q,
    $state,
    $stateParams,
    appConfigs,
    FundService,
    ModalService,
    VoucherService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.applyingFund = false;
    $ctrl.appConfigs = appConfigs;

    if (!appConfigs.features || !appConfigs.features.funds.list) {
        return $state.go('home');
    }

    $ctrl.objectOnly = (obj, props = []) => {
        let out = {};

        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && props.indexOf(prop) != -1) {
                out[prop] = obj[prop];
            }
        }

        return out;
    };

    $ctrl.showPartnerModal = () => {
        ModalService.open('modalNotification', {
            type: 'info',
            title: 'Dit tegoed is al geactiveerd',
            closeBtnText: 'Bevestig',
            description: [
                "U krijgt deze melding omdat het tegoed is geactiveerd door een ",
                "famielid of voogd. De tegoeden zijn beschikbaar in het account ",
                "van de persoon die deze als eerste heeft geactiveerd."
            ].join(''),
        });
    };

    $ctrl.toggleMobileMenu = () => {
        $ctrl.showModalFilters ? $ctrl.hideMobileMenu() : $ctrl.showMobileMenu()
    };

    $ctrl.showMobileMenu = () => {
        $ctrl.showModalFilters = true;
        $ctrl.updateState($ctrl.form.values);
    };

    $ctrl.hideMobileMenu = () => {
        $ctrl.showModalFilters = false;
        $ctrl.updateState($ctrl.form.values);
    };

    $ctrl.showAs = (display_type) => {
        $ctrl.display_type = display_type;
        $ctrl.updateState($ctrl.form.values);
    };

    $ctrl.updateState = (query) => {
        $state.go('funds', {
            q: query.q || '',
            page: query.page,
            display_type: query.display_type,
            organization_id: query.organization_id,
            show_menu: $ctrl.showModalFilters,
        });
    };

    $ctrl.onFormChange = (values) => {
        if (timeout) {
            $timeout.cancel(timeout);
        }

        timeout = $timeout(() => {
            $ctrl.onPageChange(values);
        }, 1000);
    };

    $ctrl.loadFunds = (query, location = 'replace') => {
        return $q((resolve, reject) => {
            FundService.list(null, query).then(res => {
                $ctrl.funds = res.data;
                $ctrl.updateFundsMeta();
                $ctrl.updateState(query, location);
                resolve();
            }, reject);
        });
    };

    $ctrl.onPageChange = (values) => $ctrl.loadFunds(values);

    $ctrl.applyFund = function(fund) {
        if (fund.taken_by_partner) {
            return $ctrl.showPartnerModal();
        }

        if ($ctrl.applyingFund) {
            return;
        } else {
            $ctrl.applyingFund = true;
        }

        FundService.apply(fund.id).then(function(res) {
            $ctrl.fetchVouchers().then(() => {
                $ctrl.loadFunds($ctrl.form.values).then(() => {
                    $ctrl.applyingFund = false;

                    if ($ctrl.funds.data.filter(fund => {
                        return fund.isApplicable && !fund.alreadyReceived
                    }).length === 0) {
                        $state.go('voucher', res.data.data);
                    }
                }, () => $ctrl.applyingFund = false);
            }, () => $ctrl.applyingFund = false);
        }, console.error);
    };

    $ctrl.updateFundsMeta = () => {
        $ctrl.funds.data = $ctrl.funds.data.map(function(fund) {
            fund.vouchers = $ctrl.vouchers.filter(voucher => voucher.fund_id == fund.id && !voucher.expired);
            fund.isApplicable = fund.criteria.filter(criterion => !criterion.is_valid).length == 0;
            fund.alreadyReceived = fund.vouchers.length !== 0;

            fund.showPendingButton = !fund.alreadyReceived && fund.has_pending_fund_requests;
            fund.showActivateButton = !fund.alreadyReceived && fund.isApplicable;

            return fund;
        });
    };

    $ctrl.fetchVouchers = () => {
        return $q((resolve, reject) => VoucherService.list().then((res) => {
            resolve($ctrl.vouchers = res.data.data);
        }, reject));
    };

    $ctrl.$onInit = function() {
        $ctrl.updateFundsMeta();

        $ctrl.organizations.unshift({
            id: null,
            name: 'Alle organisaties',
        });

        $ctrl.form = FormBuilderService.build({
            q: $stateParams.q || '',
            organization_id: $stateParams.organization_id || null,
            per_page: $stateParams.per_page || 10,
        });

        $ctrl.showModalFilters = $stateParams.show_menu;
        $ctrl.display_type = $stateParams.display_type;
    };
};

module.exports = {
    bindings: {
        funds: '<',
        records: '<',
        vouchers: '<',
        organizations: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'appConfigs',
        'FundService',
        'ModalService',
        'VoucherService',
        'FormBuilderService',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/funds.html'
};