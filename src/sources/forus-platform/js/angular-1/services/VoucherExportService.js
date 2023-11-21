const VoucherExportService = function (
    $q,
    $filter,
    FileService,
    ModalService,
    VoucherService,
    PageLoadingBarService,
    ImageConvertorService,
    PushNotificationsService
) {
    return new (function () {
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

        const makeSections = (fields, record_fields = []) => {
            const sectionFormat = {
                type: "radio",
                key: "data_format",
                fields: dataFormats,
                value: "csv",
                title: $translateTitle('data_formats'),
            };

            const sectionFields = {
                type: "checkbox",
                key: "fields",
                fields,
                fieldsPerRow: 3,
                selectAll: true,
                title: $translateTitle('fields'),
                collapsable: true,
            };

            const sectionRecords = record_fields.length ? {
                type: "checkbox",
                key: "extra_fields",
                fields: record_fields,
                fieldsPerRow: 3,
                selectAll: true,
                title: $translateTitle('record_fields'),
                collapsable: true,
                collapsed: true,
            } : null;

            const sectionQrFormat = {
                type: "radio",
                key: "qr_format",
                fields: qrFormats,
                value: "null",
                title: $translateTitle('qr_formats'),
            };

            return [sectionFormat, sectionFields, sectionRecords, sectionQrFormat].filter((section) => section);
        };

        const exportVouchers = (organization_id, allow_voucher_records = false, filters = {}, type = 'budget') => {
            VoucherService.exportFields(organization_id, { type }).then((res) => {
                const fields = res.data.data.filter(field => !field.is_record_field);
                const extra_fields = allow_voucher_records ? res.data.data.filter(field => field.is_record_field) : [];

                ModalService.open('exportDataSelect', {
                    fields: res.data,
                    sections: makeSections(fields, extra_fields),
                    success: onSuccess
                });
            });

            const onSuccess = (data) => {
                const { qr_format, data_format, fields, extra_fields = [] } = data;
                const queryFilters = {
                    ...filters,
                    ...{ data_format, fields: [...fields, ...extra_fields] },
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
                const date = moment().format('YYYY-MM-DD_HH_mm_ss');
                const zipName = `vouchers_${date}.zip`;

                const files = Object.keys(res.files).reduce((files, fileKey) => {
                    return { ...files, [fileKey]: base64ToBlob(res.files[fileKey], fileTypes[fileKey]) };
                }, {});

                if (!qrFormat || qrFormat === 'pdf') {
                    return resolve(false) & downloadFile(zipName, files.zip, fileTypes.zip);
                }

                JSZip.loadAsync(files.zip).then(function (zip) {
                    const imagesDirName = `Vouchers_export_${date}_QR_codes_images`;
                    const imgDirectory = data.length > 0 ? zip.folder(imagesDirName) : null;

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

                        zip.generateAsync({ type: "blob" }).then(function (content) {
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
