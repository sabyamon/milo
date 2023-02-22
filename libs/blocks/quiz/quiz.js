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

let next = []; // contains the next state.
// at the end it should have  only 'RESULT' remaining.

let currentSelections = [],
  maxSelections = 3, //TODO: Needs to be dynamic
  minSelections = 1; // TODO: Needs to be dynamic

let rootElement;

let questionsData = {};
let stringsData = {};
let resultsData = {};

const QUESTIONS_EP_NAME = 'questions.json';
const STRINGS_EP_NAME = 'strings.json';
const RESULTS_EP_NAME = 'results.json';

export const userJourney = signal(metrics);

export default function init(el) {
  rootElement = el;
  const link = el.querySelector(':scope > div > div > a');
  window.milo = window.milo || {};
  window.milo.quizConfigPath = link.text.toLowerCase();
  fetchQuestionsData();
}

// Get initial quiz data
async function fetchQuestionsData(questionId) {
  await fetch(window.milo.quizConfigPath + QUESTIONS_EP_NAME)
    .then((resp) => {
      if (!resp.ok) return {};
      const json = resp.json();
      collectQuestions(json, questionId);
    })
    .then(() => {
      // Do nothing
    });
}

// Get initial quiz data
async function fetchStringsData(el, questionIdentifier) {
  fetch(window.milo.quizConfigPath + STRINGS_EP_NAME).then(
    (stringsResponse) => {
      // if (!stringsResponse.ok) return {};
      const stringsData = stringsResponse.json();
      collectStrings(el, stringsData, questionIdentifier);
    }
  );
}

const collectStrings = (el, stringsDataPromise, questionIdentifier) => {
  console.log(
    'questionIdentifier while collecting strings:',
    questionIdentifier
  );
  stringsDataPromise.then((data) => {
    stringsData = data;
    const object = data.questions.data.find(
      (o) => o.q === userJourney.value.currentQuestion.questions
    );

    // console.log('finding strings data ::', object)
    userJourney.value.currentQuestion.heading = object.heading;
    userJourney.value.currentQuestion.subhead = object.subhead;

    // let heading;
    // let subheading;
    // stringsData.questions.data.forEach(el => {
    //   console.log('el is:', el);
    //   if (el.q === questionIdentifier) {
    //       heading = el.heading;
    //       subheading = el.subhead;
    //   }
    // })

    // console.log('global strings data', stringsData.questions.data)
    decorateBlockForeground(el);
  });
};

// Gather all questions
const collectQuestions = (response, questionIdentifier) => {
  // If there is no questions, the data is malformed.
  // console.log('response in collectQuestions', typeof response);

  console.log('questionIdentifier is:', questionIdentifier);
  // questionIdentifier = 'q-rather'

  response.then((resp) => {
    questionsData = resp;
    if (!resp.questions) {
      console.log('Malformed data. Questions must be defined');
    }

    if (questionIdentifier !== undefined) {
      resp.questions.data.forEach((q) => {
        if (q.questions === questionIdentifier) {
          userJourney.value.currentQuestion = q;
        }
      });
    } else {
      userJourney.value.currentQuestion = resp.questions.data[0];
    }

    // Find the parent element  `quiz` and treat that as the source of truth.
    // TODO: need better identifier of this element.

    rootElement.classList.add('quiz-container');

    const children = rootElement.querySelectorAll(':scope > div');
    if (children.length > 0) {
      children[0].classList.add('background');
      decorateBlockBg(children[0]);
    }
    fetchStringsData(rootElement, questionIdentifier);
  });
};

