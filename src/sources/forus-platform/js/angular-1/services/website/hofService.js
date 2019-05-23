module.exports = [
    'hofApiRequest',
    function(
        hofApiRequest
    ) {
        let apiPrefix = '/';
        return new(function() {
            this.get = function() {
                return hofApiRequest.get(apiPrefix + '/');
            }
        });
    }
];
