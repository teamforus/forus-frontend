let SignUpComponent = function() {
    let $ctrl = this;

    $ctrl.selectedType = null;

    $ctrl.selectType = (type) => {
        $ctrl.selectedType = $ctrl.selectedType == type ? null : type;
    }

    $ctrl.signUp = () => {
        if (!$ctrl.selectedType) {
            alert('Select a type');
            return;
        }

        document.location.href = '/' + $ctrl.selectedType + '/sign-up';
    };
};

module.exports = {
    controller: [
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/website/sign-up.html'
};