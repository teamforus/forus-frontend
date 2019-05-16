let CurrentComponent = function() {
    let $ctrl = this;
    $ctrl.check = function(slide) {
        document.getElementById("slide" + slide).checked = true;
    }
      

};

module.exports = {
    controller: [
        CurrentComponent
    ],
    templateUrl: 'assets/tpl/pages/website/current.html'
};