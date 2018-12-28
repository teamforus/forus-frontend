let ModalAuthComponent = function(
    $state,
    ModalService,
    FormBuilderService,
    PrevalidationService,
    ConfigService,
    FundService
) {

    let $ctrl = this;

    $ctrl.$onInit = () => {

        $ctrl.activateCodeForm = FormBuilderService.build({
            code: "",
        }, function(form) {
            if (!form.values.code) {
                form.errors.code = true;
                return;
            }

            form.lock();

            PrevalidationService.redeem(form.values.code).then((res) => {
                $ctrl.close();

                ConfigService.get().then((res) => {
                    if (!res.data.funds.list) {
                        FundService.applyToFirstAvailable().then(res => {
                            $state.go('voucher', res.data.data);
                        }, () => {
                            alert('Helaas, er is geen fonds waarvoor u zich kan aanmelden.');
                        });
                    } else if (res.data.records.list) {
                        $state.go('records');
                    } else {
                        $state.go('home');
                    }
                });
            }, (res) => {
                if (res.status == 403) {
                    form.errors.code = true;
                } else if (res.status == 429) {
                    $ctrl.close();
                    ModalService.open('modalNotification', {
                        type: 'info',
                        title: 'Te veel pogingen!',
                        description: 'U heeft driemaal een verkeerde activatiecode ingevuld. Probeer het over drie uur opnieuw.'
                    });
                }

                form.unlock();
            });
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$state',
        'ModalService',
        'FormBuilderService',
        'PrevalidationService',
        'ConfigService',
        'FundService',
        ModalAuthComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-activate-code.html';
    }
};
