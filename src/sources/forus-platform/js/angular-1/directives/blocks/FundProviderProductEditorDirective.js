const FundProviderProductEditorDirective = function (
    $scope,
    $timeout,
    FundService,
    FormBuilderService,
) {
    const { $dir } = $scope;
    let timeout = null;

    $dir.amountChange = () => {
        $timeout.cancel(timeout);

        if (!$dir.form.values.amount && $dir.form.values.amount !== 0) {
            timeout = $timeout(() => $dir.form.values.amount = 0, 1000);
        }
    };

    $dir.$onInit = () => {
        const { deal, fund, product, fundProvider } = $dir;
        const { unlimited_stock, stock_amount } = product;
        const stockAmount = unlimited_stock ? 100 : stock_amount;
        const isTypeSubsidies = fund.type == 'subsidies';

        const defaultValues = {
            expire_at: fundProvider.fund.end_date,
            expires_with_fund: true,
            limit_total: stockAmount,
            limit_per_identity: stockAmount,
            limit_total_unlimited: unlimited_stock,
            ...(isTypeSubsidies ? { amount: 0, gratis: false } : {})
        };

        const values = deal ? {
            expire_at: deal.expire_at ? deal.expire_at : fundProvider.fund.end_date,
            limit_total: Math.min(deal.limit_total, stock_amount),
            limit_per_identity: Math.min(deal.limit_per_identity, stock_amount),
            expires_with_fund: !deal.expire_at,
            limit_total_unlimited: deal.limit_total_unlimited,
            ...(isTypeSubsidies ? {
                amount: parseFloat(deal.amount),
                gratis: parseFloat(deal.amount) === parseFloat(product.price),
            } : {})
        } : defaultValues;

        $dir.form = FormBuilderService.build(values, (form) => {
            FundService.updateProvider($dir.fund.organization_id, $dir.fund.id, fundProvider.id, {
                enable_products: [{
                    id: $dir.product.id,
                    amount: form.values.gratis ? $dir.product.price : form.values.amount,
                    limit_total: form.values.limit_total,
                    limit_total_unlimited: form.values.limit_total_unlimited ? 1 : 0,
                    limit_per_identity: form.values.limit_per_identity,
                    expire_at: form.values.expires_with_fund ? null : form.values.expire_at,
                }],
            }).then((res) => {
                $dir.onUpdate({ fundProvider: res.data.data });
            }, (res) => {
                form.errors = res.data.errors;
                return form.unlock();
            });
        }, true);

        if ($dir.onValuesChange) {
            $scope.$watch('$dir.form.values', (values) => $dir.onValuesChange(values), true)
        }
    };
};

module.exports = () => {
    return {
        scope: {
            deal: '=',
            fund: '=',
            product: '=',
            onReset: '&',
            onCancel: '&',
            onUpdate: '&',
            onValuesChange: '=',
            fundProvider: '=',
            fundProviderProduct: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            'FundService',
            'FormBuilderService',
            FundProviderProductEditorDirective,
        ],
        templateUrl: 'assets/tpl/directives/blocks/fund-provider-product-editor.html',
    };
};