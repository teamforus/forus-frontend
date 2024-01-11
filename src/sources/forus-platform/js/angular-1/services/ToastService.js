const ToastService = function() {
    return new (function() {
        this.toast = {
            show: false,
        };
    
        this.setToast = (description) => {
            this.toast = {
                show: !!description,
                description: description,
            };
        }

        this.getToast = () => {
            return this.toast;
        }
    });
};

module.exports = [
    ToastService,
];