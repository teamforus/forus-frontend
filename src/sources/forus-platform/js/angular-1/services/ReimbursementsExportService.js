const ReimbursementsExportService = function(
    FileService,
    ModalService,
    ReimbursementService,
    PageLoadingBarService,
    PushNotificationsService
) {
    return new (function() {
        const dataFormats = [
            { value: 'csv', label: 'Exporteren CSV', icon: 'file-delimited-outline' },
            { value: 'xls', label: 'Exporteren XLS', icon: 'file-excel-outline' },
        ];

        const makeSections = (fields) => ([
            { type: "radio", key: "data_format", fields: dataFormats, value: "csv", title: 'Kies bestandsformaat' },
            { type: "checkbox", key: "fields", fields, fieldsPerRow: 3, selectAll: true, title: 'Kies inbegrepen velden' },
        ]);

        const saveExportedReimbursements = (data, organization_id, res) => {
            PushNotificationsService.success('Success!', 'The downloading should start shortly.');

            const fileName = [
                organization_id,
                moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.data_format
            ].join('_');

            FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
            PageLoadingBarService.setProgress(100);
        };

        const exportReimbursements = (organization_id, filters = {}) => {
            const onSuccess = (data) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                PageLoadingBarService.setProgress(0);
                console.info('- data loaded from the api.');

                ReimbursementService.export(organization_id, queryFilters).then((res) => {
                    saveExportedReimbursements(data, organization_id, res);
                }, (res) => {
                    PushNotificationsService.danger('Error!', res.data.message);
                    PageLoadingBarService.setProgress(100);
                });
            }

            ReimbursementService.exportFields(organization_id).then((res) => {
                ModalService.open('exportDataSelect', {
                    fields: res.data,
                    sections: makeSections(res.data.data),
                    success: onSuccess
                });
            });
        };

        this.export = exportReimbursements;
    });
};

module.exports = [
    'FileService',
    'ModalService',
    'ReimbursementService',
    'PageLoadingBarService',
    'PushNotificationsService',
    ReimbursementsExportService
];
