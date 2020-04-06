var VouchersPage = function(){

    this.createVoucher = function(){
        element(by.id('create_voucher')).click()
    }

    this.uploadCSV = function(){
        element(by.id('voucher_upload_csv')).click()
    }

    this.cancelCreateVoucher = function(){
        element(by.id('cancel')).click()
    }
    
    this.closeUploadCSV = function(){
        element(by.id('close')).click()
    }
}
module.exports = new VouchersPage();

