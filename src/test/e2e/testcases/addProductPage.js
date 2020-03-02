var addProductPage = function(){
    
    this.get = function() {
        browser.get(environment.providerURL.concat("#!/organizations"));
        browser.executeScript("window.localStorage.setItem('active_account','" + environment.active_account + "');").
            then(function(){
                browser.refresh();
                browser.waitForAngular();
            });
    }

    this.getAddProduct = function(){
        element(by.css('[ui-sref="products({organization_id: $root.activeOrganization.id})"]')).click();
        element(by.id('addProduct')).click();
    } 

    this.enterProductDetails = function(name, description, oldPrice, newPrice, amount, expirationDate){
        var date = element(by.model("$ctrl.form.values.expire_at"));
        date.sendKeys(expirationDate)
        //element(by.css('[ng-click="setDatepickerDay(item)"]'))
        element(by.model("$ctrl.form.values.name")).sendKeys(name);
        element(by.model("ngModel")).sendKeys(description);
        element(by.model("$ctrl.form.values.price")).sendKeys(newPrice);
        element(by.model("$ctrl.form.values.old_price")).sendKeys(oldPrice);
        element(by.model("$ctrl.form.values.total_amount")).sendKeys(amount);
        element(by.model("$ctrl.categoriesValues[index]")).click()
        element(by.cssContainingText('option', 'Dieren')).click();
        element(by.css('[translate="product_edit.buttons.confirm"]')).click();
        element(by.css('[ng-click="$ctrl.confirm()"]')).click();
    }
}
module.exports = new addProductPage();