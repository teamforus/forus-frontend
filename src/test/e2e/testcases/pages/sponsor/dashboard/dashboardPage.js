var dashboardPage = function(){

    this.setActiveOrganization = function(){
        browser.executeScript("window.localStorage.setItem('active_organization','" + environment.active_organization + "');")
    }

    this.get = function(){
        browser.get(environment.sponsorURL + '/#!/organizations')
    }

    this.getTransactionsPage = function(){
        element(by.id('transactions')).click()
    }

    this.getEmployeePage = function(){
        element(by.id('employees')).click()
    }

    this.getFundsPage = function(){
        element(by.id('funds')).click() 
    }

    this.getVouchersPage = function(){
        element(by.id('vouchers')).click()
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
}
module.exports = new dashboardPage();