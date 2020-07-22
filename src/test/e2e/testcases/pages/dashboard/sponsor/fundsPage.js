var FundsPage = function() {

    this.getFundSetting = function() {
        element.all(by.id('edit_fund')).first().click()
    }

    this.addFund = function() {
        element(by.id('create_fund')).click()
    }

    this.cancelFundSettings = function() {
        element(by.id('cancel')).click()
    }

    this.cancelAddFund = function() {
        element(by.id('cancel')).click()
    }
}

module.exports = new FundsPage()