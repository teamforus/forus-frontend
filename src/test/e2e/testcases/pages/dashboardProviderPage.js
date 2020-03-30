var dashboardProviderPage = function(){
    this.setActiveOrganization = function(){
        browser.executeScript("window.localStorage.setItem('active_organization','" + environment.active_account + "');").
        then(function(){
            browser.refresh();
        })
    }

    this.getOffices = function(){
        element(by.css('[ui-sref="offices({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.addOffice = function(){
        element(by.css('[ui-sref="offices-create({organization_id: $ctrl.organization.id})"]')).click()       
    }

    this.editOrganisation = function(buttonNum){
        element.all(by.css('[ui-sref="organizations-edit($ctrl.organization)"]')).get(buttonNum).click()
    }

    this.getTransactions = function(){
        element(by.css('[ui-sref="transactions({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.getProducts = function(){
        element(by.css('[ui-sref="products({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.getEmployees = function(){
        element(by.css('[ui-sref="employees({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.getProviderFunds = function(){
        element(by.css('[ui-sref="provider-funds({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.addEmployee = function(){
        element(by.css('[ng-click="$ctrl.createEmployee()"]')).click()
    }

    this.addProduct = function(){
        element(by.id('addProduct')).click()
    }

    this.close = function(){
        element.all(by.css('[ng-click="$ctrl.close()"]')).last().click()
    }

    this.cancel = function(){
        element(by.css('[ng-click="$ctrl.cancel()"]')).click()
    }
}
module.exports = new dashboardProviderPage();