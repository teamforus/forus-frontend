

describe('testing signup flow of customer', function() {
    it('make a new account and login', function() {
      browser.get(environment.url);
      element(by.className('button button-primary ng-scope ng-isolate-scope')).click();
      element(by.model('$ctrl.signUpForm.values.records.primary_email')).sendKeys(environment.email);
      element(by.model('$ctrl.signUpForm.values.records.primary_email_confirmation')).sendKeys(environment.email);
      element(by.buttonText('BEVESTIG')).click();
      expect(element(by.className('title ng-scope')).getText()).toEqual('Stap 2 van 3: Bevestig dat u toegang heeft tot dit e-mailadres.')

      browser.controlFlow().wait(getLastEmail()).then(function (email) {
        // regular expression getting the link from html in email
        var pattern =/https?:\/\/(www\.)?(staging|local)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.?[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/igm;
        var regCode = pattern.exec(email.html);
        browser.get(regCode[0]);

        element(by.className('hidden-input')).sendKeys(environment.activationcode);
        browser.sleep(3000);
        element(by.buttonText('BEVESTIG')).click();
        browser.sleep(3000);
      });
     

    });
});

function getLastEmail() {
  var deferred = protractor.promise.defer();
  console.log("Waiting for an email...");

  mailListener.on("mail", function(mail){
      deferred.fulfill(mail);
  });
  
  return deferred.promise;
};