import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';  

const app = {
  initMenu: function(){
    const thisApp = this;

    console.log('thisApp.data:', thisApp.data);
    //const testProduct = new Product();
    //console.log('testProduct:', testProduct);
    //thisApp.initMenu();

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;
    console.log('thisApp', thisApp);
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        /*save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    thisApp.initData();
    thisApp.initCart();
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    // musimy dodać nasłuchiwacz do customowegoEventu z Product.js
    // dla naszej aplikacji musimy stworzyć productList która będzie elementem dom
    // dzięki temu, że ustawiliśmy bąbelkowanie dotrze aż do productList w której zawarte są poszczególne produkty
    //kiedy mamy już listę produktów możemy dodać eventListener
    // nasz kastomowy event nazywa się add-to-cart
    // hendlerem tego eventu będzie anonimowa funkcja przyjmująca event który przekaże informacje koszykowi jaki produkt został do niego dodany
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  }
};
  

app.init();


