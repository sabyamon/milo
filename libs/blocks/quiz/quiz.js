import { html, signal, useEffect } from '../../deps/htm-preact.js';
// import quizcontainer from './quizcontainer.js'

const data = signal({});
const metrics = {
  prevQuestion : null,
  prevAnswer : null,
  currentQuestion: null,
  currentAnswer: null,
  nextQuestion: null,
  nextAnswer: null
}

export const userJourney = signal(metrics) 


export default function init(el) {
  // const app = html` <${quizcontainer} /> `;
  // render(app, el);
  const link = el.querySelector(':scope > div > div > a');
  console.log(link.text); // This is the url for the questions.
  fetchQuestionsData(el, link);
}

// Get initial quiz data
async function fetchQuestionsData(el, link) {
  const resp = await fetch(link.text.toLowerCase());

  if (!resp.ok) return {};

  const json = await resp.json();
  console.log(json);
  collectQuestions(el, json);
  return json;
}


// Gather all questions
const collectQuestions = (el, response) => {
  console.log('collecting questions');
  console.log(response.questions.data);

  // If there is no questions, the data is malformed.
  if (!response.questions) {
    console.log('Malformed data. Questions must be defined')
  }

  const questions = response.questions.data;
  console.log('user journey', userJourney.value);
  // Lets set the first question as current question.
  // Previous and next question will be null.
  userJourney.value.currentQuestion = response.questions.data[0];
  console.log('user journey', userJourney.value);

  el.classList.add('quiz-container');
  const children = el.querySelectorAll(':scope > div');
  if (children.length > 0) {
    children[0].classList.add('background');
    decorateBlockBg(children[0]);
  }

  decorateBlockForeground(el);
};


const decorateBlockBg = (node) => {
  console.log('decorating bg', node);
  // node.classList.add('background');
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
  console.log('decorating foreground');
  // node.classList.add('foreground');
  const foregroundElemTpl = `<div class="foreground container">
  <div data-valign="middle" class="text" daa-lh="What do you want to do today?">
  <h2 id="heading-xl-marquee-standard-medium-left" class="heading-XL">
  What do you want to do today?
  </h2>
    <p class="detail-L">Pick up to three.</p>
  </div>
</div>`;

console.log('quiz option', quizOption)
  el.insertAdjacentHTML('beforeend', foregroundElemTpl); // Adding foreground elements.
  el.insertAdjacentHTML('beforeend', quizOption); // Adding quiz options.
};

export const quizOption = `<div class="section 4-up">
Cards
    </div>`



