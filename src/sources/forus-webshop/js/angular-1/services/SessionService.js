let SessionsService = function (ApiRequest) {
    let uriPrefix = '/identity/sessions';

    return new (function () {
        this.list = (data = {}) => {
            return ApiRequest.get(`${uriPrefix}`, data);
        };

        this.read = (uid) => {
            return ApiRequest.get(`${uriPrefix}/${uid}`);
        };

        this.terminate = (uid) => {
            return ApiRequest.patch(`${uriPrefix}/${uid}/terminate`);
        };

        this.terminateAll = () => {
            return ApiRequest.patch(`${uriPrefix}/terminate`);
        };
    })
}

module.exports = [
    'ApiRequest',
    SessionsService
];
