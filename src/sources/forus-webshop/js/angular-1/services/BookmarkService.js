const BookmarkService = function(ApiRequest) {
    const uriPrefix = '/platform/bookmarks';

    return new (function() {
        this.setBookmark = function(data) {
            return ApiRequest.post(`${uriPrefix}/set-bookmark`, data);
        }

        this.removeBookmark = function(data) {
            return ApiRequest.post(`${uriPrefix}/remove-bookmark`, data);
        }
    });
};

module.exports = [
    'ApiRequest',
    BookmarkService
];