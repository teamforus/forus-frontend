const VoucherExportService = function(
    $q,
    $filter,
    FileService,
    ModalService,
    VoucherService,
    PageLoadingBarService,
    ImageConvertorService,
    PushNotificationsService
) {
    return new (function() {
        const { base64ToBlob, downloadFile } = FileService;

        const $translate = $filter('translate');
        const $translateTitle = (key) => $translate(`modals.modal_export_data.labels.${key}`);
        const $translateField = (key) => $translate(`modals.modal_export_data.modal_section.${key}`);

        const dataFormats = [
            { value: 'csv', label: $translateField('export_type_csv'), icon: 'file-delimited-outline' },
            { value: 'xls', label: $translateField('export_type_xls'), icon: 'file-excel-outline' },
            { value: 'all', label: $translateField('export_type_all'), icon: 'file-outline' },
        ];

        const qrFormats = [
            { value: 'null', label: $translateField('export_type_none'), icon: 'cancel' },
            { value: 'pdf', label: $translateField('export_type_pdf'), icon: 'file-pdf-box' },
            { value: 'png', label: $translateField('export_type_png'), icon: 'image-outline' },
        ];

        const makeSections = (fields) => ([
            { type: "radio", key: "data_format", fields: dataFormats, value: "csv", title: $translateTitle('data_formats') },
            { type: "checkbox", key: "fields", fields, fieldsPerRow: 3, selectAll: true, title: $translateTitle('fields') },
            { type: "radio", key: "qr_format", fields: qrFormats, value: "null", title: $translateTitle('qr_formats') }
        ]);

        const exportVouchers = (organization_id, filters = {}, type = 'budget') => {
            VoucherService.exportFields(organization_id, { type }).then((res) => {
                ModalService.open('exportDataSelect', {
                    fields: res.data,
                    sections: makeSections(res.data.data),
                    success: onSuccess
                });
            });

            const onSuccess = (data) => {
                const { qr_format, data_format, fields } = data;
                const queryFilters = {
                    ...filters,
                    ...{ data_format, fields },
                    ...{ qr_format: qr_format == 'png' ? 'data' : qr_format },
                };

                PageLoadingBarService.setProgress(0);
                console.info('- data loaded from the api.');

                VoucherService.export(organization_id, queryFilters).then((res) => {
                    saveExportedVouchers(res.data, qr_format).then((error) => {
                        if (error) {
                            return PushNotificationsService.danger('Error!', error);
                        }

                        PushNotificationsService.success('Succes!', 'De download begint over enkele ogenblikken.');
                    }, console.error).finally(() => PageLoadingBarService.setProgress(100));
                }, (res) => {
                    PushNotificationsService.danger('Error!', res.data.message);
                    PageLoadingBarService.setProgress(100);
                });
            }
        };

        const fileTypes = {
            xls: 'application/vnd.ms-excel',
            csv: 'text/csv',
            zip: 'application/zip',
        };

        const saveExportedVouchers = (res, qrFormat) => {
            return $q((resolve) => {
                const data = res.data;
                const zipName = 'vouchers_' + moment().format('YYYY-MM-DD HH:mm:ss') + '.zip';

                const files = Object.keys(res.files).reduce((files, fileKey) => {
                    return { ...files, [fileKey]: base64ToBlob(res.files[fileKey], fileTypes[fileKey]) };
                }, {});

                if (!qrFormat || qrFormat === 'pdf') {
                    return resolve(false) & downloadFile(zipName, files.zip, fileTypes.zip);
                }

                JSZip.loadAsync(files.zip).then(function(zip) {
                    const imgDirectory = data.length > 0 ? zip.folder("images") : null;

                    const promises = data.map(async (voucherData, index) => {
                        console.info('- making qr file ' + (index + 1) + ' from ' + data.length + '.');

                        const imageData = await ImageConvertorService.makeQrImage(voucherData.value);
                        const imageDataValue = imageData.slice('data:image/png;base64,'.length);

                        return { ...voucherData, data: imageDataValue };
                    });

                    Promise.all(promises).then((data) => {
                        console.info('- inserting images into .zip archive.');

                        data.forEach((img) => imgDirectory.file(img.name + ".png", img.data, { base64: true }));
                        PageLoadingBarService.setProgress(80);

                        zip.generateAsync({ type: "blob" }).then(function(content) {
                            console.info('- downloading .zip file.');

                            downloadFile(zipName, content);
                            resolve(false);
                        }, () => resolve("Failed to generate blob .zip file."));
                    }, () => resolve("Failed to build the qr-code .png file."));
                }, () => resolve("Failed to open the .zip file."));
            });
        };

        this.exportVouchers = exportVouchers;
    });
};

module.exports = [
    '$q',
    '$filter',
    'FileService',
    'ModalService',
    'VoucherService',
    'PageLoadingBarService',
    'ImageConvertorService',
    'PushNotificationsService',
    VoucherExportService
];
