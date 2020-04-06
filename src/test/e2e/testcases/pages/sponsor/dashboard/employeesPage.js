var EmployeesPage = function(){
    
    this.addEmployee = function(){
        element(by.id('add_employee')).click()
    }

    this.closeAddEmployee = function(){
        element(by.id('close')).click()
    }
}
module.exports = new EmployeesPage();