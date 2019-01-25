let FileService = function(ApiRequest) {
    let FileSaver = require('file-saver');

    return new (function() {
        this.downloadFile = (
            file_name,
            file_data,
            file_type = 'text/csv;charset=utf-8;'
        ) => {
            var blob = new Blob([file_data], {
                type: file_type,
            });

            FileSaver.saveAs(blob, file_name);
        };
    });
};

module.exports = [
    'ApiRequest',
    FileService
];