const decorateBlockBg = (node) => {
  console.log('u journey in decorating bg', userJourney.value.currentQuestion);
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

const decorateBlockForeground = (el) => {
  // console.log('u journey while painting foreground: ', userJourney.value)
  const foregroundElemTpl = `<div class="foreground container">
  <div data-valign="middle" class="text" daa-lh="${userJourney.value.currentQuestion.heading}">
    <h2 id="heading-xl-marquee-standard-medium-left" class="heading-XL">
    ${userJourney.value.currentQuestion.heading}
    </h2>
    <p class="detail-L">${userJourney.value.currentQuestion.subhead}</p>
  </div>
</div>`;
  el.insertAdjacentHTML('beforeend', foregroundElemTpl); // Adding foreground elements.

  // Lets create the options.
  // Find optioons for the current questions.
  findAndInsertOptions(el);
};

const findAndInsertOptions = (el) => {
  // console.log('questionsData while creating options : ', JSON.parse(JSON.stringify(questionsData)));
  const hamaraData = JSON.parse(JSON.stringify(questionsData));
  const currQuestion = userJourney.value.currentQuestion.questions;
  const currentQuestionOptions = hamaraData[currQuestion].data;
  console.log('currentQuestionOptions :: ', currentQuestionOptions);

  el.insertAdjacentHTML('beforeend', quizOption(currentQuestionOptions)); // Adding quiz options.

  const quizOptionElems = document.querySelectorAll(
    '.quiz-options-container > div'
  );

  Array.from(quizOptionElems).forEach(function (element) {
    element.addEventListener('click', (event) => handleOptionSelection(event));
  });

  const nextBtn = document.querySelectorAll('.quiz-btn')[0];
  nextBtn.addEventListener('click', (event) => handleNext(event));

  console.log('Lets see the user journey : ', userJourney.value);
};

const handleOptionSelection = (event) => {
  const clickedElem = event.target;
  const clickedCard = clickedElem.closest('.quiz-option');
  const clickedCardName = clickedCard.dataset.cardName;

  // Add selected attribute to the cards that are selected.

  if (clickedCard.classList.contains('selected')) {
    clickedCard.classList.remove('selected');
    currentSelections = currentSelections.filter(
      (item) => item !== clickedCardName
    ); // Remove the item from the current selections

    const allCards = document.querySelectorAll('.quiz-option');
    allCards.forEach((card) => {
      if (card.classList.contains('disabled')) {
        card.classList.remove('disabled');
      }
    });
  } else {
    currentSelections.push(clickedCardName); // Add selections data to an array
    clickedCard.classList.add('selected');
    if (currentSelections.length === maxSelections) {
      // Find all the cards which do not have `selected` class in it and add a disabled option to it.
      const allCards = document.querySelectorAll('.quiz-option');
      allCards.forEach((card) => {
        if (!card.classList.contains('selected')) {
          card.classList.add('disabled');
        }
      });
    }
  }

  const quizNextBtn = document.querySelectorAll('.quiz-btn')[0];
  if (currentSelections.length >= minSelections) {
    quizNextBtn.removeAttribute('disabled');
  } else {
    quizNextBtn.setAttribute('disabled', 'true');
  }

  console.log('currentSelections are : ', currentSelections);
};

/**
 * Handles the behavior of the next button.
 */
const handleNext = () => {
  // Reset maxSelections
  // Reset minSelections
  // Reset currentSelections
  console.log('clicked next');
  // find the next paths by popping elements from currentSelections.
  // Lets create the next array.
  currentSelections.forEach((selection) => {
    // for each elem in current selection, find its coresponding next element and push it to the next array.
    const currQuestion = userJourney.value.currentQuestion.questions;
    const nextElemArr = questionsData[currQuestion].data;
    nextElemArr.forEach((nextItem) => {
      if (nextItem.options === selection) {
        const nextArr = nextItem.next;
        const arr = nextArr.split(',');
        arr.forEach((elem) => {
          if (!next.includes(elem)) {
            next.push(elem);
          }
        });
      }
    });

    console.log('current question is :', currQuestion);
    console.log('next elem for curr question is: ', next);

    // Call fetchQuestionsData(n) and remove that element from next array.
    const shifted = next.shift();
    console.log('calling flow for :: ', shifted);
    // rootElement.innerHTML = ''; // values were not updating. Hence cleared out the data. TODO: Need to check again
    const foregroundEl = rootElement.querySelectorAll('.foreground')[0].remove();
    const optionsContainer = rootElement.querySelectorAll('.milo-card-wrapper')[0].remove();
    fetchQuestionsData(shifted);
  });
};

const createOption = (optionsData) => {
  let domElem = '';
  for (let index in optionsData) {
    const cardData = optionsData[index];
    domElem =
      domElem +
      `<div class="card half-card border consonant-Card consonant-OneHalfCard quiz-option" data-card-name="${cardData.options}">
              <div class="consonant-OneHalfCard-image">
                <img src="https://www.adobe.com/content/dam/cc/Images/app-recommender/multi-select/2-Video%20ICON.svg" alt="Video" class="icon">
              </div>
              <div class="consonant-OneHalfCard-inner">
                <div data-valign="middle">  
                  <h3 id="lorem-ipsum-dolor-sit-amet-3" class="consonant-OneHalfCard-title">${cardData.options}</h3>
                  <p class="consonant-OneHalfCard-text">Edit or organize</p>
                </div>
              </div>
            </div>`;
  }

  return domElem;
};

export const quizOption = (currentQuestionOptions) => {
  let option = '';
  option = createOption(currentQuestionOptions);
  console.log('option is : ', option);
  return `
    <div class="milo-card-wrapper consonant-Wrapper consonant-Wrapper--1200MaxWidth">
      <div class="consonant-Wrapper-inner">
        <div class="consonant-Wrapper-collection">
          <div class="consonant-CardsGrid consonant-CardsGrid--5up consonant-CardsGrid--with4xGutter quiz-options-container">
            ${option}
            </div>
          </div>
          <div class="quiz-button-container">
            <button disabled="true" aria-label="Next" data-quiz-button="" class="spectrum-Button spectrum-Button--outline spectrum-Button--sizeXL quiz-btn" daa-ll="Filters|cc:app-reco|Q#1/Photo">
              <span class="quiz-Button-label">Next</span>
            </button>
          </div>
        </div>
      </div>`;
};
