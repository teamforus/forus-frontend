var ProductVouchersPage = function(){

    this.createProductVoucher = function(){
        element(by.id('create_product_voucher')).click()
    }

    this.uploadProductCSV = function(){
        element(by.id('product_voucher_upload_csv')).click()
    }

    this.closeUploadCSV = function(){
        element(by.id('close')).click()
    }

    this.cancelCreateProductVoucher = function(){
        element(by.id('cancel')).click()
    }
}
module.exports = new ProductVouchersPage();