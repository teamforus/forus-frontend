let FileService = function (
    $q,
    ApiRequest,
) {
    let uriPrefix = '/files';

    return new (function () {
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

        this.download = function (file) {
            return ApiRequest.get(uriPrefix + '/' + file.uid + '/download', {}, {}, true, (params) => {
                params.responseType = 'blob';
                return params;
            });
        };

        this.downloadUrl = function (file) {
            return ApiRequest.endpointToUrl(uriPrefix + '/' + file.uid + '/download');
        };

        this.store = function (file, type, onProgress, subscriber = {}) {
            const append = [['file', file], ['type', type]];

            return this.storeData(append, onProgress, subscriber);
        };

        this.storeData = function (append = [], onProgress, subscriber = {}) {
            const formData = new FormData();
            const canceller = $q.defer();

            subscriber.cancel = canceller.resolve;
            append.forEach((item) => formData.append(item[0], item[1]));

            return ApiRequest.post(uriPrefix, formData, {}, true, (cfg) => ({
                ...cfg,
                ...{
                    headers: { ...cfg.headers, ...{ 'Content-Type': undefined } },
                    timeout: canceller.promise,
                    uploadEventHandlers: {
                        progress: (e) => onProgress({
                            ...e,
                            ...{ progress: e.loaded * 100 / e.total }
                        })
                    }
                }
            }));
        };

        this.storeAll = function (files, type) {
            return $q.all(files.map(file => this.store(file, type)));
        };
    });
};

module.exports = [
    '$q',
    'ApiRequest',
    FileService
];