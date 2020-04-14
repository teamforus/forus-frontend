var ProvidersPage = function(){

    this.providersComponent = element(by.id("providers_list"))
   
    this.get = function(){
        browser.get(environment.customerURL + '/#!/providers')
    }
}
module.exports = new ProvidersPage();