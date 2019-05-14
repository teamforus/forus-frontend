let CurrentComponent = function(
    hofService,
) {
    let $ctrl;
    let res = hofService.getList();

    $ctrl.list = res.data.data;
    console.log($ctrl.list);
    console.log("yo");
};

module.exports = {
    controller: [
        'hofService',
        CurrentComponent
    ],
    templateUrl: 'assets/tpl/pages/website/current.html'
};