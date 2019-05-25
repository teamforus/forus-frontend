module.exports = [
    '$transitions',
    function(
        $transitions
    ) {
        $transitions.onSuccess({}, function(transition) {

            document.body.scrollTop = document.documentElement.scrollTop = 0;

            return true;
        });
    }
];