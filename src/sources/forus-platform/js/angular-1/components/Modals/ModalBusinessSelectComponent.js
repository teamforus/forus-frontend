let ModalBusinessSelectComponent = function(
    FormBuilderService,
    BusinessTypeService,
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.businessTypes = BusinessTypeService.list({
            per_page: 9999
        }).then(res => {
            $ctrl.businessTypes = res.data.data;

            $ctrl.businessType = $ctrl.businessTypes.filter(
                option => option.id == $ctrl.form.values.business_type_id
            )[0] || null;
        });

        $ctrl.form = FormBuilderService.build({}, function(form) {
            form.lock();

        });
    
        $ctrl.changeBusinessType = (value) => {
            $ctrl.form.values.business_type_id = value.id;
        };
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        'BusinessTypeService',
        ModalBusinessSelectComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-business-select.html';
    }
};