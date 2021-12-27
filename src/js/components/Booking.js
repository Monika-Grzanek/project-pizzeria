import {/*settings, classNames,*/ select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    const generateHTML = templates.bookingWidget;
    console.log('show booking generateHTML', generateHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    thisBooking.dom.peopleAmount = select.booking.peopleAmount;
    thisBooking.dom.hoursAmount = select.booking.hoursAmount;
  }

  initWidgets(){
    
  }
}


export default Booking;