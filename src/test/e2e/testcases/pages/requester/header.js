var Header = function() {
    this.homePageButton = element(by.id("home"))
    this.productsPageButton = element(by.id("products_page"))
    this.providersPageButton = element(by.id("providers_page"))
    this.loginButton = element(by.id("login"))
    this.vouchersButton = element(by.id("vouchers"))
    this.userMenu = element(by.id("user_menu"))
}

module.exports = new Header();