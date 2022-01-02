import {/*settings, select, classNames,*/ templates} from './settings.js';

class HomePage{
  constructor(element){
    const thisHomePage = this;
    console.log(thisHomePage);

    thisHomePage.render(element);
  }

  render(element){
    const thisHomePage = this;
    const generateHTML = templates.homePage();
    console.log('show booking generateHTML', generateHTML);
    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generateHTML;
    console.log('thisHomePage.dom', thisHomePage.dom);
  }
}

export default HomePage;
