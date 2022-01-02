import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';  
import Booking from './components/Booking.js';
import HomePage from './components/HomePage.js';

const app = {
  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    //w ten sposób znaleźliśmy kontenery poszczególnych stron, ale powinniśmy przechowywać kontenery poszczególnych podstron, czyli mieć wiele elementów, dlatego dodajemy 'children'
    // w ten sposób otrzymamy dzieci kontenera stron #pages
    // aby aktywowała się pierwsza z podstron używamy metody activatePage
    // metodę tą wywołamy na kontenerze stron i przekażemy pierwszy otrzymany element 
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    console.log('show idFromHash', idFromHash);

    let pageMatchingHash = thisApp.pages[0].id; // zmienna została zdefiniowana przed pętlą, ponieważ będzie potrzebna również po za pętlą
    for(let page of thisApp.pages){ //w tej pętli dlakażdej strony spawdzamy czy jej id jest równe id wydobytemu z hasha strony
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash); 
    // teraz musimy dodać nasłuchiwacz do każdego linku
    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this; //zazwyczaj w handlerze eventu wpisujemy definicję stałej w której zapisujemy obiekt this
        event.preventDefault();
        /* get id from href */
        const id = clickedElement.getAttribute('href').replace('#', ''); // ponieważ href zawiera #, którego nie zawiera id strony to musimy go zamienić na pusty ciąg znaków
        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);
        // Aby po odświeżeniu strony nie przenosiło nas do domyślnie ustawionej zakładki należy dodać funkcjonalność zmieny adresów url w zależności od podstrony na której aktualnie się znajdujemy
        /* change url hash */
        window.location.hash = '#/' + id; // aby po zmianie zakładki strona nie została przewinięta należy dodać po hashu '/'
      });
    }
  },

  activatePage: function(pageId) {
    const thisApp = this;

    //Funkcja ta powinna nadać odpowiedniemu wrapperowi klasę active
    // Powinna też wyróżninać zakładkę strony aktualnie wyświetlanej

    /* add class active to matching pages, remove from non-matching pages */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId); // w toggle pierwszym argumentem jest podanie nazwy klasy, a w drugim argumencie warunek jaki musi spełniać 
    }
    /* add class active to matching links, remove from non-matching links */
    for(let link of thisApp.navLinks){ // dla każdego z linków w thisApp.navLinks chcemy dodać lub usunąć klasę active w zależności od tego czy atrybut href tego linka jest równy id podanej podstrony
      link.classList.toggle(
        classNames.nav.active,   
        link.getAttribute('href') == '#' + pageId
      ); // w toggle pierwszym argumentem jest podanie nazwy klasy, a w drugim argumencie warunek jaki musi spełniać 
    }
  },

  initHome: function(){
    const thisApp = this;

    const homeContainer = document.querySelector(select.containerOf.home);
    thisApp.homePage = new HomePage(homeContainer);
    console.log('homeContainer', homeContainer);
  },

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

  initBooking: function(){
    const thisApp = this;

    const bookingContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingContainer);
  },

  initCarousel: function(){
    const thisApp = this;
    const elem = document.querySelector('.main-carousel');
    const flkty = new Flickity( elem, {
      // options
      cellAlign: 'left',
      contain: true
    });
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
    thisApp.initCarousel();
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


