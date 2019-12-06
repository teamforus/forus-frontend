let PageLoadingBarService = function() {
    let listeners = [];

    let setProgress = (progress) => {
        listeners.forEach(listener => listener(progress));
    };

    return new (function() {
        this.setProgress = (progress) => {
            setProgress(progress);
        }
        
        this.addListener = function(listener) {
            listeners.push(listener);
        };
    });
};

module.exports = [
    PageLoadingBarService
];