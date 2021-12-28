class BaseWidget{
// w konstruktorze przyjmujemy 2 agrumenty: element dom danego widgetu oraz jego początkową wartość
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {}; // w tym obiekcie będziemy zapisywać wszystkie elementy dom 
    thisWidget.dom.wrapper = wrapperElement;
    
    thisWidget.correctValue = initialValue; // początkowa wartość widgetu została zapisana we właściwości value
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue; // trzeba było zamienić wszystkie nazwy z thisWidget.correctValue ponieważ wtedy otrzymalibyśmy nieskończoną pętlę (ta sama nazwa w nazwie get i w return)
  }

  set value(value){ // metoda setValue służy do ustawiania nowej wartości widgetu, pod warunkiem że jest to prawidłowa wartość (ze zdefiniowanego w kodzie zakresu)
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)){//ten fragment zostanie przeniesiony do metody isValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
      console.log('triggered announce');
      console.log('show change of quantity:', newValue);
      console.log('pokaż isNaN(newValue): ', isNaN(newValue));
    } 
    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  } // Dzięki tej metodzie nie musimy się martwić o to, że jakiś fragment kodu korzysta ze starej składni i nie będzie działać

  parseValue(value){ // będzie wykorzystana do przekształcania tego co chcemy ustawić na odpowiedni typ lub format
    return parseInt(value); 
  }

  isValid(value){// będzie ustalać prawdziwość lub fałsz zależnie od tego czy uzyskana wartość dla tego widgetu jest prawidłowa wg ustalonych kryteriów dla każdego widgetu
    return !isNaN(value);
  }

  renderValue(){//metoda ta służy temu, by bieżąca wartość widgetu została wyświetlona/wyrenderowana na stronie 
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  } // ponieważ szablon widgetu nie wie czy będzie w nim input czy nie zamiast input.value będzie nadpisywał zawartość wrappera tego widgetu

  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  } //metoda ta nie zawiera żadnych specyficznych informacji dla AmountWidget więc można było w całości ją tutaj przenieść
}

export default BaseWidget;