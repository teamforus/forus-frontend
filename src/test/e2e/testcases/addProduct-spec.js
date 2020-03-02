var addProductPage = require('./addProductPage');

describe('When adding a product', function() {
    
    beforeAll(function(){
        addProductPage.get();
    });
    
    it('should be on products page', function() {
        addProductPage.getAddProduct();
    });

    it('adds product details', function(){
        addProductPage.enterProductDetails('test', 'test product', '50', '50', '50', '31-12-2020');
    });
    it('checks if product exists', function(){
        expect(element(by.binding('product.name')).isPresent()).toBeTruthy();
    })
});



