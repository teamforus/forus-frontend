var sponsor = require('../pages/sponsorPage');
var dashboard = require('../pages/dashboardPage');

describe('testing sponsor dashboard', function(){
    beforeAll(function(){
        sponsor.get()
        sponsor.setActiveAccount()
    })   

    beforeEach(function(){
        sponsor.get()
    })

    it('opens and closes fund settings', function(){
        dashboard.getOrganisationFunds()
        dashboard.getFundSetting(0)
        dashboard.cancel()
    })

    it('opens and closes add fund', function(){
        dashboard.getOrganisationFunds()
        dashboard.addFund()
        dashboard.cancel()
    })

    it('voucher page; opens and closes create voucher', function(){
        dashboard.getVouchers()
        dashboard.createVoucher()
        dashboard.close()
    })

    it('voucher page; opens and closes upload CSV', function(){
        dashboard.getVouchers()
        dashboard.uploadCSV()
        dashboard.closeModal()
    })
    it('voucher page; opens and closes create voucher', function(){
        dashboard.getProductVouchers()
        dashboard.createProductVoucher()
        dashboard.close()
    })

    it('voucher page; opens and closes upload CSV', function(){
        dashboard.getProductVouchers()
        dashboard.uploadProductCSV()
        dashboard.closeModal()
    })

    it('checks transactions modal', function(){
        dashboard.getTransactions()
    })
    it('checks finances modal', function(){
        dashboard.getFinances()
    })
    it('opens and closes add employees modal', function(){
        dashboard.getEmployees()
        dashboard.addEmployee()
        dashboard.close()
    })

    it('checks providers modal', function(){
        dashboard.getProviders()
    })
    
    it('opens and closes add activation code', function(){
        dashboard.getRequesters()
        dashboard.generateActivationCode()
        dashboard.closeModal()  
    })
});