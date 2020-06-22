var EC = protractor.ExpectedConditions;

var EmployeesPage = function(){
    
    this.emailInput = element(by.id('email_value'))
    this.employeesEmail = element.all(by.id('employee_email'))

    this.addEmployee = function(){
        element(by.id('add_employee')).click()
    }

    this.closeAddEmployee = function(){
        browser.wait(EC.elementToBeClickable(element(by.id("close"), 3000)))
        element(by.id('close')).click()
    }

    this.confirmAddEmployee = function(){
        element(by.id('confirm')).click()
    }

    this.deleteEmployee = function(){
        browser.wait(EC.elementToBeClickable(element.all(by.id("delete_employee"), 3000)))
        element.all(by.id('delete_employee')).last().click()
    }
}
module.exports = new EmployeesPage();