import { html, signal, useEffect } from '../../deps/htm-preact.js';
import { getConfig, loadStyle } from '../../utils/utils.js';

const { miloLibs, codeRoot } = getConfig();
loadStyle(`${codeRoot}/deps/caas.css`);

const metrics = {
  prevQuestion: null,
  prevAnswer: null,
  currentQuestion: null,
  currentAnswer: null,
  nextQuestion: null,
  nextAnswer: null,
};

let questionsData = {}
let stringsData = {}
let resultsData = {}


const QUESTIONS_EP_NAME = 'questions.json';
const STRINGS_EP_NAME = 'strings.json';
const RESULTS_EP_NAME = 'results.json';

export const userJourney = signal(metrics);

export default function init(el) {
  const link = el.querySelector(':scope > div > div > a');
  window.milo = window.milo || {}
  window.milo.quizConfigPath = link.text.toLowerCase();
  fetchQuestionsData(el);
}

// Get initial quiz data
async function fetchQuestionsData(el) {
  await fetch(window.milo.quizConfigPath + QUESTIONS_EP_NAME)
    .then((resp) => {
      if (!resp.ok) return {};
      const json = resp.json();
      collectQuestions(el, json);
    })
    .then(() => {
      // Do nothing
    });
}

// Get initial quiz data
async function fetchStringsData(el) {
  fetch(window.milo.quizConfigPath + STRINGS_EP_NAME).then((stringsResponse) => {
    // if (!stringsResponse.ok) return {};
    const stringsData = stringsResponse.json();
    collectStrings(el, stringsData);
  });
}

const collectStrings = (el, stringsData) => {
  stringsData.then((data) => {
    stringsData = data;
    const object = data.questions.data.find((o) => o.q === userJourney.value.currentQuestion.questions);
    decorateBlockForeground(el, object)
  })
};

// Gather all questions
const collectQuestions = (el, response) => {
  // If there is no questions, the data is malformed.
  // console.log('response in collectQuestions', typeof response);

  response.then((resp) => {
    questionsData = resp;
    if (!resp.questions) {
      console.log('Malformed data. Questions must be defined');
    }

    // const questions = resp.questions.data;
    // Lets set the first question as current question.
    // Previous and next question will be null.
    userJourney.value.currentQuestion = resp.questions.data[0];
    console.log('Current question is', resp.questions);
    console.log('user journey after collecting the first question: ', userJourney.value.currentQuestion);

    el.classList.add('quiz-container');
    const children = el.querySelectorAll(':scope > div');
    if (children.length > 0) {
      children[0].classList.add('background');
      decorateBlockBg(children[0]);
    }
    fetchStringsData(el);
  });
};

const decorateBlockBg = (node) => {
  const backgroundElemTpl = `<div data-valign="middle">
  <picture>
    <source type="image/webp" srcset="${userJourney.value.currentQuestion.background}" media="(min-width: 400px)">
    <source type="image/webp" srcset="${userJourney.value.currentQuestion.background}" >
    <source type="image/png" srcset="${userJourney.value.currentQuestion.background}"  media="(min-width: 400px)">
    <img loading="eager" alt="" type="image/png" src="${userJourney.value.currentQuestion.background}"  width="750" height="375">
  </picture>
</div>`;

  node.innerHTML = backgroundElemTpl; // Adding the background image for the quiz block.
};

const decorateBlockForeground = (el, object) => {
  const foregroundElemTpl = `<div class="foreground container">
  <div data-valign="middle" class="text" daa-lh=${object.heading}>
    <h2 id="heading-xl-marquee-standard-medium-left" class="heading-XL">
    ${object.heading}
    </h2>
    <p class="detail-L">${object.subhead}</p>
  </div>
</div>`;
  el.insertAdjacentHTML('beforeend', foregroundElemTpl); // Adding foreground elements.

  // Lets create the options.
  // Find optioons for the current questions.
  findAndInsertOptions(el);

  // console.log('user journey after foreground decor is done: ', userJourney.value)
};

const findAndInsertOptions = (el) => {
  
  console.log('questionsData : ', JSON.parse(JSON.stringify(questionsData)));
  const hamaraData = JSON.parse(JSON.stringify(questionsData));

  console.log('hamaradata : ' , hamaraData);
  const currQuestion = userJourney.value.currentQuestion.questions;
  const currentQuestionOptions = hamaraData[currQuestion].data;
  console.log('currentQuestionOptions data' , currentQuestionOptions)
  

  el.insertAdjacentHTML('beforeend', quizOption); // Adding quiz options.
}


const createOption = (optionsData) => {
  optionsData.map((data) => {

  })
}


export const quizOption = (currentQuestionOptions) => { 
  
  return `
<div class="milo-card-wrapper consonant-Wrapper consonant-Wrapper--1200MaxWidth">
  <div class="consonant-Wrapper-inner">
    <div class="consonant-Wrapper-collection">
      <div class="consonant-CardsGrid consonant-CardsGrid--5up consonant-CardsGrid--with4xGutter">


        // TODO: Need to make this dynamic.
        ${currentQuestionOptions.map(option => html`<div class="Chintu">Arshad Miyan</div>`)}

          <div class="card half-card border consonant-Card consonant-OneHalfCard">
            <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);">
            </div>
            <div class="consonant-OneHalfCard-inner">
              <div data-valign="middle">  
                <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
                <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              </div>
            </div>
          </div>
          <div class="card half-card border consonant-Card consonant-OneHalfCard">
            <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);">
            </div>
            <div class="consonant-OneHalfCard-inner">
              <div data-valign="middle">  
                <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
                <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              </div>
              
            </div>
          </div>
          <div class="card half-card border consonant-Card consonant-OneHalfCard">
            <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);">
            </div>
            <div class="consonant-OneHalfCard-inner">
              <div data-valign="middle">  
                <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
                <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              </div>
            </div>
          </div>

          <div class="card half-card border consonant-Card consonant-OneHalfCard">
            <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);">
            </div>
            <div class="consonant-OneHalfCard-inner">
              <div data-valign="middle">  
                <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
                <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              </div>
            </div>
          </div>


          <div class="card half-card border consonant-Card consonant-OneHalfCard">
            <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);">
            </div>
            <div class="consonant-OneHalfCard-inner">
              <div data-valign="middle">  
                <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
                <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  </div>
`};
