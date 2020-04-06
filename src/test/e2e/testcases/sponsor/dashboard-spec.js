var sponsor = require('../pages/sponsor/sponsorPage');
var dashboard = require('../pages/sponsor/dashboard/dashboardPage');

var funds = require('../pages/sponsor/dashboard/fundsPage');
var vouchers = require('../pages/sponsor/dashboard/vouchersPage')
var productVouchers = require('../pages/sponsor/dashboard/productVouchersPage')
var vouchers = require('../pages/sponsor/dashboard/vouchersPage')
var employees = require('../pages/sponsor/dashboard/employeesPage')
var requesters = require('../pages/sponsor/dashboard/requestersPage')


/**
 * testing dashboard functionality
 * first testing if fund/vouchers/employee/etc...
 * still works and then perform tests on that page
 */ 
describe('sponsor dashboard', function(){
    beforeAll(function(){
        sponsor.get()
        sponsor.setActiveAccount()
        dashboard.setActiveOrganization()
    })  

    beforeEach(function(){
        dashboard.get()
    })
    
    it('goes to funds page', function(){
        dashboard.getFundsPage()
    })

    describe('funds page', function(){
        beforeEach(function(){
            dashboard.getFundsPage()
        })
        
        it('opens and closes fund settings', function(){
            funds.getFundSetting()
            funds.cancelFundSettings()
        })
    
        it('opens and closes add fund', function(){
            funds.addFund()
            funds.cancelAddFund()
        })
    })

    it('goes to vouchers page', function(){
        dashboard.getVouchersPage()
    })

    describe('vouchers page', function(){
        beforeEach(function(){
            dashboard.getVouchersPage()
        })

        it('opens and closes create voucher', function(){
            vouchers.createVoucher()
            vouchers.cancelCreateVoucher()
        })
    
        it('opens and closes upload CSV', function(){
            vouchers.uploadCSV()
            vouchers.closeUploadCSV()
        })
    })

    it('goes to product vouchers page', function(){
        dashboard.getProductVouchersPage()
    })

    describe('product vouchers page', function(){
        beforeEach(function(){
            dashboard.getProductVouchersPage()
        })
        it('opens and closes create voucher', function(){
            productVouchers.createProductVoucher()
            productVouchers.cancelCreateProductVoucher()
        })
    
        it('opens and closes upload CSV', function(){
            productVouchers.uploadProductCSV()
            productVouchers.closeUploadCSV()
        })
    })

    it('goes to transactions page', function(){
        dashboard.getProductVouchersPage()
    })

    describe('transactions page', function(){
        beforeEach(function(){
            dashboard.getTransactionsPage()
        })
    })

    it('goes to finances page', function(){
        dashboard.getProductVouchersPage()
    })

    describe('finances page', function(){
        beforeEach(function(){
            dashboard.getFinancialDashboard()
        })
    })

    it('goes to employees page', function(){
        dashboard.getProductVouchersPage()
    })

    describe('employees page', function(){
        beforeEach(function(){
            dashboard.getEmployeePage()
        })
        it('opens and closes add employees modal', function(){
            employees.addEmployee()
            employees.closeAddEmployee()
        })
    })
    
    it('goes to providers page', function(){
        dashboard.getProviderPage()
    })
    
    describe('providers page', function(){
        beforeEach(function(){
            dashboard.getProviderPage()
        })
    })

    it('goes to requesters page', function(){
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
});