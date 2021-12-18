import {select, templates, classNames, } from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
      
    thisProduct.id = id;
    thisProduct.data = data;
      
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
      

    console.log('new Product:', thisProduct);
  }
  renderInMenu(){
    const thisProduct = this;

    /* generate HTMLbased on temple */
    const generateHTML = templates.menuProduct(thisProduct.data);
    console.log('show generateHTML:,', generateHTML);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
    console.log('show menuContainer:', menuContainer);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    console.log('abc', thisProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    console.log('bca', thisProduct.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    console.log('show this:', this);
    /* find the clickable trigger (the element that should react to clicking) */
    // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      console.log('show thisProduct.accordionTrigger:', thisProduct.accordionTrigger);
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      console.log('show activeProduct:', activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct != null && activeProduct != thisProduct.element){
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      console.log('show active toggle:', thisProduct.element);
    });
  }

  initOrderForm(){
    const thisProduct = this;
    console.log('show thisProduct for OrderForm:', thisProduct);
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      console.log('zmiana ilości', thisProduct);
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
        console.log('dokonano zmiany', thisProduct);
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      console.log('zatwierdzono zamówienie', thisProduct);
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    console.log('show thisProduct for processOrder:', thisProduct);
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData:', formData);
    // set price to default price
    let price = thisProduct.data.price;
    console.log('show price', price);
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log('pokaż wskaźniki', paramId, param);

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log('pokaż składniki',optionId, option);
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected){
          if(!option.default){
            price += option.price;
            console.log('dodanie składnika:', option.price);
          }
        }
        else if(option.default){
          price -= option.price;
          console.log('usunięcie składnika:', option.price);
        }
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        console.log('znaleziono obrazek', optionImage);
        if(optionImage){
          if(formData[paramId] && formData[paramId].includes(optionId)){
            optionImage.classList.add(classNames.menuProduct.wrapperActive);
            console.log('dodano active', optionImage);
          }
          else {
            optionImage.classList.remove(classNames.menuProduct.wrapperActive);
            console.log('usunięto active', optionImage);
          }
        }
      }
    }
    // multiply price by amount
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    console.log('show price:', price);
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    //app.cart.add(thisProduct.prepareCartProduct());
    // customowy event tworzymy bardzo podobnie do tworzenia instancji klasy 
    //jest to klasa wbudowana w przeglądarkę
    // pierwszym argumentem konstruktora będzie nazwa eventu, drugim argumentem będzie obiekt zawierający ustawienia tego eventu 
    // - po pierwsze chcemy aby bąbelkowało do przodków, a po drugie chcemy aby zawierał w sobie pod kluczem product produkt który został dodany do koszyka
    // wywołanie eventu nazwya się dispatchowaniem - musimy wybrać element na którym ten event chcemy wywołać 
    // w tym przypadku tym elementem jest element dom który jest dostępny dla wszystkich elementów dom, w tym przypadku będzie to dispatchEvent, a jako argument nasz event

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
    console.log('event', event);
    // to jednak nie koniec- aby ten event coś spowodował musimy go nasłuchiwać w naszym obiekcie App
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id, 
      name: thisProduct.data.name,
      amount:  thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.amountWidget.value * thisProduct.priceSingle,
      params: thisProduct.prepareCartProductParams(),
    };
    console.log('show productSummary: ', productSummary);

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    console.log('show thisProduct for processOrder:', thisProduct);
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const params = {};
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData:', formData);
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log('pokaż wskaźniki', paramId, param);
      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      };
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log('pokaż składniki',optionId, option);
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected){
          params[paramId].options[optionId] = option.label; 
          console.log('show option.label', option.label);
        }
      } 
    }
    return params;
  }
}

export default Product;