let MediaService = function(
    ApiRequest,
    appConfigs
) {
    let uriPrefix = '/medias';

    return new(function() {
        this.list = function() {
            return ApiRequest.get(
                uriPrefix
            );
        };

        this.store = function(type, file, sync_presets = null) {
            let formData = new FormData();

            formData.append('file', file, file['name']);
            formData.append('type', type);

            if (Array.isArray(sync_presets)) {
                if (sync_presets.length > 0) {
                    sync_presets.forEach(sync_preset => {
                        formData.append('sync_presets[]', sync_preset);
                    });
                } else {
                    formData.append('sync_presets[]', '');
                }
            }

            return ApiRequest.post(uriPrefix, formData, {
                'Content-Type': undefined
            });
        };

        this.read = function(id) {
            return ApiRequest.get(
                uriPrefix + '/' + id
            );
        };

        this.delete = function(id) {
            return ApiRequest.delete(
                uriPrefix + '/' + id
            );
        };

        this.configByType = (type) => {
            return appConfigs.features.media[type];
        };
    });
};

module.exports = [
    'ApiRequest',
    'appConfigs',
    MediaService
];