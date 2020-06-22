var OfficesPage = function(){
    this.addOffice = function(){
        element(by.id("create_office")).click()
    }

    this.editOffice = function(){
        element(by.id("edit_office")).click()
    }

    this.cancelEditOffice = function(){
        element(by.id("cancel")).click()
    }

    this.cancelAddOffice = function(){
        element(by.id("cancel")).click()
    }
}
module.exports = new OfficesPage();

