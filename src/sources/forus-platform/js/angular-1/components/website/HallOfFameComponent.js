let HallOfFameComponent = function(
    hofService,
) {
    let $ctrl = this;
    hofService.get().then(function(response) {
        $ctrl.list = response.data
    });

    hofService.get()

    $ctrl.profileURL = function(username) {
        return 'https://github.com/' + username + '.png?size=200'; 
    };
};

module.exports = {
    controller: [
        'hofService',
        HallOfFameComponent
    ],
    templateUrl: 'assets/tpl/pages/website/hall-of-fame.html'
};