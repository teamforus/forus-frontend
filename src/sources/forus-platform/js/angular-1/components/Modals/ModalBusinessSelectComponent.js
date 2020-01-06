let ModalBusinessSelectComponent = function(
    $state,
    $timeout,
    FormBuilderService,
    BusinessTypeService,
    OrganizationService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let organizations = $ctrl.modal.scope.organizations;
        $ctrl.organization = organizations[0];

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
                $ctrl.organization.id, form.values.business_type_id
            ).then(res => {
                $ctrl.close();
                organizations = organizations.slice(1);

                if (!organizations.length) {
                    $ctrl.modal.scope.onReady();
                } else {
                    $timeout(() => {
                        ModalService.open('businessSelect', {
                            organizations: organizations,
                            onReady: () => $ctrl.modal.scope.onReady()
                        });
                    }, 250);
                } 
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
        'ModalService',
        ModalBusinessSelectComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-business-select.html';
    }
};