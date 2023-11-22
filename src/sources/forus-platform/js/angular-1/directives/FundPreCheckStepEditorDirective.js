const FundPreCheckStepEditorDirective = function (
    $scope,
    $filter,
    ModalService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_implementation_block.' + key);

    $dir.collapsed = false;

    const updatePreChecksData = (eventData) => {
        let sourcePreCheck = $dir.preChecks.find((preCheck) => preCheck.id == eventData.model.pre_check_id);

        // remove the source record
        sourcePreCheck.pre_check_records = sourcePreCheck.pre_check_records.filter((record) => {
            return record.record_type.key != eventData.model.record_type.key;
        });

        // update pre-check indexes in pre-check records
        $dir.preChecks = $dir.preChecks.map(preCheck => ({
            ...preCheck,
            pre_check_records: preCheck.pre_check_records.map(record => ({ ...record, pre_check_id: preCheck.id }))
        }));
    }
    
    $dir.sortablePreCheck = {
        group: {
            name: 'pre-check',
            put: false,
        },
        sort: true,
		animation: 150,
		swapThreshold: 0.65,
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
        draggable: '.block-record-item',
        onEnd: function (evt)
        {
            updatePreChecksData(evt);
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
            collapsed: true,
            description: '',
            pre_check_records: [],
        });
    };

    $dir.addRecord = (preCheckIndex) => {
        $dir.preChecks.at(preCheckIndex).pre_check_records.push({
            label: '',
            title: '',
            collapsed: true,
            description: '',
        });
    };

    $dir.removePreCheck = (preCheckIndex) => {
        $dir.askConfirmation(() => $dir.preChecks.splice(preCheckIndex, 1));
    };

    $dir.expendByIndex = (index) => {
        const list = Array.isArray(index) ? index : [index];

        for (let i = 0; i < list.length; i++) {
            $dir.preChecks[list[i]].collapsed = true;
        }
    };

    $dir.$onInit = function () {
        $dir.registerParent({ childRef: $dir });
    };
};

module.exports = () => {
    return {
        scope: {
            preChecks: '=',
            errors: '=',
            implementation: '=',
            registerParent: '&',
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