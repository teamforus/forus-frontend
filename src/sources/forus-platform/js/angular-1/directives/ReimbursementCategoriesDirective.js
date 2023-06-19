const ReimbursementCategoriesDirective = function (
    $scope,
    $filter,
    ModalService,
    PushNotificationsService,
    ReimbursementCategoryService
) {
    const $dir = $scope.$dir = {};

    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_reimbursement_category.${key}`);

    $dir.filters = {
        per_page: $scope.compact ? 10 : 15,
    };

    $dir.onPageChange = (query = {}) => {
        ReimbursementCategoryService.index(
            $dir.organization.id,
            query,
        ).then((res) => $dir.reimbursementCategories = res.data);
    };

    $dir.editReimbursementCategory = (reimbursementCategory = null) => {
        if (typeof $dir.onEdit == 'function') {
            $dir.onEdit();
        }

        ModalService.open('editReimbursementCategory', {
            organization: $dir.organization,
            reimbursementCategory: reimbursementCategory,
            onChange: () => $dir.onPageChange($dir.filters),
        }, {
            onClose: () => $dir.onEditDone ? $dir.onEditDone() : null
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
        $dir.compact = $scope.compact;
        $dir.organization = $scope.organization;

        $dir.onEdit = $scope.onEdit;
        $dir.register = $scope.register;
        $dir.onEditDone = $scope.onEditDone;

        $dir.onPageChange($dir.filters);

        if ($dir.register) {
            $dir.register({ '$dir': $dir });
        }
    };

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            compact: '=',
            organization: '=',
            onEdit: '&',
            register: '&',
            onEditDone: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'ModalService',
            'PushNotificationsService',
            'ReimbursementCategoryService',
            ReimbursementCategoriesDirective,
        ],
        templateUrl: 'assets/tpl/directives/reimbursement-categories.html',
    };
};