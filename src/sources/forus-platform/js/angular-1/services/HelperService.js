let HelperService = function($q) {
    return new (function() {
        this.recursiveLeacher = (request, concurrency = 1, page = 1, last_page = null, data = []) => {
            return $q((resolve, reject) => {
                let requests = [];
                let _concurrency = last_page === null ? 1 : Math.min(
                    concurrency,
                    Math.max((last_page - page) + 1, 1)
                );

                for (let requestIndex = 0; requestIndex < _concurrency; requestIndex++) {
                    requests.push(request(page + requestIndex, last_page, _concurrency));
                }

                return $q.all(requests).then(res => {
                    let _data = data.concat((res.reduce((arr, __data) => {
                        return arr.concat(__data.data.data);
                    }, [])));

                    if ((res[0].data.meta.last_page === last_page) && ((page + (_concurrency - 1)) >= last_page)) {
                        resolve(_data);
                    } else {
                        this.recursiveLeacher(
                            request,
                            concurrency,
                            page + _concurrency,
                            res[0].data.meta.last_page,
                            _data
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