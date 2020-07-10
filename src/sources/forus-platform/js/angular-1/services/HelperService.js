let HelperService = function($q) {
    return new(function() {
        this.recursiveLeacher = function(request, page = 1, last_page = 1, data = []) {
            return $q((resolve, reject) => {
                return request(page).then(res => {
                    if ((res.data.meta.last_page === last_page) && (page === last_page)) {
                        resolve(data.concat(res.data.data));
                    } else {
                        this.recursiveLeacher(
                            request,
                            page + 1,
                            res.data.meta.last_page,
                            data.concat(res.data.data)
                        ).then(resolve);
                    }
                }, reject);
            });
        };
    });
};

module.exports = [
    '$q',
    HelperService
];