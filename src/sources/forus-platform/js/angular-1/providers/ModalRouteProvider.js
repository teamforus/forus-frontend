let ModalRouteProvider = function() {
    var modals = {};

    this.modal = function(modal, config) {
        modals[modal] = config;
    };

    this.$get = [() => {
        return {
            modals: () => modals
        }
    }];
};

module.exports = new ModalRouteProvider();