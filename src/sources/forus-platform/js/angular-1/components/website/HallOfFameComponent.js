let HallOfFameComponent = function(
    hofService,
) {
    let $ctrl = this;
    hofService.get().then(function(response) {
        $ctrl.list = response.data
    });

    hofService.get()

    $ctrl.profileURL = function(username) { return 'https://github.com/' + username + '.png?size=200'; };

    $ctrl.test = ["hey", "sup", "krak"]
    // make an array of image urls; using ctrl.theArray
};

module.exports = {
    controller: [
        'hofService',
        HallOfFameComponent
    ],
    templateUrl: 'assets/tpl/pages/website/hall-of-fame.html'
};