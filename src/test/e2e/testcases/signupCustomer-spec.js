var signupCustomerPage = require('./signupCustomerPage');

describe('signup of the customer', function() {
  
  it('goes to the page', function(){
    signupCustomerPage.get();
  });

  it('enters mail', function() {
    signupCustomerPage.enterMail();
    
    signupCustomerPage.useLoginMail();
  });

  it('enters activation code', function(){
    signupCustomerPage.enterActivationCode();
  });

});
