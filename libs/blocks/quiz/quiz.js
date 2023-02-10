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

const QUESTIONS_EP_NAME = 'questions.json';
const STRINGS_EP_NAME = 'strings.json';
const RESULTS_EP_NAME = 'results.json';

export const userJourney = signal(metrics);

export default function init(el) {
  const link = el.querySelector(':scope > div > div > a');
  const quizConfigPath = link.text.toLowerCase();
  fetchQuestionsData(el, quizConfigPath);
  // fetchStringsData(el, quizConfigPath); // Call Strings data only after the questions data loads.
}

// Get initial quiz data
async function fetchQuestionsData(el, quizConfigPath) {
  await fetch(quizConfigPath + QUESTIONS_EP_NAME)
    .then((resp) => {
      if (!resp.ok) return {};
      const json = resp.json();
      collectQuestions(el, json);
      // return json;
    })
    .then(() => {
      // fetch strings data only after the question data is loaded.
      fetchStringsData(el, quizConfigPath);
    });
}

// Get initial quiz data
async function fetchStringsData(el, quizConfigPath) {
  fetch(quizConfigPath + STRINGS_EP_NAME).then((stringsResponse) => {
    // if (!stringsResponse.ok) return {};
    const stringsData = stringsResponse.json();
    // console.log('strings data', stringsData);
    collectStrings(el, stringsData);
  });

  // return stringsData;
}

const collectStrings = (el, stringsData) => {
  stringsData.then((data) => {
    console.log('chompa', data)
    const object = data.questions.data.find(
      (o) => o.q === userJourney.value.currentQuestion.questions
    );
    userJourney.value.currentQuestion = object
    console.log('user journey in collecting strings', userJourney.value.currentQuestion.heading);
  })
  
  
  // userJourney.value.currentQuestion.heading = stringsData
  // userJourney.value.currentQuestion.subhead =
  // userJourney.value.currentQuestion.btn =
};

// Gather all questions
const collectQuestions = (el, response) => {
  // If there is no questions, the data is malformed.
  // console.log('response in collectQuestions', typeof response);

  response.then((resp) => {
    console.log('promise is ', resp);
    if (!resp.questions) {
      console.log('Malformed data. Questions must be defined');
    }

    // const questions = resp.questions.data;
    // Lets set the first question as current question.
    // Previous and next question will be null.
    userJourney.value.currentQuestion = resp.questions.data[0];
    // console.log('Current question is', response.questions);
    // console.log('user journey', userJourney.value.currentQuestion);

    el.classList.add('quiz-container');
    const children = el.querySelectorAll(':scope > div');
    if (children.length > 0) {
      children[0].classList.add('background');
      decorateBlockBg(children[0]);
    }

    decorateBlockForeground(el);
  });
};

const decorateBlockBg = (node) => {
  const backgroundElemTpl = `<div data-valign="middle">
  <picture>
    <source type="image/webp" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)">
    <source type="image/webp" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=750&amp;format=webply&amp;optimize=medium">
    <source type="image/png" srcset="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)">
    <img loading="eager" alt="" type="image/png" src="./media_1b2111891fc6836011dc3d527c6999c59e792ed70.png?width=750&amp;format=png&amp;optimize=medium" width="750" height="375">
  </picture>
</div>`;

  node.innerHTML = backgroundElemTpl; // Adding the background image for the quiz block.
};

const decorateBlockForeground = (el) => {
  const foregroundElemTpl = `<div class="foreground container">
  <div data-valign="middle" class="text" daa-lh=${userJourney.value.currentQuestion.questions}>
    <h2 id="heading-xl-marquee-standard-medium-left" class="heading-XL">
    ${console.log('in html', userJourney.value.currentQuestion.questions)}
    
    </h2>
    <!-- <p class="detail-L">${userJourney.value.currentQuestion.subhead}</p> -->
    Pick up to three. 
  </div>
</div>`;
  el.insertAdjacentHTML('beforeend', foregroundElemTpl); // Adding foreground elements.
  el.insertAdjacentHTML('beforeend', quizOption); // Adding quiz options.
};

export const quizOption = `
<div class="milo-card-wrapper consonant-Wrapper consonant-Wrapper--1200MaxWidth"><div class="consonant-Wrapper-inner"><div class="consonant-Wrapper-collection"><div class="consonant-CardsGrid consonant-CardsGrid--4up consonant-CardsGrid--with4xGutter"><div class="card half-card border consonant-Card consonant-OneHalfCard">
          
        <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);"></div><div class="consonant-OneHalfCard-inner">
            <div data-valign="middle">
              
              <h3 id="lorem-ipsum-dolor-sit-amet" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
              <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              
            </div>
          <div class="consonant-CardFooter"><div class="consonant-CardFooter-row" data-cells="2"><div class="consonant-CardFooter-cell consonant-CardFooter-cell--left"><a href="https://business.adobe.com/" class="con-button outline">Sign up</a></div><div class="consonant-CardFooter-cell consonant-CardFooter-cell--right"><a href="https://business.adobe.com/" class="con-button blue">Learn more</a></div></div></div></div></div><div class="card half-card border consonant-Card consonant-OneHalfCard">
          
        <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);"></div><div class="consonant-OneHalfCard-inner">
            <div data-valign="middle">
              
              <h3 id="lorem-ipsum-dolor-sit-amet-1" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
              <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              
            </div>
          <div class="consonant-CardFooter"><div class="consonant-CardFooter-row" data-cells="2"><div class="consonant-CardFooter-cell consonant-CardFooter-cell--left"><a href="https://business.adobe.com/" class="con-button outline">Sign up</a></div><div class="consonant-CardFooter-cell consonant-CardFooter-cell--right"><a href="https://business.adobe.com/" class="con-button blue">Learn more</a></div></div></div></div></div><div class="card half-card border consonant-Card consonant-OneHalfCard">
          
        <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);"></div><div class="consonant-OneHalfCard-inner">
            <div data-valign="middle">
              
              <h3 id="lorem-ipsum-dolor-sit-amet-2" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
              <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              
            </div>
          <div class="consonant-CardFooter"><div class="consonant-CardFooter-row" data-cells="2"><div class="consonant-CardFooter-cell consonant-CardFooter-cell--left"><a href="https://business.adobe.com/" class="con-button outline">Sign up</a></div><div class="consonant-CardFooter-cell consonant-CardFooter-cell--right"><a href="https://business.adobe.com/" class="con-button blue">Learn more</a></div></div></div></div></div><div class="card half-card border consonant-Card consonant-OneHalfCard">
          
        <div class="consonant-OneHalfCard-img" style="background-image: url(&quot;https://main--milo--adobecom.hlx.page/drafts/rclayton/media_138263efad88faf6be71169bc1fc66ee2dfb96661.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;);"></div><div class="consonant-OneHalfCard-inner">
            <div data-valign="middle">
              
              <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">Lorem ipsum dolor sit amet</h3>
              <p class="consonant-OneHalfCard-text">Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
              
            </div>
          <div class="consonant-CardFooter"><div class="consonant-CardFooter-row" data-cells="2"><div class="consonant-CardFooter-cell consonant-CardFooter-cell--left"><a href="https://business.adobe.com/" class="con-button outline">Sign up</a></div><div class="consonant-CardFooter-cell consonant-CardFooter-cell--right"><a href="https://business.adobe.com/" class="con-button blue">Learn more</a></div></div></div></div></div></div></div></div></div>
    `;
