var ProductsPage = function() {

    this.productsComponent = element(by.id("products_list"));

    this.get = function() {
        browser.get(environment.urls.requester + '/#!/products')
    };
}

module.exports = new ProductsPage();