const CmsFundsDirective = function(
    $sce,
    $scope,
) {
    const $dir = $scope.$dir;

    $dir.$onInit = () => {
        $dir.description_html = $sce.trustAsHtml($dir.page.description_html || '');
        $dir.description_alignment = $dir.page.description_alignment || 'left';

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