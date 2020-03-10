var fundPage = require('./fundPage');

describe('testing adding a employee', function(){
    it('navigates to page', function(){
        fundPage.get();
        //when there is only one fund, this will fail
        fundPage.chooseFund(0);
        browser.sleep(300000)
    });
    //need to set forusemail123@gmail.com as main account
    it('navigates to add fund page', function(){
        fundPage.getAddEmployee();
        fundPage.enterEmployeeMail(environment.emailSibling);
        expect(fundPage.getEmployeeMail().getText()).toContain(environment.emailSibling);
    });
});