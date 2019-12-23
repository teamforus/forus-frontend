let RecordService = function(
    ApiRequest
) {
    return new(function() {
        this.list = function() {
            return ApiRequest.get('/identity/records');
        };

        this.store = function(values) {
            return ApiRequest.post('/identity/records', values);
        };

        this.storeValidate = function(values) {
            return ApiRequest.post('/identity/records/validate', values);
        };

        this.update = function(id, values) {
            return ApiRequest.patch('/identity/records/' + id, values);
        };

        this.read = function(id) {
            return ApiRequest.get('/identity/records/' + id);
        }
    });
};

module.exports = [
    'ApiRequest',
    RecordService
];