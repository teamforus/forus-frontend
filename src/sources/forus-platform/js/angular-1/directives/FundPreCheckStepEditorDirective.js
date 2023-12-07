const FundPreCheckStepEditorDirective = function (
    $scope,
    $filter,
    ModalService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_implementation_block.${key}`);

    $dir.sortablePreCheck = {
        group: {
            name: 'pre-check',
            put: false,
        },
        sort: true,
        animation: 150,
        swapThreshold: 0.65,
        handle: '.pre-check-item-header-drag',
    };

    $dir.sortablePreCheckRecord = {
        group: {
            name: 'pre-check-record',
            pull: 'clone',
        },
        sort: true,
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        draggable: '.pre-check-item-record',
        handle: '.pre-check-item-header-drag',
        onEnd: (eventData) => {
            const isMoved = eventData.originalEvent.from !== eventData.originalEvent.to;
            const fromPreCheck = $dir.preChecks.find((item) => {
                return eventData.model.pre_check_id === null ? item.default : item.id === eventData.model.pre_check_id;
            });
    
            if (isMoved) {
                fromPreCheck.record_types = fromPreCheck.record_types.filter((record_type) => {
                    return record_type.record_type_key != eventData.model.record_type_key;
                })
    
                $dir.preChecks = $dir.preChecks.map(preCheck => ({
                    ...preCheck,
                    record_types: preCheck.record_types.map(record => ({ ...record, pre_check_id: preCheck.id }))
                }));
            }
        },
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

    $dir.addPreCheck = () => {
        $dir.preChecks.push({
            label: '',
            title: '',
            uncollapsed: true,
            description: '',
            record_types: [],
        });
    };

    $dir.removePreCheck = (preCheckIndex) => {
        $dir.askConfirmation(() => $dir.preChecks.splice(preCheckIndex, 1));
    };

    $dir.expendByIndex = (index) => {
        const list = Array.isArray(index) ? index : [index];

        for (let i = 0; i < list.length; i++) {
            $dir.preChecks[list[i]].uncollapsed = true;
        }
    };
};

module.exports = () => {
    return {
        scope: {
            preChecks: '=',
            errors: '=',
            implementation: '=',
        },
        restrict: "EA",
        replace: true,
        bindToController: true,
        controllerAs: '$dir',
        controller: [
            '$scope',
            '$filter',
            'ModalService',
            FundPreCheckStepEditorDirective,
        ],
        templateUrl: 'assets/tpl/directives/fund-pre-check-step-editor.html',
    };
};