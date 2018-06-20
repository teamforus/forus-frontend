module.exports = ['$q', 'ApiRequest', function($q, ApiRequest) {
    return new (function() {
        this.store = function(message) {
            return ApiRequest.post('/messages', message);
        };

        this.list = function() {
            return ApiRequest.get('/messages');
        };
    })();
}];