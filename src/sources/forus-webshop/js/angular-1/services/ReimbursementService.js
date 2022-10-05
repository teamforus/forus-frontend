const ReimbursementService = function (
    $q,
    ApiRequest,
    ModalService,
    PushNotificationsService,
) {
    const uriPrefix = '/platform/reimbursements';

    return new (function () {
        this.list = (data = {}) => {
            return ApiRequest.get(`${uriPrefix}`, data);
        };

        this.read = (id, data = {}) => {
            return ApiRequest.get(`${uriPrefix}/${id}`, data);
        };

        this.store = (data = {}) => {
            return ApiRequest.post(`${uriPrefix}`, data);
        };

        this.update = (id, data = {}) => {
            return ApiRequest.patch(`${uriPrefix}/${id}`, data);
        };

        this.destroy = (id, data = {}) => {
            return ApiRequest.delete(`${uriPrefix}/${id}`, data);
        };

        this.confirmDestroy = (reimbursement) => {
            return $q((resolve) => {
                return ModalService.open('modalNotification', {
                    type: 'confirm',
                    title: 'Are you sure?',
                    description: 'You are about to remove you reimbursement request, are you sure?',
                    confirmBtnText: 'Sluiten',
                    confirm: () => {
                        this.destroy(reimbursement.id).then(() => {
                            PushNotificationsService.success('Declaratie geannuleerd.');
                            resolve(true);
                        }, (res) => {
                            PushNotificationsService.danger('Error.', res.data.message);
                            resolve(false);
                        });
                    },
                });
            });
        };
    });
};

module.exports = [
    '$q',
    'ApiRequest',
    'ModalService',
    'PushNotificationsService',
    ReimbursementService
];