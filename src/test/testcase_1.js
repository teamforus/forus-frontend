

describe('angularjs homepage todo list', function() {
    it('should add a todo', function() {
      browser.get('https://staging.forus.io/');
      browser.sleep(1000);
      expect(element(by.className('login_btn')).getText()).toEqual('Inloggen');
      element(by.className('login_btn')).click();
      browser.sleep(3000);
      //sleep(3000);
    });
  });