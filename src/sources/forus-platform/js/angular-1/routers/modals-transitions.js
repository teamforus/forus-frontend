module.exports = ['ModalService', 'PageLoadingBarService', (
    ModalService, PageLoadingBarService
) => {
    ModalService.bindEvent('open', (modal) => {
        if (modal.animated) {
            PageLoadingBarService.setProgress(0);
        }
    });

    ModalService.bindEvent('loaded', (modal) => {
        if (modal.animated) {
            PageLoadingBarService.setProgress(100);
        }
    });
}];