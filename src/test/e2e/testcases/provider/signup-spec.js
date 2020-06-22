var signup = require('../pages/provider/signupPage');
var utils = require('../pages/utils')

describe('testing provider signup functionality:', function() {
    beforeAll(function() {
        utils.setBrowserSize();
        signup.get()
        utils.clearLocalStorage()
    });

    beforeEach(function() {
        signup.get()
    })

    it('step 1', function() {
        signup.appIsInstalled();
        expect(signup.getGoToStep2Button().isPresent()).toBe(true)
    });
});