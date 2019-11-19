let modalEmployeeAddConfirmationComponent = function(
    $q,
    $rootScope,
    $timeout,
    $filter,
    $element,
) {
    let $ctrl = this;
    let $translate = $filter('translate');
    
    $ctrl.employee = {};

    $ctrl.$onInit = () => {
        $ctrl.employee.email = $ctrl.modal.scope.email;
    };

    $ctrl.$onDestroy = () => {};
    $ctrl.closeModal = () => {
        if ($ctrl.changed) {
            $ctrl.modal.scope.done();
        }

        $ctrl.close();
    }

    $ctrl.confirm = () => {
        $ctrl.modal.scope.success({ allow: true });

        $ctrl.close();
    }

    $ctrl.cancel = () => {
        $ctrl.modal.scope.success({ allow: false });

        $ctrl.close();
    }
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        email: '='
    },
    controller: [
        '$q',
        '$rootScope',
        '$timeout',
        '$filter',
        '$element',
        modalEmployeeAddConfirmationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-employee-add-confirmation.html';
    }
};