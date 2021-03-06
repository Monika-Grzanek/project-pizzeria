import {settings, classNames,select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import { utils } from '../utils.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.tableList = [];
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData(); // będzie pobierać dane z API używając adresów z parametrami filtrującymi wyniki
  
  }

  getData(){
    const thisBooking = this;

    const startDateParams = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParams = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParams,
        endDateParams,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParams,
        endDateParams,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParams,
      ],
    };

    console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'), // posiada adres endpointu API, który zwraca listę rezerwacji
      eventsCurrent: settings.db.url + '/' + settings.db.event +   '?' + params.eventsCurrent.join('&'), // analogicznie zwróci listę wydarzeń jednorazowych
      eventsRepeat:  settings.db.url + '/' + settings.db.event +   '?' + params.eventsRepeat.join('&'), // analogicznie zwróci listę wydarzeń cyklicznych
    };
    console.log('urls', urls);

    //Odpowiedź na nasze zapytania od API możemy otrzymać w różnej kolejności, przez co niektóre funkcje mogą się uruchomić przed uzyskaniem odpowiedzi
    // Aby temu zapobiec stosowana jest funkcja fetch

    Promise.all([ // zadaniem metody Promise.all jest wykonanie zestawu operacji zawartych w tablicy, a po ich wykonaniu zostanie wykonana meotda then
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),  
    ])
      .then(function(allResponses) {
        const bookingResponse = allResponses[0]; // oznacza to że z całej tablicy zostanie wyciągnięty pierwszy element
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),// zwraca tylko sparsowane wyniki rezerwacji
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]); 
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        console.log('show bookings: ', bookings);
        console.log('show eventsCurrent: ', eventsCurrent);
        console.log('show eventsRepeat: ', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      console.log('hourBlock', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        && 
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) 
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();
    console.log('show booking generateHTML', generateHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = element.querySelector(select.booking.tablesWrapper);
    thisBooking.dom.form = element.querySelector(select.booking.form);
  }

  initWidgets(){
    const thisBooking = this;
    
    thisBooking.amountWidget = [];

    thisBooking.amountWidget.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      thisBooking.removeTableSelection();
    });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function(){
      thisBooking.removeTableSelection();
    });
    
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.removeTableSelection();
    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function(){
      thisBooking.removeTableSelection();
    });
    
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.initTable(event);
    });

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initTable(event){
    const thisBooking = this;

    const newTable = event.target;
    const clickedTable = newTable.classList.contains(classNames.booking.table);
    const bookedTable = newTable.classList.contains(classNames.booking.tableBooked);
    const selectTable = newTable.classList.contains(classNames.booking.tableSelected);
    const tableDataId = newTable.getAttribute(classNames.attributes.attributeDateId);

    if(clickedTable && !bookedTable){
      thisBooking.removeTableSelection();    
      if(!selectTable){
        newTable.classList.toggle(classNames.booking.tableSelected);
        thisBooking.tableList = parseInt(tableDataId);
        console.log('show thisBooking.tableList', thisBooking.tableList);
      }
    } else {
      alert('Stolik jest zajęty!');
    }
  }

  removeTableSelection(){
    const thisBooking = this;

    for(const table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
    }
    thisBooking.tableList = [];
    console.log('show tableList', thisBooking.tableList);
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const formData = utils.serializeFormToObject(thisBooking.dom.form);
    console.log('formData Booking', formData);
    console.log('url Booking', url);
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.tableList),
      duration: parseInt(formData.hours),
      ppl: parseInt(formData.people),
      phone: formData.phone,
      address: formData.address,
      starters: []
    };
    console.log('payload', payload);

    payload.starters.push(formData.starter);

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
        console.log('parsedResponse Booking', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour,payload.duration,payload.table);
        console.log('thisBooking.booked: ', thisBooking.booked);
      }); 
  }
}


export default Booking;