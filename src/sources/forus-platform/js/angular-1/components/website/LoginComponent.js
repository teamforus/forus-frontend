let LoginComponent = function() {
    let $ctrl = this;

    $ctrl.selectedType = null;

    $ctrl.selectType = (type) => {
        $ctrl.selectedType = $ctrl.selectedType == type ? null : type;
    }

    $ctrl.login = () => {
        if (!$ctrl.selectedType) {
            alert('Select a type');
            return;
        }
        
        document.location.href = '/' + $ctrl.selectedType;
    };
};

module.exports = {
    controller: [
        LoginComponent
    ],
    templateUrl: 'assets/tpl/pages/website/login.html'
};