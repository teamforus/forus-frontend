var ProductsPage = function(){
    
    this.addProduct = function(){
        element(by.id('add_product')).click()
    }
    
    this.cancelAddProduct = function(){
        element(by.id("cancel_create_product")).click()
    }
}
module.exports = new ProductsPage()