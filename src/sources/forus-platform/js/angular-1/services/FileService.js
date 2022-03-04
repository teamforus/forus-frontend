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
            const blob = file_data instanceof Blob ? file_data : new Blob([file_data], {
                type: file_type,
            });

            if (typeof window.navigator != 'undefined' &&
                typeof window.navigator.msSaveBlob == 'function') {
                window.navigator.msSaveBlob(blob, file_name);
            } else {
                window.saveAs(blob, file_name);
            }
        };

        this.base64ToBlob = (b64Data, contentType = '', sliceSize = 512) => {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);
                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                byteArrays.push(new Uint8Array(byteNumbers));
            }

            return new Blob(byteArrays, { type: contentType });
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

        this.store = function(file) {
            var formData = new FormData();

            formData.append('file', file);

            return ApiRequest.post(uriPrefix, formData, {
                'Content-Type': undefined
            });
        };

        this.storeValidate = function(file) {
            var formData = new FormData();

            formData.append('file', file);

            return ApiRequest.post(uriPrefix + '/validate', formData, {
                'Content-Type': undefined
            });
        };

        this.storeAll = function(files) {
            return $q.all(files.map(this.store));
        };

        this.storeValidateAll = function(files) {
            return $q.all(files.map(this.storeValidate));
        };
    });
};

module.exports = [
    '$q',
    'ApiRequest',
    FileService
];