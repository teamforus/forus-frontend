const TransactionBulksExportService = function(
    appConfigs,
    FileService,
    ModalService,
    TransactionBulkService,
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

        const saveExportedTransactions = (data, organization_id, res) => {
            PushNotificationsService.success('Success!', 'The downloading should start shortly.');

            const fileName = [
                appConfigs.panel_type,
                organization_id,
                moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.data_format
            ].join('_');

            FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
            PageLoadingBarService.setProgress(100);
        };

        const exportTransactionBulks = (organization_id, filters = {}) => {
            const onSuccess = (data) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                PageLoadingBarService.setProgress(0);
                console.info('- data loaded from the api.');

                TransactionBulkService.export(appConfigs.panel_type, organization_id, queryFilters).then((res) => {
                    saveExportedTransactions(data, organization_id, res);
                }, (res) => {
                    PushNotificationsService.danger('Error!', res.data.message);
                    PageLoadingBarService.setProgress(100);
                });
            }

            TransactionBulkService.exportFields(appConfigs.panel_type, organization_id).then((res) => {
                ModalService.open('exportDataSelect', {
                    fields: res.data,
                    sections: makeSections(res.data.data),
                    success: onSuccess
                });
            });
        };

        this.export = exportTransactionBulks;
    });
};

module.exports = [
    'appConfigs',
    'FileService',
    'ModalService',
    'TransactionBulkService',
    'PageLoadingBarService',
    'PushNotificationsService',
    TransactionBulksExportService
];
