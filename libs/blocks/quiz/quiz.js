import { html, signal, useEffect } from "../../deps/htm-preact.js";
// import quizcontainer from './quizcontainer.js'

const data = signal({});

export default function init(el) {
  // const app = html` <${quizcontainer} /> `;
  // render(app, el);
  const link = el.querySelector(':scope > div > div > a');
  console.log(link.text) // This is the url for the questions.
  fetchData(el, link)
}

const decorateBlockBg = (node) => {
  console.log('decorating bg', node)
  // node.classList.add('background');
  const backgroundElemTpl = `<div data-valign="middle">
  <picture>
    <source type="image/webp" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)">
    <source type="image/webp" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=750&amp;format=webply&amp;optimize=medium">
    <source type="image/png" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)">
    <img loading="eager" alt="" type="image/png" src="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=750&amp;format=png&amp;optimize=medium" width="750" height="375">
  </picture>
</div>`

node.innerHTML = backgroundElemTpl // Adding the background image for the quiz block.
};

const decorateBlockForeground = (el) => {
  console.log('decorating foreground')
  // node.classList.add('foreground');
  const foregroundElemTpl = `<div class="foreground container">
  <div data-valign="middle" class="text" daa-lh="What do you want to do today?">
  <h2 id="heading-xl-marquee-standard-medium-left" class="heading-XL">
  What do you want to do today?
  </h2>
    <p class="detail-M">Pick up to three.</p>

    <div class="milo-card-wrapper consonant-Wrapper consonant-Wrapper--1200MaxWidth"><div class="consonant-Wrapper-inner"><div class="consonant-Wrapper-collection"><div class="consonant-CardsGrid consonant-CardsGrid--3up consonant-CardsGrid--with4xGutter"><div class="card product-card border consonant-Card consonant-ProductCard">
          
        <div class="consonant-ProductCard-inner">
            <div data-valign="middle" class="consonant-ProductCard-row">
              
              <h3 id="lorem-ipsum-dolor-sit-amet" class="consonant-ProductCard-title">Lorem ipsum dolor sit amet</h3>
              
              
            </div>
          <p class="consonant-ProductCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p><div class="consonant-CardFooter"><div class="consonant-CardFooter-row" data-cells="2"><div class="consonant-CardFooter-cell consonant-CardFooter-cell--left"><a href="https://business.adobe.com/" class="con-button outline">Learn more</a></div><div class="consonant-CardFooter-cell consonant-CardFooter-cell--right"><a href="https://business.adobe.com/" class="con-button blue">Sign up</a></div></div></div></div></div></div></div></div></div>
    <p class="action-area"><a href="https://www.adobe.com/" class="con-button outline button-L button-justified-mobile" daa-ll="outline|Lorem ipsum 1">Lorem ipsum</a> <a href="https://www.adobe.com/" class="con-button blue button-L button-justified-mobile" daa-ll="filled|Learn more 2">Learn more</a> <a href="https://www.adobe.com/" daa-ll="link|Text link 3">Text link</a></p>
  </div>
</div>`

el.insertAdjacentHTML('beforeend', foregroundElemTpl) // Adding foreground elements.

};


// Get initial quiz data
async function fetchData(el, link) {
  const resp = await fetch(link.text.toLowerCase());

  if (!resp.ok) return {};

  const json = await resp.json();
  console.log(json)
  collectQuestions(el, json);
  return json;
}

// Gather all questions
const collectQuestions = (el, response) => {
  console.log('collecting questions');
  console.log(response.questions);
  el.classList.add('quiz-container')
  const children = el.querySelectorAll(':scope > div');
  if (children.length > 0) {
    children[0].classList.add('background');
    decorateBlockBg(children[0]);
  }

  decorateBlockForeground(el);
}






