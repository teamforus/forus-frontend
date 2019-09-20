let FileService = function(ApiRequest) {
    return new (function() {
        let uriPrefix = '/files';

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

        this.download = function(file) {
            return ApiRequest.get(uriPrefix + '/' + file.uid + '/download', {}, {}, true, (params) => {
                params.responseType = 'blob';
                return params;
            });
        };

        this.downloadUrl = function(file) {
            return ApiRequest.endpointToUrl(uriPrefix + '/' + file.uid + '/download');
        };
    });
};

module.exports = [
    'ApiRequest',
    FileService
];