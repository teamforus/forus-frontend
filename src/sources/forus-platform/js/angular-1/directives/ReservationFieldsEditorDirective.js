const uniq = require('lodash/uniq');

const ReservationFieldsEditorDirective = function(
    $q,
    $scope,
    $filter,
    FaqService,
    ModalService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_reservation_field.' + key);

    $dir.infoBlocks = [];
    $dir.types = [{
        key: 'text',
        name: 'Text'
    }, {
        key: 'number',
        name: 'Number'
    }];

    $dir.collapsed = false;
    
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

        $dir.infoBlocks[$dir.fields.length - 1] = {
            label: false,
            type: false,
            description: false,
        };
    };

    $dir.removeField = (index) => {
        $dir.askConfirmation(() => {
            $dir.fields.splice(index, 1);
            $dir.infoBlocks.splice(index, 1);
        });
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

    const fillInfoFlags = () => {
        $dir.fields.forEach((el, index) => {
            $dir.infoBlocks[index] = {
                label: false,
                type: false,
                description: false,
            };
        })
    }

    $dir.$onInit = function() {
        fillInfoFlags();
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
            '$q',
            '$scope',
            '$filter',
            'FaqService',
            'ModalService',
            ReservationFieldsEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/reservation-fields-editor.html',
    };
};