let ReimbursementCategoriesDirective = function(
    $scope,
    $filter,
    ModalService,
    PushNotificationsService,
    ReimbursementCategoryService
) {
    let $dir = $scope.$dir = {};

    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_reimbursement_category.${key}`);

    $dir.filters = {
        per_page: 15,
    };

    $dir.onPageChange = (query = {}) => {
        ReimbursementCategoryService.index(
            $dir.organization.id,
            query,
        ).then((res) => $dir.reimbursementCategories = res.data);
    };

    $dir.editReimbursementCategory = (reimbursementCategory = null) => {
        ModalService.open('editReimbursementCategory', {
            organization: $dir.organization,
            reimbursementCategory: reimbursementCategory,
            onChange: () => $dir.onPageChange($dir.filters),
        });
    };

    $dir.deleteReimbursementCategory = (reimbursementCategory) => {
        ModalService.open('dangerZone', {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            text_align: 'center',
            onConfirm: () => {
                ReimbursementCategoryService.destroy(
                    $dir.organization.id,
                    reimbursementCategory.id,
                ).then(() => {
                    PushNotificationsService.success('Opgeslagen!');
                    $dir.onPageChange();
                }, (res) => PushNotificationsService.danger('Error!', res?.data?.message));
            },
        });
    };

    $scope.init = () => {
        $dir.organization = $scope.organization;

        $dir.onPageChange($dir.filters);
    };

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            organization: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'ModalService',
            'PushNotificationsService',
            'ReimbursementCategoryService',
            ReimbursementCategoriesDirective
        ],
        templateUrl: 'assets/tpl/directives/reimbursement-categories-edit.html'
    };
};