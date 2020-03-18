var fundPage = require('./fundPage');

describe('testing setting up a fund', function(){
    it('navigates to page', function(){
        fundPage.get();
        //when there is only one fund, this will fail
        fundPage.chooseFund(0);
    });

    it('navigates to add fund page', function(){
        fundPage.getGenerateVoucher();
        fundPage.enterBSNandChildren('123456', '5');
        fundPage.confirmActivationCode();
        expect(fundPage.getBSN().getText()).toEqual('123456');
    });



});