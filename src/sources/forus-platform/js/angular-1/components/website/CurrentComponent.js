let CurrentComponent = function(
    hofService,
) {
    let $ctrl = this;
    hofService.get().then(function(response) {

        $ctrl.list = response.data.length;
    });
    hofService.get();
};

module.exports = {
    controller: [
        'hofService',
        CurrentComponent
    ],
    templateUrl: 'assets/tpl/pages/website/current.html'
};