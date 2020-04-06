var EmployeesPage = function(){
    
    this.emailInput = element(by.id('email_value'))
    this.employeesEmail = element.all(by.id('employee_email'))


    this.addEmployee = function(){
        element(by.id('add_employee')).click()
    }

    this.closeAddEmployee = function(){
        element(by.id('close')).click()
    }

    this.confirmAddEmployee = function(){
        element(by.id('confirm')).click()
    }

    this.deleteEmployee = function(){
        element.all(by.id('delete_employee')).last().click()
    }
}
module.exports = new EmployeesPage();