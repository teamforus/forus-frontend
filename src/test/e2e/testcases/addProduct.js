
var addProduct = function(){
    describe('testing products page', function() {
    
        browser.get(environment.providerURL.concat("#!/organizations/29/products"));
        
        it('go to create product page', function() {
            element(by.id('addProduct')).click();
        });
    
        it('adds product details', function(){
            addProductDetails();
        });
    });
    
    function addProductDetails(){
        element(by.model("$ctrl.form.values.name")).sendKeys("New product");
        element(by.model("$ngModel")).sendKeys("New product");
        element(by.model("$ctrl.form.values.price")).sendKeys("50");
        element(by.model("$ctrl.form.values.old.price")).sendKeys("50");
        element(by.model("$ctrl.form.values.total_amount")).sendKeys("50");
        element(by.model("$ctrl.form.values.expire_at")).sendKeys("31-12-2020");
        element(by.model("$ctrl.categoriesValues[index]")).click();
        element(by.css('[translate="product_edit.buttons.confirm"]')).click();
    }
}

