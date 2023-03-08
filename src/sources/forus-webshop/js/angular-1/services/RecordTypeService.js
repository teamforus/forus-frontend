const RecordTypeService = function(ApiRequest) {
    return new(function() {
        this.list = (filters = {}) => {
            return ApiRequest.get('/identity/record-types', filters);
        };
    });
};

module.exports = [
    'ApiRequest', 
    RecordTypeService,
];