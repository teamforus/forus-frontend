var dashboardPage = function(){

    this.setActiveOrganization = function(){
        browser.executeScript("window.localStorage.setItem('active_organization','" + environment.active_organization + "');")
    }

    this.get = function(){
        browser.get(environment.sponsorURL.concat('/#!/organizations'))
    }

    this.getTransactionsPage = function(){
        element(by.id('transactions')).click()
    }

    this.getEmployeePage = function(){
        element(by.id('employees')).click()
    }

    this.addEmployee = function(){
        element(by.id('add_employee')).click()
    }

    this.getFundsPage = function(){
        element(by.id('funds')).click()
    }

    this.getFundSetting = function(){
        element.all(by.id('edit_fund')).first().click()
    }

    this.addFund = function(){
        element(by.id('create_fund')).click()
    }

    this.cancelFundSettings = function(){
        element(by.id('cancel')).click()
    }

    this.cancelAddFund = function(){
        element(by.id('cancel')).click()
    }

    this.cancel = function(){
        element(by.id('cancel')).click()
    }

    this.cancelCreateVoucher = function(){
        element(by.id('cancel')).click()
    }

    this.cancelCreateProductVoucher = function(){
        element(by.id('cancel')).click()
    }

    this.closeUploadCSV = function(){
        element(by.id('close')).click()
    }

    this.closeAddEmployee = function(){
        element(by.id('close')).click()
    }

    this.getVouchersPage = function(){
        element(by.id('vouchers')).click()
    }

    this.createVoucher = function(){
        element(by.id('create_voucher')).click()
    }

    this.uploadCSV = function(){
        element(by.id('voucher_upload_csv')).click()
    }

    this.createProductVoucher = function(){
        element(by.id('create_product_voucher')).click()
    }

    this.uploadProductCSV = function(){
        element(by.id('product_voucher_upload_csv')).click()
    }

    this.getProductVouchersPage = function(){
        element(by.id('product_vouchers')).click()
    }

    this.getFinancialDashboard = function(){
        element(by.id('financial_dashboard')).click()
    }
    
    this.getProviderPage = function(){
        element(by.id('providers')).click()
    }
    this.getRequesterPage = function(){
        element(by.id('requesters')).click()
    }

    this.generateActivationCode = function(){
        element(by.id('add_single_prevalidation')).click()
    }

    this.closeGenerateActivationCode = function(){
        element(by.id('close')).click()
    }
    
    this.getCSVFunds = function(){
        return element.all(by.id('csv_validation_fund'))
    }

    this.getCSVFund = function(){      
        element(by.cssContainingText('fund.name', 'Zuidhorn')).click()
    }
}
module.exports = new dashboardPage();