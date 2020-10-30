let modalEmployeeAddConfirmationComponent = function(
    $element, 
    $timeout
) {
    let $ctrl = this;
    let bindName = 'employee_add_' + (new Date()).getTime();

    $ctrl.confirm = () => {
        $ctrl.modal.scope.success({ allow: true });
        $ctrl.close();
    }

    $ctrl.cancel = () => {
        $ctrl.modal.scope.success({ allow: false });
        $ctrl.close();
    }

    $ctrl.bind = () => {
        $element.focus();

        $(document).bind('keydown.' + bindName, (e) => $timeout(() => {
            let key = e.charCode || e.keyCode || 0;

            if (key == 13) {
                $ctrl.confirm();
            }

            if (key == 27) {
                $ctrl.cancel();
            }
        }, 0));
    };

    $ctrl.$onInit = () => {
        $ctrl.bind();
        $ctrl.email = $ctrl.modal.scope.email;
    };
    
    $ctrl.$onDestroy = function() {
        $(document).unbind('keydown.' + bindName);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$element',
        '$timeout',
        modalEmployeeAddConfirmationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-employee-add-confirmation.html';
    }
};