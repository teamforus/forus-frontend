const ImplementationBlocksEditorDirective = function(
    $scope,
    $filter,
    MediaService,
    ModalService,
    PushNotificationsService
) {
    const $dir = $scope.$dir = {};
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate('modals.danger_zone.remove_implementation_block.' + key);

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
        MediaService.store('cms_media', mediaFile, ['thumbnail', 'public']).then((res) => {
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

    $dir.init = function() {
        $dir.blocks = $scope.blocks || [];
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
            '$scope',
            '$filter',
            'MediaService',
            'ModalService',
            'PushNotificationsService',
            ImplementationBlocksEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/implementation-block.html'
    };
};