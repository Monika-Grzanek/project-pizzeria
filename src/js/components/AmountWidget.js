import {select, settings} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;
    console.log('AmountWidget:', thisWidget);
    console.log('constructor arguments:', element);
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;
    
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
    if(thisWidget.value !== newValue && isNaN(newValue) == false && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      console.log('show change of quantity:', newValue);
      console.log('pokaż isNaN(newValue): ', isNaN(newValue));
    } 
    thisWidget.input.value = thisWidget.value;
    console.log('thisWidget:', thisWidget);

    thisWidget.announce();
    console.log('triggered announce');
  }


  initActions(){
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - settings.amountWidget.defaultValue);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + settings.amountWidget.defaultValue);
    });
  }

  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;