let HallOfFameComponent = function(
    hofService,
) {
    let $ctrl = this;
    hofService.get().then(function(response) {

        $ctrl.list = response.data;
    });
    hofService.get();
};

module.exports = {
    controller: [
        'hofService',
        HallOfFameComponent
    ],
    templateUrl: 'assets/tpl/pages/website/hall-of-fame.html'
};