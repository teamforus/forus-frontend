module.exports = [
    'hofApiRequest',
    function(
        hofApiRequest
    ) {
        let apiPrefix = '/hall-of-fame';
        return new(function() {
            this.get = function() {
                return hofApiRequest.get(apiPrefix + '/');
            }
        });
    }
];