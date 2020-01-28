var addFundpage = require('./fundPage');

describe('testing setting up a fund', function(){
    it('navigates to page', function(){
        addFundpage.get();
        //when there is only one fund, this will fail
        addFundpage.chooseFund(0);
    });

    it('navigates to add fund page', function(){
        addFundpage.getAddFund();
        browser.sleep(3000)
    })
    it('fills in fund details', function(){
        addFundpage.enterStartEndDate();
        addFundpage.enterNameDescription('new fund', 'new fund');
    })

    it('confirms fund', function(){
        addFundpage.confirmFund();
        expect(addFundpage.getFundName().getText()).toContain('new fund')
    })
});