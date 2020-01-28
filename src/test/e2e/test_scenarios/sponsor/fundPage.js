var fundPage = function(){
    
    this.get = function(){
        browser.get(environment.sponsorURL);
        browser.executeScript("window.localStorage.setItem('active_account','" + environment.active_account + "');").
            then(function(){
                browser.refresh();
                browser.waitForAngular();
            });

    }
    
    this.getURL = function(){
        return browser.getCurrentURl();
    }

    this.chooseFund = function(index){
        element.all(by.binding('organization.name')).get(index).click();
    }

    this.getAddFund = function(){
        element(by.css('[ui-sref="funds-create({organization_id: $root.activeOrganization.id})"]')).click();
    }

    this.enterStartEndDate = function(){
        var date = element(by.model("$ctrl.form.values.start_date"));
        date.sendKeys('05-05-2020');
        var date = element(by.model("$ctrl.form.values.end_date"));
        date.sendKeys('31-12-2020');        
    }

    this.enterNameDescription = function(name, description){
        element(by.model("$ctrl.form.values.name")).sendKeys(name);
        element(by.model("$ctrl.form.values.description")).sendKeys(description);
    }

    this.confirmFund = function(){
        element(by.css('[translate="funds_edit.buttons.confirm"]')).click();
    }

    this.getFundName = function(){
        return element.all(by.binding('fund.name'));
    }

    this.getGenerateVoucher = function(){
        element(by.css('[ui-sref="csv-validation"]')).click();
        element(by.css('[ng-click="addSinglePrevalidation()"]')).click();
    }

    this.enterBSNandChildren = function(BSN, children){
        element(by.css('[ng-click="addSinglePrevalidation()"]')).click();
        var input = element.all(by.model('$ctrl.form.values[fundRecord]'));
        input.get(0).sendKeys(BSN);
        input.get(1).sendKeys(children)
    }
    this.confirmActivationCode = function(){
        element(by.css('[ng-if="!$ctrl.prevalidation"')).click();
        element(by.css('[ng-if="!$ctrl.prevalidation"')).click();
    }

    this.getBSN = function(){
        return element(by.binding('$ctrl.prevalidationPrimaryKey.value'));
    }

    this.getAddEmployee = function(){
                        
        element(by.css('[ui-sref="employees({organization_id: $root.activeOrganization.id})"]')).click();
    }

    this.enterEmployeeMail = function(mail){
        element(by.css('[organization_employees.buttons.add]')).click();
        element(by.model("$ctrl.form.values.email")).sendKeys(mail);
        element(by.css('[translate="Bevestig"]')).click();
    }

    this.getEmployeeMail = function(){
        return element.all(by.binding('employee.email'));
    }
}
module.exports = new fundPage();