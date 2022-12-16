const uniq = require('lodash/uniq');

const ImplementationBlocksEditorDirective = function (
    $q,
    $scope,
    $filter,
    MediaService,
    ModalService,
    PushNotificationsService,
    ImplementationPageService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_implementation_block.' + key);
    const $translateImplementationBlockEditor = (key) => $translate('components.implementation_block_editor.' + key);

    $dir.blockMedia;
    $dir.resetMedia = false;
    $dir.collapsed = false;

    $dir.buttonTargets = [{
        value: false,
        name: 'Hetzelfde tabblad',
    }, {
        value: true,
        name: 'Nieuw tabblad',
    }];

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

    $dir.addBlock = () => {
        $dir.blocks.push({
            label: '',
            title: '',
            collapsed: true,
            description: '',
            button_text: '',
            button_link: '',
            button_enabled: false,
            button_target_blank: true,
        });
    };

    $dir.removeBlock = (blockIndex) => {
        $dir.askConfirmation(() => $dir.blocks.splice(blockIndex, 1));
    };

    $dir.selectBlockImage = (mediaFile, blockIndex) => {
        MediaService.store('implementation_block_media', mediaFile, ['thumbnail', 'public', 'large']).then((res) => {
            $dir.blockMedia = res.data.data;
            $dir.blocks[blockIndex].media_uid = $dir.blockMedia.uid;
            $dir.resetMedia = false;
        }, (res) => {
            PushNotificationsService.danger('Error!', res.data.message);
        });
    };

    $dir.resetBlockImage = () => {
        $dir.resetMedia = true;
        $dir.blockMedia = null;
    };

    $dir.expendByIndex = (index) => {
        const list = Array.isArray(index) ? index : [index];

        for (let i = 0; i < list.length; i++) {
            $dir.blocks[list[i]].collapsed = true;
        }
    };

    $dir.validate = () => {
        const data = { blocks: $dir.blocks };
        const { id, organization_id } = $dir.implementation;

        return $q((resolve, reject) => {
            ImplementationPageService.validateBlocks(organization_id, id, data).then(
                (res) => resolve(res.data),
                (res) => {
                    const { data, status } = res;
                    const { errors, message, } = data;

                    if (errors && typeof errors == 'object') {
                        $dir.errors = errors;

                        $dir.expendByIndex(uniq(Object.keys($dir.errors).map((error) => {
                            return error.split('.')[1] || null;
                        })).filter((rowIndex) => !isNaN(parseInt(rowIndex))));
                    }

                    reject(status == 422 ? $translateImplementationBlockEditor('fix_validation_errors') : message);
                },
            );
        });
    };

    $dir.$onInit = function () {
        $dir.registerParent({ childRef: $dir });
    };
};

module.exports = () => {
    return {
        scope: {
            blocks: '=',
            implementation: '=',
            registerParent: '&',
        },
        restrict: "EA",
        replace: true,
        bindToController: true,
        controllerAs: '$dir',
        controller: [
            '$q',
            '$scope',
            '$filter',
            'MediaService',
            'ModalService',
            'PushNotificationsService',
            'ImplementationPageService',
            ImplementationBlocksEditorDirective,
        ],
        templateUrl: 'assets/tpl/directives/implementation-blocks-editor.html',
    };
};