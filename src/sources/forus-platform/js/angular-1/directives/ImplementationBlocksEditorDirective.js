const uniq = require('lodash/uniq');

const ImplementationBlocksEditorDirective = function(
    $q,
    $scope,
    $filter,
    MediaService,
    ModalService,
    ImplementationService,
    PushNotificationsService
) {
    const $dir = $scope.$dir = {};
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_implementation_block.' + key);
    const $translateImplementationBlockEditor = (key) => $translate('components.implementation_block_editor.' + key);

    $dir.blockMedia;
    $dir.resetMedia = false;

    $dir.collapsed = false;

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
            description: '',
            button_text: '',
            button_link: null,
            collapsed: true,
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

    $dir.expendById = (index) => {
        const list = Array.isArray(index) ? index : [index];

        for (let i = 0; i < list.length; i++) {
            $dir.blocks[list[i]].collapsed = true;
        }
    };

    $dir.validate = () => {
        return $q((resolve, reject) => {
            ImplementationService.blocksValidate($scope.organization.id, { blocks: $dir.blocks }).then(
                (res) => resolve(res.data),
                (res) => {
                    const { data, status } = res;
                    const { errors, message, } = data;

                    if (errors && typeof errors == 'object') {
                        $dir.errors = errors;

                        $dir.expendById(uniq(Object.keys($dir.errors).map((error) => {
                            return error.split('.')[1] || null;
                        })).filter((rowIndex) => !isNaN(parseInt(rowIndex))));
                    }

                    reject(status == 422 ? $translateImplementationBlockEditor('fix_validation_errors') : message);
                },
            );
        });
    };

    $dir.init = function() {
        $scope.blocks = $scope.blocks.map(block => {
            return {...block, ...{ button_enabled: block.button_enabled ? true : false }};
        });
        $dir.blocks = $scope.blocks || [];
        $dir.organization = $scope.organization;

        $scope.registerParent({ childRef: $dir });
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            blocks: '=',
            organization: '=',
            registerParent: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$filter',
            'MediaService',
            'ModalService',
            'ImplementationService',
            'PushNotificationsService',
            ImplementationBlocksEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/implementation-block.html'
    };
};