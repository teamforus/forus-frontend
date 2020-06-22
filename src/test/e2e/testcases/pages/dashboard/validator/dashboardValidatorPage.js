var DashboardValidatorPage = function(){
    
    this.getHomePage = function(){
        browser.get(environment.urls.validator)
    }

    this.get = function(){
        browser.get(environment.urls.validator + '/#!/organizations')
    }

    this.getRequesterPage = function(){
        element(by.id('requesters')).click()
    }

    this.getRequestsPage = function(){
        element(by.id('fund_requests')).click()
    }
}
module.exports = new DashboardValidatorPage();