var DashboardValidatorPage = function(){
    
    this.getHomePage = function(){
        browser.get(environment.validatorURL)
    }

    this.get = function(){
        browser.get(environment.validatorURL + '/#!/organizations')
    }

    this.getRequesterPage = function(){
        element(by.id('requesters')).click()
    }

    this.getRequestsPage = function(){
        element(by.id('fund_requests')).click()
    }
}
module.exports = new DashboardValidatorPage();