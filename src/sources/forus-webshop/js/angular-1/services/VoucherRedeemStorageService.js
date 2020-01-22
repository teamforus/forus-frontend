let VoucherRedeemStorageService = function(
    LocalStorageService,
) {
    let collectionKey = 'voucher_redeem';

    return new (function() {
        this.get = (key, default_value = null) => LocalStorageService.getCollectionItem(
            collectionKey, key, default_value
        );

        this.set = (key, new_value) => LocalStorageService.setCollectionItem(
            collectionKey, key, new_value
        );

        this.setAll = (new_values) => {
            LocalStorageService.setCollectionAll(collectionKey, new_values);
        };

        this.reset = () => {
            LocalStorageService.resetCollection(collectionKey);
        }
    });
};

module.exports = [
    'LocalStorageService',
    VoucherRedeemStorageService
];