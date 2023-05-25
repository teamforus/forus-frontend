const OpenModalContactFormDirective = function (
    $scope,
    $element,
    ModalService
) {
    const $dir = $scope.$dir;

    $element.bind('click', (e) => {
        e?.preventDefault();
        ModalService.open('websiteContactForm');
    });

    $dir.$onInit = () => {};
};

module.exports = () => {
    return {
        scope: {},
        bindToController: true,
        controllerAs: '$dir',
        restrict: "AE",
        controller: [
            '$scope',
            '$element',
            'ModalService',
            OpenModalContactFormDirective
        ],
    };
};