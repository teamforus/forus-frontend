const CmsFundsDirective = function(
    $sce,
    $scope,
) {
    const $dir = $scope.$dir;

    $dir.$onInit = () => {
        $dir.content_html = $sce.trustAsHtml($dir.page.content_html || '');
        $dir.content_alignment = $dir.page.content_alignment || 'left';

        $dir.blocks = $dir.page.blocks.map((block) => ({
            ...block, description_html: $sce.trustAsHtml(block.description_html || ''),
        })) || [];
    };
};

module.exports = () => {
    return {
        scope: {
            page: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        controller: [
            '$sce',
            '$scope',
            CmsFundsDirective
        ],
        templateUrl: 'assets/tpl/directives/cms-blocks.html',
    };
};