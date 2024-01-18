const ModalFundSelectComponent = function (
    FormBuilderService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { fund_id, funds, onSelect } = $ctrl.modal.scope;

        $ctrl.funds = funds;

        $ctrl.form = FormBuilderService.build({
            fund_id: fund_id ? fund_id : funds[0]?.id,
        }, (form) => {
            onSelect(funds.find(fund => fund.id === form.values.fund_id));
            $ctrl.close(form.values.fund_id);
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        ModalFundSelectComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-fund-select.html',
};
