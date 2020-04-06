var dashboard = require('../pages/dashboard/validator/dashboardValidatorPage');
var utils = require('../pages/utils')
var requesters = require('../pages/dashboard/requestersPage')

/**
 * testing dashboard functionality
 * first testing if fund/vouchers/employee/etc...
 * still works and then perform tests on that page
 */ 
describe('sponsor dashboard', function(){
    beforeAll(function(){
        dashboard.getHomePage()
        utils.setSelectedOrganizationId()
        utils.setActiveAccount()
    })  

    beforeEach(function(){
        dashboard.get()
    })

    it('should go to requesters page', function(){
        dashboard.getRequesterPage()
    })

    describe('requesters page', function(){
        beforeEach(function(){
            dashboard.getRequesterPage()
        })

        it('opens and closes add single activation code', function(){
            requesters.generateActivationCode()
            requesters.closeGenerateActivationCode()
        })
    })

    it('should go to fund-requests page', function(){
        dashboard.getRequestsPage()
    })
});