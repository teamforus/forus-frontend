const ProductReservationsExportService = function(
    appConfigs,
    FileService,
    ModalService,
    ProductReservationService,
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

        const saveExportedReservations = (data, organization_id, res) => {
            PushNotificationsService.success('Succes!', 'De download begint over enkele ogenblikken.');

            const fileName = [
                appConfigs.panel_type,
                organization_id,
                moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.data_format
            ].join('_');

            FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
            PageLoadingBarService.setProgress(100);
        };

        const exportReservations = (organization_id, filters = {}) => {
            const onSuccess = (data) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                PageLoadingBarService.setProgress(0);
                console.info('- data loaded from the api.');

                ProductReservationService.export(organization_id, queryFilters).then((res) => {
                    saveExportedReservations(data, organization_id, res);
                }, (res) => {
                    PushNotificationsService.danger('Er is iets fout gegaan.!', res.data.message);
                    PageLoadingBarService.setProgress(100);
                });
            }

            ProductReservationService.exportFields(organization_id).then((res) => {
                ModalService.open('exportDataSelect', {
                    fields: res.data,
                    sections: makeSections(res.data.data),
                    success: onSuccess
                });
            });
        };

        this.export = exportReservations;
    });
};

module.exports = [
    'appConfigs',
    'FileService',
    'ModalService',
    'ProductReservationService',
    'PageLoadingBarService',
    'PushNotificationsService',
    ProductReservationsExportService
];
