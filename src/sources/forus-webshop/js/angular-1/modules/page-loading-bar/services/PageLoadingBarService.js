let PageLoadingBarService = function() {
    let listeners = [];

    let setProgress = (progress) => {
        listeners.forEach(listener => listener(progress));
    };

    let PageLoadingBarService = function() {
        this.setProgress = (progress) => {
            setProgress(progress);
        };
        
        this.addListener = function(listener) {
            listeners.push(listener);
        };
    };

    return new PageLoadingBarService();
};

module.exports = [
    PageLoadingBarService
];