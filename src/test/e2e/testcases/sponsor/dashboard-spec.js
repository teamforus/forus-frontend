var sponsor = require('../pages/sponsorPage');
var dashboard = require('../pages/dashboardSponsorPage');

describe('testing sponsor dashboard', function(){
    beforeAll(function(){
        sponsor.get()
        sponsor.setActiveAccount()
        dashboard.setActiveOrganization()
    })   

    beforeEach(function(){
        sponsor.get()
        dashboard.chooseOrganisation()
    })

    it('opens and closes fund settings', function(){
        dashboard.getFundsPage()
        dashboard.getFundSetting()
        dashboard.cancelFundSettings()
    })

    it('opens and closes add fund', function(){
        dashboard.getFundsPage()
        dashboard.addFund()
        dashboard.cancelAddFund()
    })

    it('voucher page; opens and closes create voucher', function(){
        dashboard.getVouchersPage()
        dashboard.createVoucher()
        dashboard.cancelCreateVoucher()
    })

    it('voucher page; opens and closes upload CSV', function(){
        dashboard.getVouchersPage()
        dashboard.uploadCSV()
        dashboard.closeUploadCSV()
    })
    it('Product voucher page; opens and closes create voucher', function(){
        dashboard.getProductVouchersPage()
        dashboard.createProductVoucher()
        dashboard.cancelCreateProductVoucher()
    })

    it('Product voucher page; opens and closes upload CSV', function(){
        dashboard.getProductVouchersPage()
        dashboard.uploadProductCSV()
        dashboard.closeUploadCSV()
    })

    it('checks transactions modal', function(){
        dashboard.getTransactionsPage()
    })

    it('checks finances modal', function(){
        dashboard.getFinancialDashboard()
    })

    it('opens and closes add employees modal', function(){
        dashboard.getEmployeePage()
        dashboard.addEmployee()
        dashboard.closeAddEmployee()
    })

    it('checks providers modal', function(){
        dashboard.getProviderPage()
    })

    it('opens and closes add activation code', function(){
        dashboard.getRequesterPage()
        dashboard.generateActivationCode()
        dashboard.closeGenerateActivationCode()  
    })
});