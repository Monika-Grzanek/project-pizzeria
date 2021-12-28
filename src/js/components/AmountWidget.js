import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{//taki zapis oznacza, że klasa AmountWidget jest rozszerzeniem klasy BaseWidget
  constructor(element){
    super(element, settings.amountWidget.defaultValue); // przy dziedziczeniu ważne jest aby odwołać się do konstruktora klasy nadrzędnej poprzez wyrażenie super w którym podajemy argumenty konstruktora nadrzędnego przekształconego na nową klasę - tutaj wrapperem jest element, a początkową wartością drugi zdefiniowany argument
    const thisWidget = this;
    console.log('AmountWidget:', thisWidget);
    console.log('constructor arguments:', element);
    thisWidget.getElements(element);
    thisWidget.initActions();
  }

  getElements(){
    const thisWidget = this;
    
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  // Ponieważ metoda setValue posiada warunek, że przyjmuje tylko liczbowe wartości to nie pasuje nam do wszystkich widgetów w projekcie (np. do kalendarza)
  // Należy zatem stworzyć uniwersalną metodę którą będzie można przenieść do konstruktora klasy nadrzędnej
  // Każda z nich będzie przyjmować jeden argument - value
 
  /*parseValue(value){ // będzie wykorzystana do przekształcania tego co chcemy ustawić na odpowiedni typ lub format
    return parseInt(value); 
  } metoda ta jest identyczna jak w BaseWidget, więc nie musi tutaj być aktywna */

  isValid(value){// będzie ustalać prawdziwość lub fałsz zależnie od tego czy uzyskana wartość dla tego widgetu jest prawidłowa wg ustalonych kryteriów dla każdego widgetu
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  } // ta metoda została, ponieważ różni się od tej w BaseWidget i została napisana o dodatkowy kod

  renderValue(){//metoda ta służy temu, by bieżąca wartość widgetu została wyświetlona/wyrenderowana na stronie 
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.dom.input.value);
    });// Aby w tym przypadku nie korzystać z setValue korzystamy z gettera i settera -  są to metody które zostana automatycznie wykonane w momencie odczytania lub zmiany wartości dla jakiejś określonej właściwości instancji klasy 
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - settings.amountWidget.defaultValue);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + settings.amountWidget.defaultValue);
    });
  }
}

export default AmountWidget;