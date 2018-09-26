module.exports = function(
    $transitions
) {
    $transitions.onSuccess({}, function() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    })
};