let SignUpComponent = function($state) {
    let $ctrl = this;

    $ctrl.selectedType = null;

    $ctrl.selectType = (type) => {
        $ctrl.selectedType = $ctrl.selectedType == type ? null : type;

        document.location.href = '/' + $ctrl.selectedType + '/sign-up';
    }

    $ctrl.signUp = () => {
        document.location.href = '#!/login';
    };
};

module.exports = {
    controller: [
        '$state',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/website/sign-up.html'
};