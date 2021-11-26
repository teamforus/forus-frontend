const ModalFundTopUpComponent = function(
    $state,
    FundService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        let fund = $ctrl.modal.scope.fund;

        FundService.makeTopUp(fund.organization_id, fund.id).then((res) => {
            $ctrl.topUpCode = res.data.data.code;
            $ctrl.topUpIban = res.data.data.iban;

            $ctrl.modal.setLoaded();
        }, res => {
            PushNotificationsService.danger("Error!", res.data.message);
            $state.reload();
            $ctrl.close();
        });
    };

    $ctrl.copyToClipboard = (str) => {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        PushNotificationsService.success("Copied to clipboard.");
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$state',
        'FundService',
        'PushNotificationsService',
        ModalFundTopUpComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-fund-top-up.html',
};