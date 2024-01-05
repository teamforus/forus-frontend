let ToastService = function() {
    return new (function() {
        this.toast = [{
            show: false,
        }];
    
        this.setToast = (description) => {
            this.toast = {
                show: true,
                description: description,
            };
        }

        this.getToast = () => {
            return this.toast;
        }
    });
};

module.exports = [
    ToastService
];