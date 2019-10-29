let ModalFundTopUpComponent = function(
    FundService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let fund = $ctrl.modal.scope.fund;

        FundService.makeTopUp(fund.organization_id, fund.id).then((res) => {
            if (fund.currency == 'eur') {
                $ctrl.topUpCode = res.data.data.code;
                $ctrl.topUpIban = res.data.data.iban;
            } else {
                $ctrl.address = res.data.data.address;
            }

            $ctrl.type = fund.currency;
            $ctrl.isReady = true;
        }, res => {
            alert(res.data.message);
            $ctrl.close();
        });
    };
    $ctrl.$onDestroy = function() {};

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
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FundService',
        ModalFundTopUpComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-top-up.html';
    }
};