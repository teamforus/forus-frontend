var provider = require('../pages/providerPage');
var dashboard = require('../pages/dashboardProviderPage');

describe('testing provider dashboard:', function(){
    beforeAll(function(){
        provider.get()
        provider.setActiveAccount()
    });

    beforeEach(function(){
        provider.get()
        dashboard.chooseOrganisation()
    })
   
    it('opens and closes add-office modal', function(){
        dashboard.getOffices()
        dashboard.addOffice()
        dashboard.cancelAddOffice()
    }); 

    it('opens and closes the edit-organisation modal', function(){
        dashboard.getOffices()
        dashboard.editOffice()
        dashboard.cancelEditOffice()
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
        dashboard.cancelAddProduct()
    });

    it('opens and closes add employee modal', function(){
        dashboard.getEmployees()
        dashboard.addEmployee()
        dashboard.close()
    });
});