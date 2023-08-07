const uniq = require('lodash/uniq');

const ReservationFieldsEditorDirective = function(
    $scope,
    $filter,
    ModalService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_reservation_field.' + key);

    $dir.types = [{
        key: 'text',
        name: 'Tekst'
    }, {
        key: 'number',
        name: 'Nummer'
    }];

    $dir.collapsed = false;
    $dir.infoBlocks = {};
    
    $dir.sortable = {
        sort: true,
        animation: 150,
        handle: '.question-drag',
    };

    $dir.askConfirmation = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            text_align: "center",
            onConfirm,
        });
    };

    $dir.addField = () => {
        $dir.fields.push({
            type: 'text',
            label: '',
            required: false,
            collapsed: true,
            description: '',
        });
    };

    $dir.removeField = (index) => {
        $dir.askConfirmation(() => $dir.fields.splice(index, 1));
    };

    $dir.expandById = (index) => {
        const list = Array.isArray(index) ? index : [index];

        for (let i = 0; i < list.length; i++) {
            $dir.fields[list[i]].collapsed = true;
        }
    }

    const expandErrors = () => {
        if ($dir.errors && typeof $dir.errors == 'object') {
            $dir.expandById(uniq(Object.keys($dir.errors).map((error) => {
                return error.split('.')[1] || null;
            })).filter((rowIndex) => !isNaN(parseInt(rowIndex))));
        }
    }

    $dir.$onInit = function() {
        $scope.$watch('$dir.errors', expandErrors);
    };
};

module.exports = () => {
    return {
        scope: {
            fields: '=',
            errors: '=',
            organization: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'ModalService',
            ReservationFieldsEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/reservation-fields-editor.html',
    };
};
