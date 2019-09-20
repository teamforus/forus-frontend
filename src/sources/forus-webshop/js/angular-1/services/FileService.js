let FileService = function(
    $q,
    ApiRequest,
) {
    let uriPrefix = '/files';

    return new (function() {
        this.downloadFile = (
            file_name,
            file_data,
            file_type = 'text/csv;charset=utf-8;'
        ) => {
            var blob = new Blob([file_data], {
                type: file_type,
            });

            window.saveAs(blob, file_name);
        };

        this.store = function(file) {
            var formData = new FormData();

            formData.append('file', file);

            return ApiRequest.post(uriPrefix, formData, {
                'Content-Type': undefined
            });
        };

        this.storeAll = function(files) {
            return $q.all(files.map(this.store));
        };
    });
};

module.exports = [
    '$q',
    'ApiRequest',
    FileService
];