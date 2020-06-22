var EC = protractor.ExpectedConditions;

var VouchersPage = function(){

    this.createVoucher = function(){
        element(by.id('create_voucher')).click()
    }

    this.uploadCSV = function(){
        element(by.id('voucher_upload_csv')).click()
    }

    this.cancelCreateVoucher = function(){
        browser.wait(EC.elementToBeClickable(element(by.id("cancel"), 3000)))
        element(by.id('cancel')).click()
    }
    
    this.closeUploadCSV = function(){
        browser.wait(EC.elementToBeClickable(element(by.id("close"), 3000)))
        element(by.id('close')).click()
    }
}
module.exports = new VouchersPage();

