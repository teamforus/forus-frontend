var provider = require('../pages/providerPage');
var dashboard = require('../pages/dashboardPage');

describe('testing provider dashboard:', function(){
    beforeAll(function(){
        provider.get()
        provider.setActiveAccount();
    });

    beforeEach(function(){
        provider.get()
    })
   
    it('opens and closes add-office modal', function(){
        dashboard.getOffices()
        dashboard.addOffice()
        dashboard.cancel()
    });

    it('opens and closes the edit-organisation modal by both buttons', function(){
        dashboard.getOffices()
        dashboard.editOrganisation(0)
        dashboard.cancel()
        dashboard.editOrganisation(1)
        dashboard.cancel()
    })

    it('checks transactions modal', function(){
        dashboard.getTransactions();
    });

    it('checks funds modal', function(){
        dashboard.getProviderFunds()
    });

    it('opens and closes add-products modal', function(){
        dashboard.getProducts()
        dashboard.addProduct()
        dashboard.cancel()
    });

    it('opens and closes add employee modal', function(){
        dashboard.getEmployees()
        dashboard.addEmployee()
        dashboard.close()
    });
});