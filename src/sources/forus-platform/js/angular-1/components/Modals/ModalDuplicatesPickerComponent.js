let ModalDuplicatesPickerComponent = function(
    $timeout
) {
    let $ctrl = this;

    $ctrl.blink = (item) => {
        item.blink = true;

        $timeout(() => {
            $ctrl.items = $ctrl.updateLabels($ctrl.items);
            item.blink = false
        }, 350);
    };

    $ctrl.toggleAllOff = () => {
        $ctrl.items.forEach(item => {
            if (item.model) {
                item.model = false;
                $ctrl.blink(item);
            }
        });
    };

    $ctrl.toggleAllOn = () => {
        $ctrl.items.forEach(item => {
            if (!item.model) {
                item.model = true;
                $ctrl.blink(item);
            }
        });
    };

    $ctrl.confirm = () => {
        $ctrl.onConfirm($ctrl.items);
        $ctrl.close();
    };

    $ctrl.cancel = () => {
        $ctrl.onCancel($ctrl.items);
        $ctrl.close();
    };

    $ctrl.updateLabels = (items) => {
        items.forEach(item => {
            item.label = item.model ? item.label_on : item.label_off;
        });

        return items;
    };

    $ctrl.$onInit = () => {
        $ctrl.onConfirm = $ctrl.modal.scope.onConfirm || (() => {});
        $ctrl.onCancel = $ctrl.modal.scope.onCancel || (() => {});

        $ctrl.hero_icon = $ctrl.modal.scope.hero_icon || 'alert-outline';
        $ctrl.hero_title = $ctrl.modal.scope.hero_title || '';
        $ctrl.hero_subtitle = $ctrl.modal.scope.hero_subtitle || '';

        $ctrl.items = $ctrl.updateLabels(
            JSON.parse(JSON.stringify($ctrl.modal.scope.items))
        );
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        ModalDuplicatesPickerComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-duplicates-picker.html';
    }
};