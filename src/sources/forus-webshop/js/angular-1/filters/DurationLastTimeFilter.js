module.exports = ['$filter', function($filter) {
    return function(duration) {
        let _filter = $filter('duration');
        
        if (duration === null) {
            return '';
        }

        return duration <= 100 ? 'Just now' : _filter(duration) + ' ago';
    }
}];