let preventPropagation = function($scope, element) {
    element.on("click", function($e) {
        $e.stopPropagation();
    });
};

module.exports = () => {
    return {
        link: preventPropagation
    };
};