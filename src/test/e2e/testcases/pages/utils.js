var Utils = function(){

    this.setActiveAccount = function(){
        browser.executeScript("window.localStorage.setItem('active_account','" + environment.active_account + "');")
    };

    this.clearLocalStorage = function(){
        browser.executeScript("window.localStorage.clear()")
    }
    
    this.setSelectedOrganizationId = function(){
        browser.executeScript("window.localStorage.setItem('selected_organization_id','" + environment.active_organization + "');")
    }

    this.setActiveOrganization = function(){
        browser.executeScript("window.localStorage.setItem('active_organization','" + environment.active_organization + "');")
    }
 
    this.goToStep = function(step){
        browser.executeScript("window.localStorage.setItem('sign_up_form.step','" + step + "');")
    }
}
module.exports = new Utils();