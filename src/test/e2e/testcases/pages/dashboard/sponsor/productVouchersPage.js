var EC = protractor.ExpectedConditions;

var ProductVouchersPage = function(){

    this.createProductVoucher = function(){
        element(by.id('create_product_voucher')).click()
    }

    this.uploadProductCSV = function(){
        element(by.id('product_voucher_upload_csv')).click()
    }

    this.closeUploadCSV = function(){
        browser.wait(EC.elementToBeClickable(element(by.id("close"))), 3000)
        element(by.id('close')).click()
    }

    this.cancelCreateProductVoucher = function(){
        browser.wait(EC.elementToBeClickable(element(by.id("cancel"))), 3000)
        element(by.id('cancel')).click()
    }
}
module.exports = new ProductVouchersPage();