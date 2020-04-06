var provider = require('../pages/provider/providerPage');
var dashboard = require('../pages/provider/dashboard/dashboardPage');

var offices = require('../pages/provider/dashboard/officesPage')
var products = require('../pages/provider/dashboard/productsPage')
var employees = require('../pages/provider/dashboard/employeesPage')


/**
 * testing dashboard functionality
 * first testing if fund/vouchers/employee/etc...
 * still works and then perform tests on that page
 */
describe('provider dashboard', function(){
    beforeAll(function(){
        provider.get()
        provider.setActiveAccount()
        dashboard.setSelectedOrganizationId()
    }); 

    beforeEach(function(){
        dashboard.get()
    })

    it('goes to offices page', function(){
        dashboard.getOffices();
    });

    describe('offices page', function(){
        beforeEach(function(){
            dashboard.getOffices()
        })

        it('opens and closes the edit-organisation modal', function(){
            offices.editOffice()
            offices.cancelEditOffice()
        })

        it('opens and closes add-office modal', function(){
            offices.addOffice()
            offices.cancelAddOffice()
        });
    })

    it('goes to transactions page', function(){
        dashboard.getTransactions();
    });

    describe('transactions page', function(){
        beforeEach(function(){
            dashboard.getTransactions();
        })
    })

    it('goes to funds page', function(){
        dashboard.getProviderFunds()
    });

    describe('funds page', function(){
        beforeEach(function(){
            dashboard.getProviderFunds()
        })
    })

    it('goes to products page', function(){
        dashboard.getProducts()
    });

    describe('products page', function(){
        beforeEach(function(){
            dashboard.getProducts()
        })

        it('opens and closes add-products modal', function(){   
            products.addProduct()
            products.cancelAddProduct()  
        });
    })

    it('goes to employees page', function(){
        dashboard.getEmployees()
    });

    describe('employees', function(){
        beforeEach(function(){
            dashboard.getEmployees()
        })

        it('opens and closes add employee modal', function(){
            employees.addEmployee()
            employees.closeAddEmployee()
        });
    })
});