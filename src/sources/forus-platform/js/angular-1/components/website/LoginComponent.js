let LoginComponent = function($state) {
    let $ctrl = this;

    $ctrl.selectedType = null;

    $ctrl.selectType = (type) => {
        $ctrl.selectedType = $ctrl.selectedType == type ? null : type;
        
        document.location.href = '/' + $ctrl.selectedType;
    }

    $ctrl.login = () => {
        document.location.href = '#!/register';
    };
};

module.exports = {
    controller: [
        '$state',
        LoginComponent
    ],
    templateUrl: 'assets/tpl/pages/website/login.html'
};