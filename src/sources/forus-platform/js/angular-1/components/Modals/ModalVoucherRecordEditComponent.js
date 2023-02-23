const ModalVoucherRecordEditComponent = function (
    $q,
    RecordTypeService,
    FormBuilderService,
    VoucherRecordService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.buildForm = (record = null) => {
        return FormBuilderService.build(record ? {
            note: record.note,
            value: record.value,
            record_type_key: record?.record_type?.key || null,
        } : {
            note: '',
            value: '',
            record_type_key: $ctrl.record_types[0]?.key || null,
        }, (form) => {
            const { record_type_key, value, note } = form.values;
            const values = { record_type_key, value, note };

            const promise = record == null ?
                VoucherRecordService.store($ctrl.organization.id, $ctrl.voucher.id, values) :
                VoucherRecordService.update($ctrl.organization.id, $ctrl.voucher.id, record.id, values);

            promise.then((res) => {
                $ctrl.closeModal(res.data.data);
                PushNotificationsService.success('Success!', 'Voucher record created!');
            }, (res) => {
                form.errors = res.data?.errors || {};
                PushNotificationsService.danger('Error!', res.data.message);
            }, true).finally(() => form.unlock());
        });
    };

    $ctrl.closeModal = (record) => {
        $ctrl.onClose(record);
        $ctrl.close();
    }

    $ctrl.$onInit = () => {
        const { onClose, organization, voucher, record = null } = $ctrl.modal.scope;

        $ctrl.onClose = onClose;

        $ctrl.record = record;
        $ctrl.voucher = voucher;
        $ctrl.organization = organization;

        $q.all([
            RecordTypeService.list({ vouchers: 1 })
                .then((res) => $ctrl.record_types = res.data),
            VoucherRecordService.index($ctrl.organization.id, $ctrl.voucher.id, { per_page: 100 })
                .then((res) => $ctrl.existingRecordTypes = res.data.data.map((item) => item.record_type.key)),
        ]).then(() => {
            $ctrl.record_types = $ctrl.record ?
                $ctrl.record_types.filter((record_type) => record_type.key == $ctrl.record.record_type.key) :
                $ctrl.record_types.filter((record_type) => !$ctrl.existingRecordTypes.includes(record_type.key));

            if ($ctrl.record_types.length == 0) {
                $ctrl.record_types.push({
                    key: null,
                    name: 'No more record types available',
                });
            }

            $ctrl.form = $ctrl.buildForm(record);
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$q',
        'RecordTypeService',
        'FormBuilderService',
        'VoucherRecordService',
        'PushNotificationsService',
        ModalVoucherRecordEditComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-voucher-record-edit.html',
};
