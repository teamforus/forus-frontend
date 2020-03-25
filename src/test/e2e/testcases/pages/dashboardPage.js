var dashboardPage = function(){

    this.getOffices = function(){
        element(by.css('[ui-sref="offices({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.addOffice = function(){
        element(by.css('[]')).click()
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

    this.getProviderFunds = function(){
        element(by.css('[ui-sref="provider-funds({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.getProducts = function(){
        element(by.css('[ui-sref="products({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.addProduct = function(){
        element(by.id('addProduct')).click()
    }

    this.getEmployees = function(){
        element(by.css('[ui-sref="employees({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.addEmployee = function(){
        element(by.css('[ng-click="$ctrl.createEmployee()"]')).click()
    }

    this.getOrganisationFunds = function(){
        element(by.css('[ui-sref="organization-funds({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.getFundSetting = function(buttonNum){
        element.all(by.css('[ui-sref="funds-edit(fund)"]')).get(buttonNum).click()  
    }

    this.addFund = function(){
        element(by.css('[ui-sref="funds-create({organization_id: $root.activeOrganization.id})"]')).click()  
    }

    this.cancel = function(){
        element(by.css('[ng-click="$ctrl.cancel()"]')).click()
    }

    this.close = function(){
        element.all(by.css('[ng-click="$ctrl.close()"]')).last().click()
    }
    this.closeModal = function(){
        element.all(by.css('[ng-click="$ctrl.closeModal()"]')).last().click()
    }

    this.getVouchers = function(){
        element(by.css('[ui-sref="vouchers({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.createVoucher = function(){
        element(by.css('[ng-click="$ctrl.createVoucher()"]')).click()
    }

    this.uploadCSV = function(){
        element(by.css('[ng-click="$ctrl.uploadVouchersCsv()"]')).click()
    }

    this.createProductVoucher = function(){
        element(by.css('[ng-click="$ctrl.createProductVoucher()"]')).click()
    }

    this.uploadProductCSV = function(){
        element(by.css('[ng-click="$ctrl.uploadProductVouchersCsv()"]')).click()
    }

    this.getProductVouchers = function(){
        element(by.css('[ui-sref="product-vouchers({organization_id: $root.activeOrganization.id})"]')).click()
    }

    this.getFinances = function(){
        element(by.css('[ui-sref="financial-dashboard({organization_id: $root.activeOrganization.id})"]')).click()
    }
    
    this.getProviders = function(){
        element(by.css('[ui-sref="organization-providers({organization_id: $root.activeOrganization.id, fund_id: null})"]')).click()
    }
    this.getRequesters = function(){
        element(by.css('[ui-sref="csv-validation"]')).click()
    }

    this.generateActivationCode = function(){
        element(by.css('[ng-click="addSinglePrevalidation()"]')).click()
    }   
}
module.exports = new dashboardPage();