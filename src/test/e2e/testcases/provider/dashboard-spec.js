var utils = require('../pages/utils');
var dashboard = require('../pages/dashboard/provider/dashboardProviderPage')
var homePage = require('../pages/provider/homePage')
var offices = require('../pages/dashboard/provider/officesPage')
var products = require('../pages/dashboard/provider/productsPage')
var employees = require('../pages/dashboard/employeesPage')

/**
 * testing dashboard functionality
 * first testing if fund/vouchers/employee/etc 
 * still works and then perform tests on that page
 */
describe('provider dashboard', function(){
    beforeAll(function(){
        homePage.get()
        utils.setActiveAccount()
        utils.setSelectedOrganizationId()
    }); 
    
    beforeEach(function(){
        dashboard.get()
    })
    
    it('goes to offices page', function(){
        dashboard.getOfficesPage();
    });

    describe('offices page', function(){
        beforeEach(function(){
            dashboard.getOfficesPage()
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
        dashboard.getTransactionsPage();
    });

    describe('transactions page', function(){
        beforeEach(function(){
            dashboard.getTransactionsPage();
        })
    })

    it('goes to funds page', function(){
        dashboard.getProviderFundsPage()
    });

    describe('funds page', function(){
        beforeEach(function(){
            dashboard.getProviderFundsPage()
        })
    })

    it('goes to products page', function(){
        dashboard.getProductsPage()
    });

    describe('products page', function(){
        beforeEach(function(){
            dashboard.getProductsPage()
        })

        it('opens and closes add-products modal', function(){   
            products.addProduct()
            products.cancelAddProduct()  
        });
    })

    it('goes to employees page', function(){
        dashboard.getEmployeesPage()
    });
    
    describe('employees', function(){
        beforeEach(function(){
            dashboard.getEmployeesPage()
        })

        it('opens and closes add employee modal', function(){
            employees.addEmployee()
            employees.closeAddEmployee()
        });

        it('should add and delete an employee', function(){
            employees.addEmployee()
            employees.emailInput.sendKeys('email@email.com');
            employees.confirmAddEmployee()
            expect(employees.employeesEmail.last().getText()).toBe('email@email.com')
            employees.deleteEmployee()
            expect(employees.employeesEmail.getText()).not.toContain('email@email.com')
        })         
    })
})