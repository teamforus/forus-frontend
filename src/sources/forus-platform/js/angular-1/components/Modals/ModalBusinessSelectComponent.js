let ModalBusinessSelectComponent = function(
    $state,
    $timeout,
    FormBuilderService,
    BusinessTypeService,
    OrganizationService,
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let organization = $ctrl.modal.scope.organization;

        $ctrl.businessTypes = BusinessTypeService.list({
            per_page: 9999
        }).then(res => {
            $ctrl.businessTypes = res.data.data;

            $ctrl.businessType = $ctrl.businessTypes.filter(
                option => option.id == $ctrl.form.values.business_type_id
            )[0] || null;
        });

        $ctrl.form = FormBuilderService.build({}, form => {
            form.lock();

            OrganizationService.updateBusinessType(
                organization.id, form.values.business_type_id
            ).then(res => {
                $timeout(() => {
                    $ctrl.close();
                    $state.go('home');
                }, 250);
            });
        });
        
        $ctrl.changeBusinessType = (value) => {
            $ctrl.form.values.business_type_id = value.id;
        };
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$state',
        '$timeout',
        'FormBuilderService',
        'BusinessTypeService',
        'OrganizationService',
        ModalBusinessSelectComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-business-select.html';
    }
};