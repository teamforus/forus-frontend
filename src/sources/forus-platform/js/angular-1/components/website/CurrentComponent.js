let CurrentComponent = function(
    hofService,
) {
    let $ctrl = this;
    hofService.get().then(function(response) {

        $ctrl.list = response.data.length;
    });
    hofService.get();
      
    $ctrl.check = function(slide) {
        document.getElementById("slide" + slide).checked = true;
    }
      
};

module.exports = {
    controller: [
        'hofService',
        CurrentComponent
    ],
    templateUrl: 'assets/tpl/pages/website/current.html'
};