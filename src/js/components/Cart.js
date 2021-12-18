import {select, classNames, templates, settings} from './settings.js';
import CartProduct from './CartProduct.js';
import utils from './utils.js';


class Cart{
  constructor(element){
    
    const thisCart = this;
    console.log('new Cart', thisCart);

    thisCart.products = [];

    thisCart.getElements(element);

    thisCart.initActions();

  }
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
    thisCart.dom.form = element.querySelector(select.cart.form);
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      console.log('show thisCart after initActions', thisCart);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }


  remove(cartProduct){
    const thisCart = this;
    const removeDomProduct = cartProduct.dom.wrapper;
    removeDomProduct.remove();
    const indexOfCartProduct = thisCart.products.indexOf(cartProduct);
    const removeIndexOfCartProduct = thisCart.products.splice(indexOfCartProduct, 1);
    console.log('removeIndexOfCartProduct', removeIndexOfCartProduct);
    thisCart.update();
  }

  add(menuProduct){
    const thisCart = this;
    console.log('adding product', menuProduct);
    //const thisProduct = this;

    /* generate HTMLbased on temple */
    const generateHTML = templates.cartProduct(menuProduct);
    console.log('show generateHTML:,', generateHTML);
    /* create element using utils.createElementFromHTML */
    const generateDOM = utils.createDOMFromHTML(generateHTML);
    console.log('show generatedDOM', generateDOM);
    /* add element to menu */
    thisCart.dom.productList.appendChild(generateDOM);

    thisCart.products.push(new CartProduct(menuProduct, generateDOM));
    console.log('thisCart.products:', thisCart.products);

    thisCart.update();
  }

  update(){
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for(let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    thisCart.totalPrice = 0;
    if(thisCart.totalNumber && thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    } else {
      thisCart.dom.deliveryFee.innerHTML = 0;
      thisCart.totalPrice = 0;
    }
    for(let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    console.log('thisCart after update', thisCart);
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const formData = utils.serializeFormToObject(thisCart.dom.form);
    console.log('formData', formData);
    const payload = {
      address: formData.address,
      phone: formData.phone,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.totalPrice - settings.cart.defaultDeliveryFee,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: []
    };
    console.log('payload', payload);
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }; 

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;