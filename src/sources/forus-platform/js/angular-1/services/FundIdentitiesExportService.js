const FundIdentitiesExportService = function (
    appConfigs,
    FileService,
    FundService,
    ModalService,
    PageLoadingBarService,
    PushNotificationsService
) {
    return new (function () {
        const dataFormats = [
            { value: 'csv', label: 'Exporteren CSV', icon: 'file-delimited-outline' },
            { value: 'xls', label: 'Exporteren XLS', icon: 'file-excel-outline' },
        ];

        const makeSections = (fields) => ([
            { type: "radio", key: "data_format", fields: dataFormats, value: "csv", title: 'Kies bestandsformaat' },
            { type: "checkbox", key: "fields", fields, fieldsPerRow: 3, selectAll: true, title: 'Kies inbegrepen velden' },
        ]);

        const saveExportedTransactions = (data, organization_id, fund_id, res) => {
            PushNotificationsService.success('Success!', 'The downloading should start shortly.');

            const date = moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.data_format;
            const fileName = [appConfigs.panel_type, organization_id, fund_id, date].join('_');

            FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
            PageLoadingBarService.setProgress(100);
        };

        this.export = (organization_id, fund_id, filters = {}) => {
            const onSuccess = (data) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                PageLoadingBarService.setProgress(0);
                console.info('- data loaded from the api.');

                FundService.exportIdentities(organization_id, fund_id, queryFilters).then((res) => {
                    saveExportedTransactions(data, organization_id, fund_id, res);
                }, (res) => {
                    PushNotificationsService.danger('Error!', res.data.message);
                    PageLoadingBarService.setProgress(100);
                });
            }

            FundService.exportIdentityFields(organization_id, fund_id).then((res) => {
                ModalService.open('exportDataSelect', {
                    fields: res.data,
                    sections: makeSections(res.data.data),
                    success: onSuccess
                });
            });
        };
    });
};

module.exports = [
    'appConfigs',
    'FileService',
    'FundService',
    'ModalService',
    'PageLoadingBarService',
    'PushNotificationsService',
    FundIdentitiesExportService
];
